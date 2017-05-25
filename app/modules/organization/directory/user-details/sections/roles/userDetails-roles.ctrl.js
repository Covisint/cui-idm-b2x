angular.module('organization')
.controller('userDetailsRolesCtrl',function(API,$stateParams,$q) {
	'use strict';

	const userDetailsRoles = this,
        userId = $stateParams.userId,
        organizationId = $stateParams.orgId;

    let apiPromises = [];

    userDetailsRoles.loading = true;

    // ON LOAD START ---------------------------------------------------------------------------------

    apiPromises.push(
	    API.cui.getPersonRoles({personId: userId})
	    .then((res) => {
	    	userDetailsRoles.assignedRoles = res;
            API.cui.getPersonRolesGrantable({personId:userId})
            .then(res =>{
                userDetailsRoles.rolesGrantable=res;
            })
            .fail(err =>{
                userDetailsRoles.grantedHistoryError=true;
            })
	    })
    );

    apiPromises.push(
        API.cui.getPersonRolesGrantable({personId:userId})
        .then(res =>{
            userDetailsRoles.rolesGrantable=res;
        })
        .fail(err =>{
            userDetailsRoles.grantedHistoryError=true;
        })
    );

    $q.all(apiPromises)
    .then((res) => {
    	userDetailsRoles.loading = false;
    })
    .catch((error) => {
		userDetailsRoles.loading = false;
        userDetailsRoles.grantedHistoryError=true;
		console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

});
