angular.module('common')
.factory('User', (UserActions) => {
    return {
        details: {
            id: '[cuid]'                // just a holder for the user object
        },
        actions: function () {
            return UserActions(this)    // User.actions.js
        }
    }
})