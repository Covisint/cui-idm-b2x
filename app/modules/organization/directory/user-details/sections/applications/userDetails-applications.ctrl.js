angular.module('organization')
.controller('userDetailsAppsCtrl',['API','$stateParams','$q',
function(API,$stateParams,$q) {
    'use strict';

	const userDetailsApps = this,
        userId = $stateParams.userID,
        organizationId = $stateParams.orgID;

    let apiPromises = [];

    // ON LOAD START ---------------------------------------------------------------------------------

    apiPromises.push(
        // Get user's granted applications
        API.cui.getPersonGrantedApps({personId: userId})
        .then((res) => {
            userDetailsApps.appList = res;
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
    .then((res) => {
        userDetailsApps.loading = false;
    })
    .catch((error) => {
        userDetailsApps.loading = false;
        console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    userDetailsApps.goToAppDetails = (application) => {
        console.log('TODO!');
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
