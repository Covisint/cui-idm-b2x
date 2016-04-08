angular.module('app')
.controller('userDetailsCtrl', ['$scope','$stateParams','API',
function($scope,$stateParams,API) {
    'use strict';
    var userDetails = this;
    var userID = $stateParams.id;

    // userDetails.loading = true;
    userDetails.profileRolesSwitch = true;


    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function handleError(err) {
        userDetails.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    var onLoadFinish = function onLoadFinish() {
        return;
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if (userID) {
        // Load organization based on id parameter
        API.cui.getPerson({ personId: userID })
        .then(function(res) {
            userDetails.user = res;
            onLoadFinish();
        })
        .fail(handleError);
    }
    else {
        // If no id parameter is passed we load the organization of the logged in user
        API.cui.getPerson({personId: API.getUser(), useCuid:true})
        .then(function(res) {
            userDetails.user = res;
            onLoadFinish();
        })
        .fail(handleError);
    }

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
