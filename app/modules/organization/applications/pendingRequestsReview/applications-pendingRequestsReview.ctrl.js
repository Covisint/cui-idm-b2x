angular.module('organization')
.controller('pendingRequestsReviewCtrl', ['API','$stateParams','ServicePackage','$q','$timeout','$state',
function(API,$stateParams,ServicePackage,$q,$timeout,$state) {
    'use strict';

    const pendingRequestsReview = this,
    	userId = $stateParams.userID,
    	orgId = $stateParams.orgID;

    let apiPromises = [];

    pendingRequestsReview.loading = true;
    pendingRequestsReview.sucess = false;
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

    	pendingRequestsReview.pendingRequests.forEach(packageRequest => {
    		if (packageRequest.approval === 'denied') {
    			if (packageRequest.rejectReason) {
    				// API.cui.denyPackageRequests({qs: [['requestId', packageRequest.id],['justification', packageRequest.rejectReason]]})
    				// .fail((error) => {
    				// 	console.log(error);
    				// });
    				return;
    			}
    			else {
    				// API.cui.denyPackageRequests({qs: [['requestId', packageRequest.id]]})
    				// .fail((error) => {
    				// 	console.log(error);
    				// });
    				return;
    			}
    		}
    		else {
    			// API.cui.approvePackageRequest({qs: [['requestId', packageRequest.id]]})
    			// .fail((error) => {
    			// 	console.log(error);
    			// });
    			// PUT /packages/grants/claims
    			return;
    		}
    	});
		// pendingRequestsReview.sucess = true;
		// $timeout(() => {
		// 	$state.go('directory.userDetails', {userID: userId, orgID: orgId});
		// }, 3000);
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
