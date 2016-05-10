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
            const promises = [myCUI.getPerson({ personId: authInfo.cuid }) , myCUI.getPersonRoles({ personId: authInfo.cuid })];
            $q.all(promises)
            .then((res) => {
                angular.copy(res[0].name, User.userName);
                const roleList = res[1].map(x => x.name);
                User.setEntitlements(roleList);
                deferred.resolve({ roleList, redirect:redirectOpts });
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
                if(sessionInfo.cuid) {
                    populateUserInfo(sessionInfo,redirectOpts)
                    .then((res) => {
                        deferred.resolve(res);
                    });
                }
                else {
                    deferred.resolve({ roleList:[], redirect:redirectOpts });
                }
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
