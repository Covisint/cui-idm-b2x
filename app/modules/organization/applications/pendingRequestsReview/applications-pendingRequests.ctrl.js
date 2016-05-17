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

    const getPackageServices = (pendingPackage) => {
        // Get and append services associated with this package
        return API.cui.getPackageServices({packageId: pendingPackage.servicePackage.id})
        .then((res) => {
            pendingPackage.servicePackage.services = res;
        });
    };

    const getPackageClaims = (pendingPackage) => {
        // Get and append claims associated with this package
        return API.cui.getPackageClaims({qs: [['packageId', pendingPackage.servicePackage.id]]})
        .then((res) => {
            pendingPackage.servicePackage.claims = res;
        });
    };

    const getPackageDetails = (pendingPackage) => {
        // Get and append the package details for this package
        return API.cui.getPackage({packageId: pendingPackage.servicePackage.id})
        .then((res) => {
            pendingPackage.servicePackage.packageDetails = res;
        });
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    apiPromises.push(
    	// Get Person details based on userID param
    	API.cui.getPerson({personId: userId})
    	.then((res) => {
    		pendingRequests.user = res;
    	}, (error) => {
            console.log(error);
        })
    );

    apiPromises.push(
    	// Get user's pending service packages
	    API.cui.getPersonPendingServicePackages({qs: [['requestor.id', userId],['requestor.type', 'person']]})
	    .then((res) => {
	        pendingRequests.packages = res;
            let packagePromises = [];

            pendingRequests.packages.forEach((pendingPackage) => {
                // For each package get package claims/services/details
                packagePromises.push(getPackageServices(pendingPackage), getPackageClaims(pendingPackage), getPackageDetails(pendingPackage));
            });

            $q.all(packagePromises)
            .then(() => {
                pendingRequests.loading = false;
            })
            .catch((error) => {
                console.log(error);
                pendingRequests.loading = false;
            });
        })
	);

    $q.all(apiPromises)
    .catch((error) => {
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
