angular.module('common')
.factory('API',['$state','User','$rootScope','$window','$location','CustomAPI','$q','localStorageService','Loader','$timeout',
($state,User,$rootScope,$window,$location,CustomAPI,$q,localStorage,Loader,$timeout) => {

    let authInfo = {},
        myCUI = window.initializedCustomCui;

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
            angular.copy(res, User.user);
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

    myCUI.setServiceUrl(appConfig.serviceUrl);
    myCUI.setAuthHandler(jwtAuthHandler);


    let apiFactory = {
        cui: myCUI,
        getUser: User.get,
        setUser: User.set,
        setPersonData: User.setPersonData,
        getPersonData: User.getPersonData,
        user: User.user,
        handleStateChange: (redirectOpts) => {
            const deferred = $q.defer();
            const sessionInfo = myCUI.getCovAuthInfo();
            if(redirectOpts.toState.name!=='auth') {
                localStorage.set('appRedirect',redirectOpts); // set the redirect to whatever the last state before auth was
                Loader.onFor('userDetails','getting-user-info');
                populateUserInfo(sessionInfo,redirectOpts) // if there's no session info stored this will force a 401 on getPerson, which will trigger cui's auth handler
                .then((res) => {
                    deferred.resolve(res);
                    $timeout(()=> Loader.offFor('userDetails'),50);
                });
            }
            else {
                if(!redirectOpts.toParams.cuid) {
                    deferred.resolve( { redirect:redirectOpts, roleList: User.getEntitlements() } );
                }
                else {
                    Loader.onFor('userDetails','getting-user-info');
                    myCUI.handleCovAuthResponse({selfRedirect:true})
                    .then((res)=>{
                        populateUserInfo(res,localStorage.get('appRedirect'))
                        .then((res) => {
                            deferred.resolve(res);
                            $timeout(()=> Loader.offFor('userDetails'),50);
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
