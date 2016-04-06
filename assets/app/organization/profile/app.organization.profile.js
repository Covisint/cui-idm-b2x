angular.module('app')
.controller('orgProfileCtrl', ['$scope','$stateParams','API',
function($scope,$stateParams,API) {
    'use strict';

    var orgProfile = this;
    var organizationId = $stateParams.id;

    orgProfile.loading = true;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function(err) {
        orgProfile.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if (!organizationId) {
        // If no id parameter is passed we load the organization of the logged in user
        API.cui.getPerson({personId: API.getUser(), useCuid:true})
        .then(function(person) {
            return API.cui.getOrganization({organizationId: person.organization.id});
        })
        .then(function(res) {
            orgProfile.organization = res;
            return API.cui.getPersons({'qs': [['organization.id', orgProfile.organization.id], ['securityadmin', true]]});
        })
        .then(function(res) {
            orgProfile.securityAdmins = res;
            orgProfile.loading = false;
            $scope.$digest();
        })
        .fail(handleError);
    }
    else {
        // Load organization based on id parameter
        API.cui.getOrganization({ organizationId: organizationId })
        .then(function(res) {
            orgProfile.organization = res;
            return API.cui.getPersons({'qs': [['organization.id', orgProfile.organization.id], ['securityadmin', true]]});
        })
        .then(function(res) {
            orgProfile.securityAdmins = res;
            orgProfile.loading = false;
            $scope.$digest();
        })
        .fail(handleError);
    }

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
