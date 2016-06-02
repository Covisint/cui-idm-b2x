angular.module('organization')
.controller('orgRequestsCtrl',function(API,$stateParams,$q,$state) {
    'use strict';

    const orgRequests = this,
    		userId = $stateParams.userID,
    		orgId = $stateParams.orgID;

    let apiPromises = [];

    orgRequests.loading = true;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    apiPromises.push(
    	API.cui.getOrganization({organizationId: orgId})
    	.then((res) => {
    		orgRequests.organization = res;
            console.log('orgRequests.organization',orgRequests.organization);
    	})
    );

    apiPromises.push(
        API.cui.getAllOrganizationRequests({qs: ['organizationId', orgId]})
        .then((res) => {
            console.log('orgReqs', res);
        })
    );

    $q.all(apiPromises)
    .then(() => {
        orgRequests.loading = false;
    })
    .catch((error) => {
        orgRequests.loading = false;
        console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    orgRequests.viewRequest = (requestId) => {
        $state.go('requests.organizationRequest', {orgID: orgId, requestID: requestId});
    };

    // ON CLICK END ----------------------------------------------------------------------------------

});
