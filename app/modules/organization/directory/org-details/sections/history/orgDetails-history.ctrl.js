angular.module('organization')
.controller('orgDetailsHistoryCtrl',function(API,$stateParams,$q) {
	'use strict';

	const orgDetailsHistory = this,
        userId = $stateParams.userId,
        organizationId = $stateParams.orgId;

    let apiPromises = [];

    orgDetailsHistory.loading = true;
    orgDetailsHistory.sortClicked = false;

    // ON LOAD START ---------------------------------------------------------------------------------

	apiPromises.push(
		API.cui.getPersonStatusHistory({qs: [['userId', String(userId)]]})
    	.then((res) => {
    		orgDetailsHistory.personStatusHistory = res;
    	})
    );

    $q.all(apiPromises)
    .then((res) => {
    	orgDetailsHistory.loading = false;
    })
    .catch((error) => {
    	orgDetailsHistory.loading = false;
    	console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

});
