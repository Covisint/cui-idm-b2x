angular.module('app')
.factory('User',['$rootScope',function($rootScope){

    var user={
        entitlements:[]
    };

    return {
        set : function(newUser){
            user.cuid=newUser.cuid;
        },
        get : function(){
            return user.cuid || '[cuid]';
        },
        setEntitlements : function(newEntitlements){
            user.entitlements=newEntitlements;
            $rootScope.$broadcast('newEntitlements',user.entitlements);
        },
        getEntitlements : function(){
            console.log('getting entitlements:', user.entitlements);
            return user.entitlements;
        }
    };

}]);