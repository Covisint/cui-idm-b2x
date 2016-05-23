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
    	API.cui.getPerson({personId: userId})
    	.then((res) => {
    		orgRequest.user = res;
            console.log('orgRequest.user',orgRequest.user);
    	})
    );

    apiPromises.push(
    	API.cui.getPersonOrganizationRequest({qs: [['registrantId', userId]]})
    	.then((res) => {
    		orgRequest.userOrgRequest = res;
            console.log('orgRequest.userOrgRequest',orgRequest.userOrgRequest);
    	})
    );

    apiPromises.push(
    	API.cui.getOrganization({organizationId: orgId})
    	.then((res) => {
    		orgRequest.organization = res;
            console.log('orgRequest.organization',orgRequest.organization);
    	})
    );

    apiPromises.push(
        // Get user's pending service packages
        API.cui.getPersonPendingServicePackages({qs: [['requestor.id', userId],['requestor.type', 'person']]})
        .then((res) => {
            orgRequest.packages = res;
            let packagePromises = [];

            res.forEach((pendingPackage) => {
                // For each package get package claims/services/details
                packagePromises.push(getPackageServices(pendingPackage), getPackageClaims(pendingPackage), getPackageDetails(pendingPackage));
            });

            $q.all(packagePromises)
            .then(() => {
                console.log('orgRequest.packages', orgRequest.packages);
                orgRequest.loading = false;
            })
            .catch((error) => {
                console.log(error);
                orgRequest.loading = false;
            });
        })
    );

    $q.all(apiPromises)
    .catch((error) => {
        console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    orgRequest.reviewApprovals = () => {
        $state.go('requests.organizationRequestReview');
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
