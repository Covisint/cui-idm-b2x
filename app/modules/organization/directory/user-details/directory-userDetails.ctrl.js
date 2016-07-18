angular.module('organization')
.controller('userDetailsCtrl',function(API,$stateParams,$q) {
    'use strict';

    const userDetails = this,
        userId = $stateParams.userID;

    let apiPromises = [];

    userDetails.loading = true;
    userDetails.profileRolesSwitch = true;
    userDetails.appsHistorySwitch = true;
    userDetails.organizationId = $stateParams.orgID;
    userDetails.profileSwitch = "profile";

    // ON LOAD START ---------------------------------------------------------------------------------

    apiPromises.push(
        // Get user
        API.cui.getPerson({personId: userId})
        .then((res) => {
            userDetails.user = res;
        })
    );

    $q.all(apiPromises)
    .then((res) => {
        userDetails.loading = false;
    })
    .catch((error) => {
        userDetails.loading = false;
        console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

});
