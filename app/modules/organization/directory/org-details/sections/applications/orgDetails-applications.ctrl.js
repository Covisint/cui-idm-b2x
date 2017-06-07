angular.module('organization')
.controller('orgDetailsAppsCtrl',function(API,$stateParams,$q,$state,DataStorage) {
    'use strict';

	const orgDetailsApps = this,
        userId = $stateParams.userId,
        organizationId = $stateParams.orgId;

    let apiPromises = [];

    orgDetailsApps.loading = true;
    orgDetailsApps.appList = [];

    const getPackageServices = (servicePackage) => {
        return API.cui.getPackageServices({packageId: servicePackage.servicePackage.id})
        .then((res) => {
            res.forEach((pendingService) => {
                pendingService.grant = { 
                    status: 'pending'
                };
                orgDetailsApps.appList.push(pendingService);
            });
        });
    };

    // ON LOAD START ---------------------------------------------------------------------------------

    apiPromises.push(
        // Get user's granted applications
        API.cui.getPersonGrantedApps({personId: userId})
        .then((res) => {
            res.forEach((grantedApp) => {
                orgDetailsApps.appList.push(grantedApp);
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
                orgDetailsApps.loading = false;
            })
            .catch((error) => {
                orgDetailsApps.loading = false;
                console.log(error);
            });
        })
    );

    apiPromises.push(
        // Get categories of applications
        API.cui.getCategories()
        .then((res) => {
            orgDetailsApps.appCategories = res;
        })
    );

    apiPromises.push(
        // Get user's granted applications count
        API.cui.getPersonGrantedAppCount({personId: userId})
        .then((res) => {
            orgDetailsApps.appCount = res;
        })
    );

    $q.all(apiPromises)
    .catch((error) => {
        orgDetailsApps.loading = false;
        console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START ----------------------------------------------------------------------

    orgDetailsApps.goToDetails = (application) => {
        DataStorage.setType('userAppDetail',application)
        $state.go('organization.directory.userAppDetails',{appId:application.id,orgId:organizationId,userId:userId})
    }

    // ON CLICK FUNCTIONS END ------------------------------------------------------------------------
});
