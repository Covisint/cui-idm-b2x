angular.module('organization')
.controller('orgHierarchyCtrl', ['$scope','$stateParams','API','$q',
function($scope,$stateParams,API,$q) {
    'use strict';

    const orgHierarchy = this;
    const organizationID = $stateParams.orgId;

    let apiPromises = [];

    orgHierarchy.loading = true;

    // ON LOAD START ---------------------------------------------------------------------------------

    if (organizationID) {
        // Use organizationID parameter to load the organization hierarchy 
        apiPromises.push(
            API.cui.getOrganizationHierarchy({organizationId: organizationID})
            .then(function(res) {
                orgHierarchy.organizationHierarchy = [res];
            }, function(error) {
                console.log(error);
            })
        );
    }
    else {
        // Use logged in user's organization.id to load the organization hierarchy
        apiPromises.push(
            API.cui.getPerson({personId: API.getUser(), useCuid:true})
            .then(function(res) {
                API.cui.getOrganizationHierarchy({organizationId: res.organization.id});
            })
            .then(function(res) {
                orgHierarchy.organizationHierarchy = [res];
            }, function(error) {
                console.log(error);
            })
        );
    }

    $q.all(apiPromises)
    .then(function(res) {
        orgHierarchy.loading = false;
    })
    .catch(function(error) {
        orgHierarchy.loading = false;
        console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
