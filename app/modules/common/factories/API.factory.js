angular.module('common')
.factory('API', (Base, CustomAPI, Loader, localStorageService, User, $location, $q, $timeout, $window,LocaleService) => {

    let authInfo = {}
    let myCUI = {}

    Base.authInfo = authInfo

    const populateUserInfo = (info, redirectOpts) => {
        const deferred = $q.defer()
        let userInfo, roleList, entitlementList
        authInfo = info
        User.set(info)

        $q.all([
            myCUI.getPersonRoles({ personId: authInfo.cuid }),
            myCUI.getPersonEntitlements({ personId: authInfo.cuid }),
            myCUI.getPerson({ personId: authInfo.cuid })
        ])
        .then(res => {
            roleList = res[0].map(x => x.name)
            User.setRoles(roleList)

            entitlementList = res[1].map(x => x.privilegeName)
            User.setEntitlements(entitlementList)

            userInfo = res[2]
            LocaleService.setLocaleByDisplayName(appConfig.languages[userInfo.language])
            return myCUI.getOrganizationWithAttributes({ organizationId: res[2].organization.id })
        })
        .then(res => {
            userInfo.organization = res
            User.set(userInfo)
            //cui.log('populateUserInfo', User);
            //get user notification related information  as lazy loading,
            // No need to hold entire UI apps for this loading.
            getNotificationDetails(userInfo)
            deferred.resolve({ roleList: roleList, redirect: redirectOpts })
        })

        return deferred.promise
    }

    const getNotificationDetails = (userInfo) => {
        if (!Base.canGrantAppToUser()) {
            myCUI.getPersonPendingApps({personId: userInfo.id})
            .then((res) => {
                userInfo.pendingApps=res.map(x=> x.name)
                User.set(userInfo)
            })
        }
        else{
            $q.all([
                myCUI.getRegistrationRequestsCount(),
                myCUI.getPackageRequestsCount(),
                myCUI.getOrgRegistrationRequestsCount(),
                myCUI.getPackageRequestsCount({qs:[['requestor.id',userInfo.organization.id],['requestor.type','organization']]})
            ])
            .then(res => {
                userInfo.userRegistrationRequestsCount=res[0]
                userInfo.userAppRequestsCount=res[1]
                userInfo.orgRegistrationRequestsCount=res[2]
                userInfo.orgAppRequestsCount=res[3]
                userInfo.totalCount=res[0]+res[1]+res[2]+res[3]
                User.set(userInfo)
            })
        }
        
    }
    const jwtAuthHandler = () => {
        return myCUI.covAuth({
            originUri: appConfig.originUri,
            authRedirect: window.location.href.split('#')[0] + '#/auth',
            appRedirect: $location.path()
        })
    }

    const initApi = () => {
        let deferred = $q.defer()
        Loader.onFor('wholeApp','custom-api-loading')
        cui.api({
            retryUnseured: true,
            envDefs: ['https://cuijs.run.covisintrnd.com/defs/env.json'],
            dataCallDefs: [
                'https://cuijs.run.covisintrnd.com/defs/auth.json',
                'app/json/idm-call-defs.json',
                CustomAPI
            ]
        })
        .then((cuiObject) => {
            if (appConfig.logoutUrl) {
                Base.logout = () => {
                    myCUI.covLogout({
                        redirect: appConfig.logoutUrl,
                        qs: [['type', 'logout']]
                    })
                }    
            }
            else Base.logout = cuiObject.covLogout
            angular.copy(cuiObject, myCUI)
            myCUI.setAuthHandler(jwtAuthHandler)
            // overwrite the service url to get the solution instance id
            appConfig.solutionInstancesUrl && myCUI.setServiceUrl(appConfig.solutionInstancesUrl)
            return myCUI.covAuthInfo({originUri: appConfig.originUri})
        })
        .then(() => {
            // reset the service url
            appConfig.debugServiceUrl
                ? myCUI.setServiceUrl(appConfig.debugServiceUrl)
                : myCUI.setServiceUrl(appConfig.serviceUrl)
            $timeout(() => Loader.offFor('wholeApp'), 50)
            deferred.resolve()
        })
        return deferred.promise
    }

    let apiFactory = {
        cui: myCUI,
        getUser: User.get,
        setUser: User.set,
        setPersonData: User.setPersonData,
        getPersonData: User.getPersonData,
        user: User.user,
        initApi,
        authenticateUser: (redirectOpts) => {
            const deferred = $q.defer()
            const sessionInfo = myCUI.getCovAuthInfo()

            if (redirectOpts.toState.name!=='auth') {
                localStorageService.set('appRedirect',redirectOpts) // set the redirect to whatever the last state before auth was
                Loader.onFor('wholeApp','redirecting-to-sso') // don't need to turn this loader off since covAuth takes us to another page
                appConfig.solutionInstancesUrl && myCUI.setServiceUrl(appConfig.solutionInstancesUrl)
                jwtAuthHandler() // force redirect to SSO
            }
            else {
                Loader.onFor('wholeApp','getting-user-info')
                myCUI.handleCovAuthResponse({ selfRedirect: true })
                .then(res => {
                    populateUserInfo(res,localStorageService.get('appRedirect'))
                    .then(res => {
                        deferred.resolve(res)
                        $timeout(()=> Loader.offFor('wholeApp'),50)
                    })
                })
            }
            return deferred.promise
        },
        setAuthInfo: function(newAuthInfo) {
            angular.copy(newAuthInfo[0], authInfo)
        },
        authInfo: authInfo
    }

    return apiFactory

})
