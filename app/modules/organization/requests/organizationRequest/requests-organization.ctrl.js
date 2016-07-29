angular.module('organization')
.controller('orgRequestCtrl',function(API,$stateParams,$q,$state,DataStorage) {
    'use strict';

    const orgRequest = this,
    		orgId = $stateParams.orgID,
            registrantId = $stateParams.registrantID;

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
    	API.cui.getOrganizationRegistrationRequest({qs: [['registrantId', registrantId]]})
    	.then((res) => {
    		orgRequest.organizationRequest = res;
            console.log('orgRequest.organizationRequest',orgRequest.organizationRequest);
    	})
    );

    apiPromises.push(
    	API.cui.getOrganization({organizationId: orgId})
    	.then((res) => {
    		orgRequest.organization = res;
            console.log('orgRequest.organization',orgRequest.organization);
    	})
    );

    $q.all(apiPromises)
    .then(() => {
        orgRequest.loading = false;
    })
    .catch((error) => {
        orgRequest.loading = false;
        console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    orgRequest.reviewApprovals = () => {
        DataStorage.setType('organizationRequest', orgRequest.organizationRequest);
        $state.go('requests.organizationRequestReview', {orgID: orgId});
    };

    // ON CLICK END ----------------------------------------------------------------------------------

});
