angular.module('app')
.controller('orgProfileCtrl',['$scope','$stateParams','API',
function($scope,$stateParams,API) {
    'use strict';

    var orgProfile = this;

    /*      Scope Variable List:
        orgProfile.loadingDone: When screen is loading
        orgProfile.organization: Organization object of logged in user
        orgProfile.securityAdmins: List of security admins in orgProfile.organization
    */

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function(err) {
        console.log('Error', err);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    API.cui.getPerson({personId: API.getUser(), useCuid:true})
    .then(function(person) {
        return API.cui.getOrganization({organizationId: person.organization.id});
    })
    .then(function(organization) {
        orgProfile.organization = organization;
        return API.cui.getPersons({'qs': [['organization.id', orgProfile.organization.id], ['securityadmin', true]]});
    })
    .then(function(res) {
        orgProfile.securityAdmins = res;
        orgProfile.loadingDone = true;
        $scope.$digest();
    })
    .fail(handleError);

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
