angular.module('organization')
.controller('personRequestReviewCtrl', ['API','$stateParams','$q','DataStorage',
function(API,$stateParams,$q,DataStorage) {
    'use strict';

    const personRequestReview = this,
    	userId = $stateParams.userID,
    	orgId = $stateParams.orgID;

    let apiPromises = [];
    
    personRequestReview.loading = true;
    personRequestReview.sucess = false;
    personRequestReview.approvedCount = 0;
    personRequestReview.deniedCount = 0;


    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    let getApprovalCounts = (requests) => {
        if (requests) {
            requests.forEach(request => {
                switch (request.approval) {
                    case 'approved':
                        personRequestReview.approvedCount++;
                        break;
                    case 'denied':
                        personRequestReview.deniedCount++;
                        break;
                }
            }); 
        }
    };

    let build = {
    	packageGrantClaimRequest:function(granteeId, servicePackage, claimsArray) {
    		return {
    			grantee: {
                    id: granteeId,
                    type: 'person'
                },
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

    let denyPersonRegistrationRequest = (requestId, reason) => {
    	if (reason) {
    		return API.cui.denyPersonRegistration({qs: [['request.id', personRequestReview.userRegistrationRequest], ['reason', 'TODOREASON']]})
    		.catch((error) => {
    			console.log(error);
    		});
    	}
    	else {
    		return API.cui.denyPersonRegistration({qs: [['request.id', personRequestReview.userRegistrationRequest]]})
    		.catch((error) => {
    			console.log(error);
    		});
    	}
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    personRequestReview.userRegistrationRequest = DataStorage.get(userId, 'userPersonRequest');
    personRequestReview.userPackagesRequests = DataStorage.get(userId, 'userRequestedPackages');
    console.log('personRequestReview.userRegistrationRequest',personRequestReview.userRegistrationRequest);
    console.log('personRequestReview.userPackagesRequests',personRequestReview.userPackagesRequests);

    if (personRequestReview.userPackagesRequests) {
    	getApprovalCounts(personRequestReview.userPackagesRequests);
    }

    apiPromises.push(
    	API.cui.getPerson({personId: userId})
    	.then((res) => {
    		personRequestReview.user = res;
    	})
    );

    $q.all(apiPromises)
    .then(() => {
    	personRequestReview.loading = false;
    }, (error) => {
    	console.log(error);
    	personRequestReview.loading = false;
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    personRequestReview.submit = () => {
    	let submitPromises = [];

    	// Denied
    	if (personRequestReview.userRegistrationRequest.approval === 'denied') {
    		// Deny Registration Request
    		submitPromises.push(denyPersonRegistrationRequest(personRequestReview.userRegistrationRequest, 'reasonTODO'));
    		
    		if (personRequestReview.userPackagesRequests) {
    			personRequestReview.userPackagesRequests.forEach((packageRequest) => {
    				// Deny each package request
    				API.cui.denyPackage({qs: [['requestId', packageRequest.id], ['justification', packageRequest.rejectReason]]});
    			});	
    		}
    	}
    	// Approved
    	else {
    		// Approve registration request
    		API.cui.approvePersonRegistration({qs: [['request.id', personRequestReview.userRegistrationRequest]]})
    		.then(() => {
    			// If user has service package requests
    			if (personRequestReview.userPackagesRequests) {
    				personRequestReview.userPackagesRequests.forEach((packageRequest) => {
    					// If the package is approved
    					if (packageRequest.approval === 'approved') {
    						// Approve package
    						API.cui.approvePackage({qs: [['requestId', packageRequest.id]]});
    						if (packageRequest.servicePackage.claims.length > 0) {
    							// If the package has claims, build the claims requests and grant the claims
    							let grantClaimData = build.packageGrantClaimRequest(packageRequest.requestor.id, packageRequest.servicePackage, packageRequest.servicePackage.claims);
    							API.cui.grantClaims({data: grantClaimData});
    						}	
    					}
    				});
    			}
    		})
    		.catch((error) => {
    			console.log(error);
    		});
    		// Accept All Package Requests
    		return;
    	}
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
