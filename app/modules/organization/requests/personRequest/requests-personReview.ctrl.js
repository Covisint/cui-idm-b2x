angular.module('organization')
.controller('personRequestReviewCtrl',function(API,$stateParams,$q,DataStorage,$timeout,$state) {
    'use strict';

    const personRequestReview = this,
    	userId = $stateParams.userID,
    	orgId = $stateParams.orgID;

    let apiPromises = [];

    personRequestReview.loading = true;
    personRequestReview.success = false;
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

    let denyPersonRegistrationRequest = (registrationRequest) => {
    	if (registrationRequest.rejectReason) {
    		return API.cui.denyPersonRegistration({qs: [['requestId', registrationRequest.id], ['reason', registrationRequest.rejectReason]]})
    		.fail((error) => {
    			console.log(error);
    		});
    	}
    	else {
    		return API.cui.denyPersonRegistration({qs: [['requestId', registrationRequest.id]]})
    		.fail((error) => {
    			console.log(error);
    		});
    	}
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    personRequestReview.userRegistrationRequest = DataStorage.getDataThatMatches('userPersonRequest', { userId }).request;
    personRequestReview.userPackageRequests = DataStorage.get('userRequestedPackages', { userId }).requests;

    if (personRequestReview.userPackageRequests) {
    	getApprovalCounts(personRequestReview.userPackageRequests);
    }

    apiPromises.push(
    	API.cui.getPerson({personId: userId})
    	.then((res) => {
    		personRequestReview.user = res;
    	})
    );

    apiPromises.push(
        API.cui.getOrganization({organizationId: orgId})
        .then((res) => {
            personRequestReview.organization = res;
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
        personRequestReview.loading = true;
    	if (personRequestReview.userRegistrationRequest.approval === 'denied') {
            let submitPromises = [];

    		// Deny Registration Request
    		submitPromises.push(denyPersonRegistrationRequest(personRequestReview.userRegistrationRequest));

    		if (personRequestReview.userPackageRequests) {
    			personRequestReview.userPackageRequests.forEach((packageRequest) => {
    				// Deny each package request
    				submitPromises.push(API.cui.denyPackage({qs: [['requestId', packageRequest.id], ['justification', 'Registration request denied']]}));
    			});
    		}

            $q.all(submitPromises)
            .then(() => {
                personRequestReview.loading = false;
                personRequestReview.success = true;
                $timeout(() => {
                    $state.go('organization.directory', {userID: userId, orgID: orgId});
                }, 3000);
            }, (error) => {
                personRequestReview.loading = false;
                console.log(error);
            });
    	}
    	else if (personRequestReview.userRegistrationRequest.approval === 'approved') {
    		// Approve registration request
    		API.cui.approvePersonRegistration({qs: [['requestId', personRequestReview.userRegistrationRequest.id]]})
    		.then(() => {
                let submitPromises = [];

    			// If user has service package requests
    			if (personRequestReview.userPackageRequests) {
    				personRequestReview.userPackageRequests.forEach((packageRequest) => {
    					// If the package is approved
    					if (packageRequest.approval === 'approved') {
    						// Approve package
    						submitPromises.push(API.cui.approvePackage({qs: [['requestId', packageRequest.id]]}));
    						if (packageRequest.servicePackage.claims.length > 0) {
    							// If the package has claims, build the claims requests and grant the claims
    							let grantClaimData = build.packageGrantClaimRequest(packageRequest.requestor.id, packageRequest.servicePackage, packageRequest.servicePackage.claims);
    							submitPromises.push(API.cui.grantClaims({data: grantClaimData}));
    						}
    					}
                        // Package is denied
                        else {
                            // Deny package
                            submitPromises.push(API.cui.denyPackage({qs: [['requestId', packageRequest.id], ['justification', packageRequest.rejectReason]]}));
                        }
    				});
    			}
                else {
                    personRequestReview.loading = false;
                    personRequestReview.success = true;
                    $timeout(() => {
                        $state.go('organization.directory', {orgID: orgId});
                    }, 3000);
                }

                $q.all(submitPromises)
                .then(() => {
                    personRequestReview.loading = false;
                    personRequestReview.success = true;
                    $timeout(() => {
                        $state.go('organization.directory', {orgID: orgId});
                    }, 3000);
                }, (error) => {
                    personRequestReview.loading = false;
                    console.log(error);
                });

            })
    		.fail((error) => {
    			console.log(error);
    		});
    	}
    };

    // ON CLICK END ----------------------------------------------------------------------------------

});
