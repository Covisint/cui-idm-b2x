angular.module('app')
.factory('API',['$state','User','$rootScope','$window',function($state,User,$rootScope,$window){

    var myCUI = cui.api();
    cui.log('cui.js v', myCUI.version());

    var authInfo={};

    // myCUI.setServiceUrl('PRD'); // PRD
    myCUI.setServiceUrl('STG'); // STG

    var originUri = 'coke-idm.run.covapp.io'; // Coke
    // var originUri = 'coke-idm.run.covapp.io'; // Covisint

    function jwtAuthHandler() {
        return myCUI.covAuth({
            originUri: originUri,
            authRedirect: window.location.href.split('#')[0] + '#/empty',
        });
    };
    myCUI.setAuthHandler(jwtAuthHandler);


    return {
        cui: myCUI,
        getUser: User.get,
        setUser: User.set,
        getUserEntitlements: User.getEntitlements,
        setUserEntitlements: User.setEntitlements,
        handleCovAuthResponse: function(toState){
            var self=this;
            myCUI.handleCovAuthResponse(toState.name==='empty'? {selfRedirect:true} : {})
            .then(function(res) {
                self.setUser(res);
                self.setAuthInfo(res.authInfo);
                if(toState.name==='empty'){
                    $window.location.href = res.appRedirect;
                }
                return myCUI.getPersonRoles({ personId: self.getUser() });
            })
            .then(function(roles) {
                var roleList = [];
                roles.forEach(function(role) {
                    roleList.push(role.name);
                });
                self.setUserEntitlements(roleList);
                $rootScope.$digest();
            });
        },
        setAuthInfo:function(newAuthInfo){
            angular.copy(newAuthInfo[0],authInfo);
        },
        authInfo:authInfo
    };
}]);
