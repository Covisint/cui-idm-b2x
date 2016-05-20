angular.module('organization')
.controller('orgRequestCtrl', ['API','$stateParams','$q','$state',
function(API,$stateParams,$q,$state) {
    'use strict';

    const orgRequest = this,
    		userId = $stateParams.userID,
    		orgId = $stateParams.orgID;

    let apiPromises = [];

    orgRequest.loading = true;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    apiPromises.push(
    	// Get Person details based on userID param
    	API.cui.getPerson({personId: userId})
    	.then((res) => {
    		orgRequest.user = res;
    	})
    );

    apiPromises.push(
    	API.cui.getPersonRequests({requestId: userId})
    	.then((res) => {
    		orgRequest.userRequest = res;
    	})
    );

    apiPromises.push(
    	API.cui.getOrganization({organizationId: orgId})
    	.then((res) => {
    		orgRequest.org = res;
    	})
    );

    $q.all(apiPromises)
    .then(() => {
    	orgRequest.loading = false;
    }, (error) => {
    	orgRequest.loading = false;
    	console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    orgRequest.reviewApprovals = () => {
        $state.go('requests.organizationRequestReview');
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
