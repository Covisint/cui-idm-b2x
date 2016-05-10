angular.module('organization')
.controller('userDetailsRolesCtrl',['API','$stateParams','$q',
function(API,$stateParams,$q) {
	'use strict';

	const userDetailsRoles = this,
        userId = $stateParams.userID,
        organizationId = $stateParams.orgID;

    let apiPromises = [];

    userDetailsRoles.loading = true;

    // ON LOAD START ---------------------------------------------------------------------------------

    apiPromises.push(
	    API.cui.getPersonRoles({personId: userId})
	    .then((res) => {
	    	userDetailsRoles.assignedRoles = res;
	    })
    );

    $q.all(apiPromises)
    .then((res) => {
    	userDetailsRoles.loading = false;
    })
    .catch((error) => {
		userDetailsRoles.loading = false;
		console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
