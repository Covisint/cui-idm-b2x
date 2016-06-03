angular.module('organization')
.controller('orgProfileCtrl', function($scope, $stateParams, API) {
    'use strict';

    const orgProfile = this,
        organizationId = $stateParams.orgID,
        userId = $stateParams.userID;

    orgProfile.loading = true;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function(err) {
        orgProfile.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    var onLoadFinish = function onLoadFinish(organizationResponse) {
        orgProfile.organization = organizationResponse;

        API.cui.getPersonsAdmins({qs: [['organization.id', organizationResponse.id], ['securityadmin', true]]})
        .then(function(res) {
            orgProfile.securityAdmins = res;
            orgProfile.loading = false;
            $scope.$digest();
        })
        .fail(handleError);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if (organizationId) {
        // Load profile based on organization id parameter
        API.cui.getOrganization({organizationId: organizationId})
        .then(function(organizationResponse) {
            onLoadFinish(organizationResponse);
        })
        .fail(handleError);
    }
    else if (userId) {
        // Load profile based on user id paramter
        API.cui.getPerson({personId: userId})
        .then(function(res) {
            return API.cui.getOrganization({organizationId: res.organization.id});
        })
        .then(function(organizationResponse) {
            onLoadFinish(organizationResponse);
        })
        .fail(handleError);
    }
    else {
        // Load organization profile of logged in user
        API.cui.getPerson({personId: API.getUser(), useCuid:true})
        .then(function(res) {
            return API.cui.getOrganization({organizationId: res.organization.id});
        })
        .then(function(organizationResponse) {
            onLoadFinish(organizationResponse);
        })
        .fail(handleError);
    }

    // ON LOAD END -----------------------------------------------------------------------------------

});
