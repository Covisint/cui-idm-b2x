angular.module('organization')
.controller('orgRequestReviewCtrl',function(API,$stateParams,$q,DataStorage,$timeout,$state) {
    'use strict';

    const orgRequestReview = this,
    		orgId = $stateParams.orgID;

    let apiPromises = [];

    orgRequestReview.loading = true;
    orgRequestReview.success = false;
    orgRequestReview.approvedCount = 0;
    orgRequestReview.deniedCount = 0;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    orgRequestReview.organizationRequest = DataStorage.getType('organizationRequest');

    apiPromises.push(
    	API.cui.getOrganization({organizationId: orgId})
    	.then((res) => {
    		orgRequestReview.organization = res;
    	})
    );

    $q.all(apiPromises)
    .then(() => {
    	orgRequestReview.loading = false;
    }, (error) => {
    	console.log(error);
    	orgRequestReview.loading = false;
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    orgRequestReview.submit = () => {
    	console.log('Submit TODO');
    };

    // ON CLICK END ----------------------------------------------------------------------------------

});
