angular.module('app')
.controller('orgDirectoryCtrl', ['$scope','$stateParams','API',
function($scope,$stateParams,API) {
    'use strict';

    var orgDirectory = this;
    var organizationId = $stateParams.id;

    orgDirectory.loading = true;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function handleError(err) {
        orgDirectory.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    var onLoadFinish = function onLoadFinish(organizationResponse) {
        orgDirectory.organization = organizationResponse;
        API.cui.getOrganizations()
        .then(function(res) {
            orgDirectory.organizationList = res;
            return API.cui.getPersons({'qs': [['organization.id', orgDirectory.organization.id]]});
        })
        .then(function(res) {
            orgDirectory.userList = res;
            orgDirectory.loading = false;
            $scope.$digest();
        })
        .fail(handleError);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if (!organizationId) {
        // If no id parameter is passed load directory of logged in user's organization.
        API.cui.getPerson({personId: API.getUser(), useCuid:true})
        .then(function(person) {
            return API.cui.getOrganization({ organizationId: person.organization.id });
        })
        .then(function(res) {
            onLoadFinish(res);
        })
        .fail(handleError);
    }
    else {
        // Load organization directory of id parameter
        API.cui.getOrganization({ organizationId: organizationId })
        .then(function(res) {
            onLoadFinish(res);
        })
        .fail(handleError);
    }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    orgDirectory.getOrgMembers = function getOrgMembers(organizationId, organizationName) {
        orgDirectory.loading = true;
        orgDirectory.organization.id = organizationId;
        orgDirectory.organization.name = organizationName;
        API.cui.getPersons({'qs': [['organization.id', orgDirectory.organization.id]]})
        .then(function(res) {
            orgDirectory.userList = res;
            orgDirectory.loading = false;
            $scope.$digest();
        })
        .fail(handleError);
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
