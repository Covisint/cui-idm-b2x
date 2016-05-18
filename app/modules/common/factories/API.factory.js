angular.module('common')
.factory('API',['$state','User','$rootScope','$window','$location','CustomAPI','$q','localStorageService',($state,User,$rootScope,$window,$location,CustomAPI,$q,localStorage) => {

    let authInfo = {};

    const myCUI = cui.api({
        dataCalls:CustomAPI.calls,
        apiUrls: CustomAPI.urls
    });

    angular.forEach(CustomAPI.getCallWrappers(myCUI),(func,key) => {
        myCUI[key]=func;
    });

    if(appConfig.serviceUrl){
        myCUI.setServiceUrl(appConfig.serviceUrl);
    }
    else myCUI.setServiceUrl('STG');


    myCUI.setAuthHandler(() => {
        return myCUI.covAuth({
            originUri: originUri,
            authRedirect: window.location.href.split('#')[0] + '#/auth'
        });
    });

    const originUri = appConfig.originUri;
    myCUI.covAuthInfo({originUri:originUri});


    const populateUserInfo = (info,redirectOpts) => {
        authInfo = info;
        const deferred = $q.defer();
        if(User.get()==='[cuid]'){ // if we don't have user data saved
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
        }
        else {
            deferred.resolve({ roleList:User.getEntitlements(), redirect:redirectOpts });
        }
        return deferred.promise;
    }

    return {
        cui: myCUI,
        getUser: User.get,
        setUser: User.set,
        handleStateChange: (redirectOpts) => {
            const deferred = $q.defer();
            const sessionInfo = myCUI.getCovAuthInfo();
            if(redirectOpts.toState.name!=='auth') {
                localStorage.set('appRedirect',redirectOpts); // set the redirect to whatever the last state before auth was
                populateUserInfo(sessionInfo,redirectOpts) // if there's no session info stored this will force a 401 on getPerson, which will trigger cui's auth handler
                .then((res) => {
                    deferred.resolve(res);
                });
            }
            else {
                myCUI.handleCovAuthResponse({selfRedirect:true})
                .then((res)=>{
                    populateUserInfo(res,localStorage.get('appRedirect'))
                    .then((res) => {
                        deferred.resolve(res);
                    });
                });
            }

            return deferred.promise;
        },
        authInfo:authInfo
    };
}]);
