angular.module('organization')
.controller('userDetailsProfileCtrl',function($scope,API,$stateParams,Timezones,UserProfile,$q) {
    'use strict';

	const userDetailsProfile = this,
        userId = $stateParams.userID,
        organizationId = $stateParams.orgID;

	let apiPromises = [];

    userDetailsProfile.loading = true;

    // ON LOAD START ---------------------------------------------------------------------------------

    // Inject profile from UserProfile factory
    UserProfile.injectUI(userDetailsProfile, $scope, userId);

    apiPromises.push(
        // Get user profile
        UserProfile.getProfile({personId: userId})
        .then((res) => {
            angular.merge(userDetailsProfile, res);
        })
    );

    $q.all(apiPromises)
    .then((res) => {
        userDetailsProfile.loading = false;
    })
    .catch((error) => {
        userDetailsProfile.loading = false;
        console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

});
