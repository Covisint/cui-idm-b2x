angular.module('organization')
.controller('personRequestCtrl',function(API,$stateParams,$q,$state,DataStorage,$scope) {
    'use strict';

    const personRequest = this,
    		userId = $stateParams.userID,
    		orgId = $stateParams.orgID;

    let apiPromises = [];

    personRequest.loading = true;

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
    		personRequest.user = res;
    	}),

        API.cui.getPersonRegistrationRequest({qs: [['registrant.id', userId]]})
        .then((res) => {
            personRequest.userPersonRequest = res[0];
        }),

        API.cui.getOrganization({organizationId: orgId})
        .then((res) => {
            personRequest.organization = res;
        }),

        API.cui.getPersonPendingServicePackages({qs: [['requestor.id', userId],['requestor.type', 'person']]})
        .then((res) => {
            personRequest.packages = res;
            let packagePromises = [];

            res.forEach((pendingPackage) => {
                // For each package get package claims/services/details
                packagePromises.push(getPackageServices(pendingPackage), getPackageClaims(pendingPackage), getPackageDetails(pendingPackage));
            });

            $q.all(packagePromises)
            .then(() => {
                personRequest.loading = false;
            })
            .catch((error) => {
                console.log(error);
                personRequest.loading = false;
            });
        })
    );

    $q.all(apiPromises)
    .catch((error) => {
        console.log(error);
        personRequest.loading = false;
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    personRequest.reviewApprovals = () => {
        if (personRequest.packages && personRequest.packages.length > 0) {
            DataStorage.set(userId, 'userRequestedPackages', personRequest.packages);
        }
        DataStorage.set(userId, 'userPersonRequest', personRequest.userPersonRequest);
        $state.go('organization.requests.personRequestReview', {userID: userId, orgID: orgId});
    };

    // ON CLICK END ----------------------------------------------------------------------------------

});
