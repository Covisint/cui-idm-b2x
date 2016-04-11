angular.module('app')
.controller('orgDirectoryCtrl', ['$scope','$stateParams','API','$filter','Sort',
function($scope,$stateParams,API,$filter,Sort) {
    'use strict';

    var orgDirectory = this;
    var organizationId = $stateParams.id;

    orgDirectory.loading = true;
    orgDirectory.sortFlag = false;
    orgDirectory.userList = [];

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
            // return API.cui.getPersons({'qs': [['organization.id', orgDirectory.organization.id]]});
            // I am populating all organization directories with the logged in user info until we 
            // can get all the members of an organization.
            return API.cui.getPerson({personId: API.getUser(), useCuid:true});
        })
        .then(function(res) {
            orgDirectory.userList.push(res);
            orgDirectory.loading = false;
           // $scope.$digest();
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

    orgDirectory.sort = function(sortType) {
        Sort.listSort(orgDirectory.userList, sortType, orgDirectory.sortFlag);
        orgDirectory.sortFlag =! orgDirectory.sortFlag;
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
