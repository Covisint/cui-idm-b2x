angular.module('organization')
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

    var onLoadFinish = function onLoadFinish(organizationResponse) {
        orgProfile.organization = organizationResponse;
        API.cui.getPersons({'qs': [['organization.id', orgProfile.organization.id], ['securityadmin', true]]})
        .then(function(res) {
            orgProfile.securityAdmins = res;
            orgProfile.loading = false;
            $scope.$digest();
        })
        .fail(handleError);
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
            onLoadFinish(res);
        })
        .fail(handleError);
    }
    else {
        // Load organization based on id parameter
        API.cui.getOrganization({ organizationId: organizationId })
        .then(function(res) {
            onLoadFinish(res);
        })
        .fail(handleError);
    }

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
