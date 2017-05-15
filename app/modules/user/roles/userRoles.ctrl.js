angular.module('user')
.controller('userRolesCtrl', function(Loader, User, UserProfile, $scope, API) {
    'use strict';

    const userRoles = this
    const scopeName = 'userRoles.'
    userRoles.user=User.user

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function handleError(err) {
        userRoles.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    Loader.onFor(scopeName + 'initHistory')
    API.cui.getPersonRolesOnly({personId:User.user.id})
    .then(res =>{
        userRoles.rolesDetails=res
        Loader.offFor(scopeName + 'initHistory')
        $scope.$digest()
    })
    .fail(err =>{

    })
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------
    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------
    // ON CLICK END ----------------------------------------------------------------------------------

});
