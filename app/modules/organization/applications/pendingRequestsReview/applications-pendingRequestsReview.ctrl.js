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

    let build = {
    	packageGrantClaimRequest:function(granteeId, servicePackage, claimsArray) {
    		return {
    			grantee: granteeId,
    			servicePackage: this.buildServicePackage(servicePackage),
    			packageClaims: this.buildPackageClaims(claimsArray)
    		};
    	},
    	buildServicePackage:function(servicePackage) {
    		return {
    			id: servicePackage.id,
    			type: servicePackage.type
    		};
    	},
    	buildPackageClaims:function(claimsArray) {
    		let strippedClaimsArray = [];
    		claimsArray.forEach(claim => {
    			if (claim.accepted) {
    				let strippedClaim = {
    					id: claim.id,
    					claimId: claim.claimId,
    					name: claim.name,
    					claimValues: claim.claimValues
    				};
    				strippedClaimsArray.push(strippedClaim);
    			}
    		});
    		return strippedClaimsArray;
    	}
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
    				API.cui.denyPackage({qs: [['requestId', packageRequest.id],['justification', packageRequest.rejectReason]]})
    				.fail((error) => {
    					console.log(error);
    				});
    			}
    			else {
    				API.cui.denyPackage({qs: [['requestId', packageRequest.id]]})
    				.fail((error) => {
    					console.log(error);
    				});
    			}
    		}
    		else {
    			API.cui.approvePackageRequest({qs: [['requestId', packageRequest.id]]})
    			.fail((error) => {
    				console.log(error);
    			});

    			let grantClaimData = build.packageGrantClaimRequest(packageRequest.requestor.id, packageRequest.servicePackage, packageRequest.servicePackage.claims);

    			API.cui.grantClaims({data: grantClaimData})
    			.fail((error) => {
    				console.log(error);
    			});
    		}
    	});

		pendingRequestsReview.sucess = true;
		$timeout(() => {
			$state.go('directory.userDetails', {userID: userId, orgID: orgId});
		}, 3000);
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
