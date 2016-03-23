angular.module('app')
.factory('API',['$state','User','$rootScope','$window','$location',function($state,User,$rootScope,$window,$location){

    var myCUI = cui.api();
    cui.log('cui.js v', myCUI.version()); // CUI Log

    var authInfo={};

    // myCUI.setServiceUrl('PRD'); // PRD
    myCUI.setServiceUrl('STG'); // STG

    var originUri = 'coke-idm.run.covapp.io'; // Coke
    // var originUri = 'coke-idm.run.covapp.io'; // Covisint

    function jwtAuthHandler() {
        return myCUI.covAuth({
            originUri: originUri,
            authRedirect: window.location.href.split('#')[0] + '#/empty',
            appRedirect: $location.path()
        });
    };

    myCUI.setAuthHandler(jwtAuthHandler);

    return {
        cui: myCUI,
        getUser: User.get,
        setUser: User.set,
        getUserEntitlements: User.getEntitlements,
        setUserEntitlements: User.setEntitlements,
        handleCovAuthResponse: function(e,toState,toParams,fromState,fromParams){
            var self=this;
            myCUI.covAuthInfo({originUri:originUri});
            myCUI.handleCovAuthResponse({selfRedirect:true})
            .then(function(res) {
                if(toState.name==='empty'){
                    if(res.appRedirect!=='empty') {
                        Object.keys($location.search()).forEach(function(searchParam){
                            $location.search(searchParam,null);
                        });
                        $location.path(res.appRedirect).replace();
                    }
                    return;
                }
                else {
                    self.setUser(res);
                    self.setAuthInfo(res.authInfo);
                    myCUI.getPersonRoles({ personId: self.getUser() })
                    .then(function(roles) {
                        var roleList = [];
                        roles.forEach(function(role) {
                            roleList.push(role.name);
                        });
                        self.setUserEntitlements(roleList);
                        $rootScope.$digest();
                    });
                }
            });
        },
        setAuthInfo:function(newAuthInfo){
            angular.copy(newAuthInfo[0],authInfo);
        },
        authInfo:authInfo
    };
}]);
