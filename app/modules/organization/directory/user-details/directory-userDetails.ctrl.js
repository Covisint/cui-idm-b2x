angular.module('organization')
.controller('userDetailsCtrl', ['API','$stateParams','$q',
function(API,$stateParams,$q) {
    'use strict';

    const userDetails = this,
        userId = $stateParams.userID,
        organizationId = $stateParams.orgID;

    let apiPromises = [];

    userDetails.loading = true;
    userDetails.profileRolesSwitch = true;
    userDetails.appsHistorySwitch = true;

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

}]);
