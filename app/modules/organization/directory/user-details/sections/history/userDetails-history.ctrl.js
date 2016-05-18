angular.module('organization')
.controller('userDetailsHistoryCtrl',['API','$stateParams','$q',
function(API,$stateParams,$q) {
	'use strict';

	const userDetailsHistory = this,
        userId = $stateParams.userID,
        organizationId = $stateParams.orgID;

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

}]);