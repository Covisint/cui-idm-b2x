angular.module('app')
.controller('userDetailsCtrl', ['$scope', '$stateParams', 'API',
function($scope,$stateParams,API) {
    'use strict';
    var userDetails = this;

    // userDetails.loading = true;
    userDetails.profileRolesSwitch = true;


    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function(err) {
        userDetails.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------
    // ON LOAD END -----------------------------------------------------------------------------------

}]);
