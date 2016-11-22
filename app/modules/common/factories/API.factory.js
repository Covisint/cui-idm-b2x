angular.module('common')
.factory('API', (Base, CustomAPI, Loader, localStorageService, User, $location, $q, $timeout, $window) => {

    let authInfo = {}
    let myCUI = {}

    Base.authInfo = authInfo

    const populateUserInfo = (info, redirectOpts) => {
        const deferred = $q.defer()
        let userInfo, roleList
        authInfo = info
        User.set(info)

        /*
            Note for the future developer!

            Currently we are getting the logged in user's roles and setting them as entitlements.
            In a downstream project that got ahead of B2X, we had to get both roles and entitlements.
            This has not been updated in B2X yet due to endpoint issues.

            The User factory has been updated to support both roles and entitlements and the custom
            endpoint to get the user's entitlements has also been written in the CustomAPI factory.

            When the endpoints are working you will need to implement: 

                1. Add the "myCUI.getPersonEntitlements({ personId: authInfo.cuid })" to the $q.all([])
                2. For the roles response:
                    - const roleList = res[0].map(x => x.name)
                    - User.setRoles(roleList)
                3. For the entitlements response:
                    - const entitlementList = res[2].map(x => x.privilegeName)
                    - User.setEntitlements(entitlementList)

                Note: 
                The res[] index might be different depending on how you set up the $q.all[].
                You will also have to confirm that the API response has not been changed.

                This is needed to work in conjunction with cui-access to allow users to view parts
                of the application depending on either their roles or entitlements which has also been
                implemented in at least one downstream project but not B2X.
        */

        $q.all([
            myCUI.getPersonRoles({ personId: authInfo.cuid }),
            myCUI.getPerson({ personId: authInfo.cuid })
        ])
        .then(res => {
            roleList = res[0].map(x => x.name)
            User.setEntitlements(roleList)
            userInfo = res[1]
            return myCUI.getOrganization({ organizationId: res[1].organization.id })
        })
        .then(res => {
            userInfo.organization = res
            User.set(userInfo)
            deferred.resolve({ roleList, redirect: redirectOpts })
        })

        return deferred.promise
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
