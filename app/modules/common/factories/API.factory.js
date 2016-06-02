angular.module('common')
.factory('API',['$state','User','$rootScope','$window','$location','CustomAPI','$q','localStorageService','Loader','$timeout','Base',
($state,User,$rootScope,$window,$location,CustomAPI,$q,localStorage,Loader,$timeout,Base) => {

    let authInfo = {},
        myCUI = {};

    Base.authInfo = authInfo;

    const populateUserInfo = (info,redirectOpts) => {
        authInfo = info;
        const deferred = $q.defer();
        User.set(info);
        myCUI.getPersonRoles({ personId: authInfo.cuid })
        .then((res) => {
            const roleList = res.map(x => x.name);
            User.setEntitlements(roleList);
            deferred.resolve({ roleList, redirect:redirectOpts }); // we only need the roles to resolve the state, the user's name can come later
        });

        myCUI.getPerson({ personId: authInfo.cuid })
        .then((res) => {
            User.set(res);
        });
        return deferred.promise;
    };

    const jwtAuthHandler = () => {
        return myCUI.covAuth({
            originUri: appConfig.originUri,
            authRedirect: window.location.href.split('#')[0] + '#/auth',
            appRedirect: $location.path()
        });
    };

    const initApi = () => {
        let deferred = $q.defer();
        Loader.onFor('wholeApp','custom-api-loading');
        cui.api({
            retryUnseured: true,
            envDefs: ['https://cuijs.run.covisintrnd.com/defs/env.json'],
            dataCallDefs: [
                'https://cuijs.run.covisintrnd.com/defs/auth.json',
                'https://cuijs.run.covisintrnd.com/defs/idm.json',
                CustomAPI
            ]
        })
        .then((cuiObject) => {
            Base.logout = cuiObject.covLogout;
            angular.copy(cuiObject, myCUI);
            myCUI.setServiceUrl(appConfig.serviceUrl);
            myCUI.setAuthHandler(jwtAuthHandler);
            $timeout(()=> Loader.offFor('wholeApp'),50);
            deferred.resolve();
        });
        return deferred.promise;
    };

    let apiFactory = {
        cui: myCUI,
        getUser: User.get,
        setUser: User.set,
        setPersonData: User.setPersonData,
        getPersonData: User.getPersonData,
        user: User.user,
        initApi,
        handleStateChange: (redirectOpts) => {
            const deferred = $q.defer();
            const sessionInfo = myCUI.getCovAuthInfo();
            if(redirectOpts.toState.name!=='auth') {
                localStorage.set('appRedirect',redirectOpts); // set the redirect to whatever the last state before auth was
                Loader.onFor('wholeApp','getting-user-info');
                populateUserInfo(sessionInfo,redirectOpts) // if there's no session info stored this will force a 401 on getPerson, which will trigger cui's auth handler
                .then((res) => {
                    deferred.resolve(res);
                    $timeout(()=> Loader.offFor('wholeApp'),50);
                });
            }
            else {
                if(!redirectOpts.toParams.cuid) {
                    deferred.resolve( { redirect:redirectOpts, roleList: User.getEntitlements() } );
                }
                else {
                    Loader.onFor('wholeApp','getting-user-info');
                    myCUI.handleCovAuthResponse({selfRedirect:true})
                    .then((res)=>{
                        populateUserInfo(res,localStorage.get('appRedirect'))
                        .then((res) => {
                            deferred.resolve(res);
                            $timeout(()=> Loader.offFor('wholeApp'),50);
                        });
                    });
                }
            }

            return deferred.promise;
        },
        setAuthInfo: function(newAuthInfo) {
            angular.copy(newAuthInfo[0], authInfo);
        },
        authInfo: authInfo
    };

    return apiFactory;

}]);