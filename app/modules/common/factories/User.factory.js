angular.module('common')
.factory('User', ($rootScope) => {

    /*
        This factory is intended to store data/logic pertaining to the logged in user only.
        This data is populated right after logon (this can be found in the API.factory.js 
        inside the populateUserInfo method). The application will not run if those endpoints
        fail.
    */

    let user = {
        entitlements: undefined,
        roles: undefined
    }

    return {
        set : (newUser) => {
            angular.merge(user, newUser);
        },

        get : () => user.cuid || '[cuid]',

        setEntitlements : (newEntitlements) => {
            user.entitlements ? user.entitlements = user.entitlements.concat(newEntitlements) : user.entitlements = newEntitlements
        },

        getEntitlements : () => user.entitlements,

        setRoles : (newRoles) => {
            user.roles ? user.roles = user.roles.concat(newRoles) : user.roles = newRoles
        },

        getRoles : () => user.roles,

        user
    }

})
