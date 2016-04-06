angular.module('app')
.controller('orgHierarchyCtrl', ['$scope','$stateParams','API',
function($scope,$stateParams,API) {
    'use strict';
    var orgHierarchy = this;

    orgHierarchy.loading = true;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function(err) {
        orgHierarchy.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    API.cui.getPerson({personId: API.getUser(), useCuid:true})
    .then(function(person) {
        return API.cui.getOrganization({organizationId: person.organization.id});
    })
    .then(function(res) {
    	console.log(res);
        orgHierarchy.organization = res;
        return API.cui.getOrganizationHierarchy({ id: orgHierarchy.organization.id });
	})
    .then(function(res) {
    	console.log('Organization Hierarchy: ', res);
        orgHierarchy.loading = false;
        $scope.$digest();
    })
    .fail(handleError);

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
