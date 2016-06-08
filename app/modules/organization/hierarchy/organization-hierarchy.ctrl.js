angular.module('organization')
.controller('orgHierarchyCtrl',function($scope,$stateParams,API,$state) {
    'use strict';

    const orgHierarchy = this,
        organizationId = $stateParams.orgID;

    orgHierarchy.organizationId = $stateParams.orgID;
    orgHierarchy.loading = true;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const handleError = function handleError(err) {
        orgHierarchy.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    const onLoadFinish = function onLoadFinish() {
        orgHierarchy.loading = false;
        $scope.$digest();
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if (organizationId) {
        // Use organizationID parameter to load the organization hierarchy 
        API.cui.getOrganizationHierarchy({organizationId: organizationId})
        .then(function(res) {
            // Put hierarchy response in an array as the hierarchy directive expects an array
            orgHierarchy.organizationHierarchy = [res];
            onLoadFinish();
        })
        .fail(handleError);
    }
    else {
        // Use logged in user's organization.id to load the organization hierarchy
        API.cui.getPerson({personId: API.getUser(), useCuid:true})
        .then(function(res) {
            return API.cui.getOrganizationHierarchy({organizationId: res.user.organization.id});
        })
        .then(function(res) {
            // Put hierarchy response in an array as the hierarchy directive expects an array
            orgHierarchy.organizationHierarchy = [res];
            onLoadFinish();
        })
        .fail(handleError);
    }
    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    orgHierarchy.goToOrgProfile = function(org) {
        $state.go('organization.profile',{orgID:org.id});
    };
    
    // ON CLICK END ----------------------------------------------------------------------------------

});
