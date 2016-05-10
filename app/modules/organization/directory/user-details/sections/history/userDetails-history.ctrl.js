angular.module('organization')
.controller('userDetailsHistoryCtrl',['API','$stateParams','$q',
function(API,$stateParams,$q) {
	'use strict';

	const userDetailsHistory = this,
        userId = $stateParams.userID,
        organizationId = $stateParams.orgID;

    let apiPromises = [];

}]);
