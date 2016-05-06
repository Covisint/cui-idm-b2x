angular.module('organization')
.controller('orgHierarchyCtrl', ['$scope','$stateParams','API','$q','$state',
function($scope,$stateParams,API,$q,$state) {
    'use strict';

    const orgHierarchy = this,
        organizationId = $stateParams.orgID;

    let apiPromises = [];

    orgHierarchy.organizationId = $stateParams.orgID;
    orgHierarchy.loading = true;

    // ON LOAD START ---------------------------------------------------------------------------------

    if (organizationId) {
        // Use organizationID parameter to load the organization hierarchy 
        apiPromises.push(
            API.cui.getOrganizationHierarchy({organizationId: organizationId})
            .then(function(res) {
                // Put hierarchy response in an array as the hierarchy directive expects an array
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
                return API.cui.getOrganizationHierarchy({organizationId: res.organization.id});
            })
            .then(function(res) {
                // Put hierarchy response in an array as the hierarchy directive expects an array
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

    // ON CLICK START --------------------------------------------------------------------------------

    orgHierarchy.goToOrgProfile = function(org) {
        console.log(org.id);
        $state.go('organization.profile',{orgID:org.id});
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
