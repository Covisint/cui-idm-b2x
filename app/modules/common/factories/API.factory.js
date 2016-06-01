angular.module('common')
.factory('API',['$state','User','$rootScope','$window','$location','CustomAPI','$q','localStorageService','Loader','$timeout',
($state,User,$rootScope,$window,$location,CustomAPI,$q,localStorage,Loader,$timeout) => {

    let authInfo = {},
        myCUI = window.initializedCuiJs,
        CustomCUI = window.initializedCustomCui;

    const populateUserInfo = (info, redirectOpts) => {
        let deferred = $q.defer(),
            authInfo = info;

        if (User.get() === '[cuid]') {
            // If we don't have any user data saved
            if (info.cuid !== null) {
                // CUID is present but not in the User factory
                User.set(info);
            }

            let promises = [
                myCUI.getPerson({personId: authInfo.cuid}), 
                myCUI.getPersonRoles({personId: authInfo.cuid})
            ];

            $q.all(promises)
            .then((res) => {
                let roleList = res[1].map((x) => {
                    return x.name;
                });
                User.setEntitlements(roleList);
                deferred.resolve({roleList: roleList, redirect: redirectOpts});
            });
        }
        else {
            deferred.resolve({roleList: User.getEntitlements(), redirect: redirectOpts});
        }
        return deferred.promise;
    };

    const stateChangeHandler = (redirectOpts) => {
        let deferred = $q.defer();

        let sessionInfo = myCUI.getCovAuthInfo();;
        myCUI.setServiceUrl(appConfig.serviceUrl);
        myCUI.covAuthInfo({originUri: appConfig.originUri});

        if (!redirectOpts.toState.access) {
            deferred.resolve({rolesList: [], redirect: redirectOpts});
        }
        else if (redirectOpts.toState.name !== 'auth') {
            // Redirect to the pre-auth state
            localStorage.set('appRedirect', redirectOpts);
            deferred.resolve({roleList: [], redirect: redirectOpts});
        }
        else {
            myCUI.handleCovAuthResponse({selfRedirect: true})
            .then((res) => {
                return populateUserInfo(res, localStorage.get('appRedirect'));
            })
            .then((res) => {
                deferred.resolve(res);
            });
        }
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
    CustomCUI.setServiceUrl(appConfig.serviceUrl);
    CustomCUI.setAuthHandler(jwtAuthHandler);

    angular.forEach(CustomAPI.getCallWrappers(myCUI), (func, key) => {
        myCUI[key] = func;
    });

    let apiFactory = {
        cui: myCUI,
        customCui: CustomCUI,
        getUser: User.get,
        setUser: User.set,
        setPersonData: User.setPersonData,
        getPersonData: User.getPersonData,
        user: User.user,
        handleStateChange: stateChangeHandler,
        setAuthInfo: function(newAuthInfo) {
            angular.copy(newAuthInfo[0], authInfo);
        },
        authInfo: authInfo
    };

    return apiFactory;
    
}]);
