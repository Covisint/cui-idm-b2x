angular.module('common')
.factory('API',['$state','User','$rootScope','$window','$location','CustomAPI',($state,User,$rootScope,$window,$location,CustomAPI) => {

    let authInfo = {};

    const myCUI = cui.api({
        dataCalls:CustomAPI.calls
    });

    angular.forEach(CustomAPI.getCallWrappers(myCUI),(func,key) => {
        myCUI[key]=func;
    });

    if(appConfig.serviceUrl){
        myCUI.setServiceUrl(appConfig.serviceUrl);
    }
    else myCUI.setServiceUrl('STG');

    const originUri = appConfig.originUri;

    const jwtAuthHandler = () => {
        return myCUI.covAuth({
            originUri: originUri,
            authRedirect: window.location.href.split('#')[0] + '#/empty',
            appRedirect: $location.path()
        });
    }

    myCUI.setAuthHandler(jwtAuthHandler);

    return {
        cui: myCUI,
        getUser: User.get,
        setUser: User.set,
        getUserEntitlements: User.getEntitlements,
        setUserEntitlements: User.setEntitlements,
        handleCovAuthResponse: function (e,toState,toParams,fromState,fromParams) {
            const self=this;
            myCUI.covAuthInfo({originUri:originUri});
            myCUI.handleCovAuthResponse({selfRedirect:true})
            .then((res)=>{
                if(toState.name==='empty'){
                    if(res.appRedirect!=='empty') {
                        Object.keys($location.search()).forEach((searchParam) => {
                            $location.search(searchParam,null);
                        });
                        $location.path(res.appRedirect).replace();
                    }
                    return;
                }
                else {
                    self.setUser(res);
                    self.setAuthInfo(res.authInfo);
                    myCUI.getPerson({ personId: res.cuid })
                    .then((res) => {
                        angular.copy(res.name, User.userName);
                        return myCUI.getPersonRoles({ personId: self.getUser() });
                    })
                    .then((roles) => {
                        let roleList = [];
                        roles.forEach((role) => {
                            roleList.push(role.name);
                        });
                        self.setUserEntitlements(roleList);
                        $rootScope.$digest();
                    });
                }
            });
        },
        setAuthInfo:(newAuthInfo) => {
            angular.copy(newAuthInfo[0],authInfo);
        },
        authInfo:authInfo
    };
}]);
