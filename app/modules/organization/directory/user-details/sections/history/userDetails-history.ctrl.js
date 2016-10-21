angular.module('organization')
.controller('userDetailsHistoryCtrl',function(API,$stateParams,$q) {
	'use strict';

	const userDetailsHistory = this,
        userId = $stateParams.userId,
        organizationId = $stateParams.orgId;

    let apiPromises = [];

    userDetailsHistory.loading = true;
    userDetailsHistory.sortClicked = false;

    // ON LOAD START ---------------------------------------------------------------------------------

	apiPromises.push(
		API.cui.getPersonStatusHistory({qs: [['userId', String(userId)]]})
    	.then((res) => {
    		userDetailsHistory.personStatusHistory = res;
    	})
    );

    $q.all(apiPromises)
    .then((res) => {
    	userDetailsHistory.loading = false;
    })
    .catch((error) => {
    	userDetailsHistory.loading = false;
    	console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

});
