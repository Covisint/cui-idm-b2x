angular.module('app')
.factory('User',['$rootScope',function($rootScope){

    var user={
        cuid:'[cuid]', // we use [cuid] so that cui.js knows that we haven't gotten a cuid yet
        entitlements:[]
    };

    return {
        set : function(newUser){
            user=newUser;
        },
        get : function(){
            return user.cuid;
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