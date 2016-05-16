angular.module('organization')
.controller('pendingRequestsReviewCtrl', ['API','$stateParams','ServicePackage','$q',
function(API,$stateParams,ServicePackage,$q) {
    'use strict';

    const pendingRequestsReview = this,
    	userId = $stateParams.userID,
    	orgId = $stateParams.orgID;

    let apiPromises = [];

    pendingRequestsReview.loading = true;
    pendingRequestsReview.approvedCount = 0;
    pendingRequestsReview.deniedCount = 0;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    let getApprovalCounts = (requestArray) => {
    	requestArray.forEach(requestPackage => {
    		switch (requestPackage.approval) {
    			case 'approved':
    				pendingRequestsReview.approvedCount++;
    				break;
    			case 'denied':
    				pendingRequestsReview.deniedCount++;
    				break;
    		}    		
    	});
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    pendingRequestsReview.pendingRequests = ServicePackage.get(userId);
    console.log(pendingRequestsReview.pendingRequests);
    getApprovalCounts(pendingRequestsReview.pendingRequests);

    apiPromises.push(
    	API.cui.getPerson({personId: userId})
    	.then((res) => {
    		pendingRequestsReview.user = res;
    	})
    );

    $q.all(apiPromises)
    .then(() => {
    	pendingRequestsReview.loading = false;
    }, (error) => {
    	console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    pendingRequestsReview.submit = () => {
    	console.log(pendingRequestsReview.pendingRequests);
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
