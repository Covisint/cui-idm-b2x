angular.module('common')
.factory('User',['$rootScope',($rootScope) => {

    let user = {
        entitlements: undefined
    };

    return {
        set : (newUser) => {
            angular.merge(user, newUser);
            console.log(user);
        },

        get : () => user.cuid || '[cuid]',

        setEntitlements : (newEntitlements) => {
            user.entitlements? user.entitlements = user.entitlements.concat(newEntitlements) : user.entitlements = newEntitlements;
        },

        getEntitlements : () => user.entitlements,

        user // get all the user info

    };

}]);