angular.module('common')
.factory('User',['$rootScope',($rootScope) => {

    let user = {
        entitlements: undefined
    };

    return {
        set : (newUser) => {
            user = Object.assign(user,newUser);
        },

        get : () => user.cuid || '[cuid]',

        setEntitlements : (newEntitlements) => {
            user.entitlements = newEntitlements;
        },

        getEntitlements : () => user.entitlements,

        user // get all the user info

    };

}]);
