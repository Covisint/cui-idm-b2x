angular.module('organization')
.controller('orgDetailsHierarchyCtrl',function(API,$stateParams,$q) {
	'use strict';

	const orgDetailsHierarchy = this,
        userId = $stateParams.userId,
        organizationId = $stateParams.orgId;

    let apiPromises = [];

    orgDetailsHierarchy.loading = true;
    orgDetailsHierarchy.sortClicked = false;

    // ON LOAD START ---------------------------------------------------------------------------------

	apiPromises.push(
		API.cui.getPersonStatusHistory({qs: [['userId', String(userId)]]})
    	.then((res) => {
    		orgDetailsHierarchy.personStatusHistory = res;
    	})
    );

    $q.all(apiPromises)
    .then((res) => {
    	orgDetailsHierarchy.loading = false;
    })
    .catch((error) => {
    	orgDetailsHierarchy.loading = false;
    	console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

});
