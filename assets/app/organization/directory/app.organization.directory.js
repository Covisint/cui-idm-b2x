angular.module('app')
.controller('orgDirectoryCtrl', ['$scope','$stateParams','API',
function($scope,$stateParams,API) {
    'use strict';

    var orgDirectory = this;
    var organizationId = $stateParams.id;

    orgDirectory.loading = true;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function(err) {
        orgDirectory.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if (!organizationId) {
        // If no id parameter is passed load organization directory of logged in user
        API.cui.getPerson({personId: API.getUser(), useCuid:true})
        .then(function(person) {
            return API.cui.getOrganization({ organizationId: person.organization.id });
        })
        .then(function(res) {
            orgDirectory.organization = res;
            orgDirectory.loading = false;
            $scope.$digest();
        })
        .fail(handleError);
    }
    else {
        // Load organization directory of id parameter
        API.cui.getOrganization({ organizationId: organizationId })
        .then(function(res) {
            orgDirectory.organization = res;
            orgDirectory.loading = false;
            $scope.$digest();
        })
        .fail(handleError);
    }

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
