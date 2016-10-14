angular.module('organization')
.controller('userDetailsAppsCtrl',function(API,$stateParams,$q) {
    'use strict';

	const userDetailsApps = this,
        userId = $stateParams.userId,
        organizationId = $stateParams.orgId;

    let apiPromises = [];

    userDetailsApps.loading = true;
    userDetailsApps.appList = [];

    const getPackageServices = (servicePackage) => {
        return API.cui.getPackageServices({packageId: servicePackage.servicePackage.id})
        .then((res) => {
            res.forEach((pendingService) => {
                pendingService.grant = { 
                    status: 'pending'
                };
                userDetailsApps.appList.push(pendingService);
            });
        });
    };

    // ON LOAD START ---------------------------------------------------------------------------------

    apiPromises.push(
        // Get user's granted applications
        API.cui.getPersonGrantedApps({personId: userId})
        .then((res) => {
            res.forEach((grantedApp) => {
                userDetailsApps.appList.push(grantedApp);
            });
        })
    );

    apiPromises.push(
        // Get user's pending service packages
        API.cui.getPersonPendingServicePackages({qs: [['requestor.id', userId],['requestor.type', 'person']]})
        .then((res) => {
            let pendingServicePromises = [];

            res.forEach((servicePackage) => {
                // For each packages get its services
                pendingServicePromises.push(getPackageServices(servicePackage));
            });

            $q.all(pendingServicePromises)
            .then(() => {
                userDetailsApps.loading = false;
            })
            .catch((error) => {
                userDetailsApps.loading = false;
                console.log(error);
            });
        })
    );

    apiPromises.push(
        // Get categories of applications
        API.cui.getCategories()
        .then((res) => {
            userDetailsApps.appCategories = res;
        })
    );

    apiPromises.push(
        // Get user's granted applications count
        API.cui.getPersonGrantedCount({personId: userId})
        .then((res) => {
            userDetailsApps.appCount = res;
        })
    );

    $q.all(apiPromises)
    .catch((error) => {
        userDetailsApps.loading = false;
        console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

});
