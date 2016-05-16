angular.module('organization')
.controller('pendingRequestsCtrl', ['API','$stateParams','$q','ServicePackage','$state',
function(API,$stateParams,$q,ServicePackage,$state) {
    'use strict';

    const pendingRequests = this,
    	userId = $stateParams.userID,
        orgId = $stateParams.orgID;

    let apiPromises = [];

    pendingRequests.loading = true;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const getPackageServices = (pendingPackages) => {
    	pendingPackages.forEach((pendingPackage) => {
    		// Get the services associated with each package
    		API.cui.getPackageServices({packageId: pendingPackage.servicePackage.id})
    		.then((res) => {
    			// Append services to each service package
    			pendingPackage.servicePackage.services = res;
    		});
    	});
    };

    const getPackageClaims = (pendingPackages) => {
    	pendingPackages.forEach((pendingPackage) => {
    		// Get the claims associated with each package
    		API.cui.getPackageClaims({qs: [['packageId', pendingPackage.servicePackage.id]]})
    		.then((res) => {
    			// Append claims to each service package
    			pendingPackage.servicePackage.claims = res;
    		});
    	});
    };

    const getPackageDetails = (pendingPackages) => {
    	pendingPackages.forEach((pendingPackage) => {
    		// Get the package details of each package
    		API.cui.getPackage({packageId: pendingPackage.servicePackage.id})
    		.then((res) => {
    			pendingPackage.servicePackage.packageDetails = res;
    		});
    	});
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    apiPromises.push(
    	// Get Person details based on userID param
    	API.cui.getPerson({personId: userId})
    	.then((res) => {
    		pendingRequests.user = res;
    	})
    );

    apiPromises.push(
    	// Get user's pending service packages
	    API.cui.getPersonPendingServicePackages({qs: [['requestor.id', userId],['requestor.type', 'person']]})
	    .then((res) => {
	        pendingRequests.packages = res;
	        getPackageServices(pendingRequests.packages);
	        getPackageClaims(pendingRequests.packages);
	        // getPackageDetails(pendingRequests.packages);
            console.log(pendingRequests.packages);
	    })
	);

    $q.all(apiPromises)
    .then(() => {
    	pendingRequests.loading = false;
    }, (error) => {
    	console.log(error);
    	pendingRequests.loading = false;
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    pendingRequests.reviewApprovals = () => {
        ServicePackage.set(userId, pendingRequests.packages);
        $state.go('applications.pendingRequestsReview', {userID: userId, orgID: orgId});
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
