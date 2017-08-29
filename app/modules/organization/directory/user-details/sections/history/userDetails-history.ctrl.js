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
    
    let today=new Date()
    let dd=today.getDate()
    let yyyy=today.getFullYear()
    let mmm=today.toString().substring(4,7);
    let qsLastDate= dd+'-'+mmm+'-'+yyyy
        
	
    apiPromises.push(
		/*API.cui.getPersonStatusHistory({qs: [['userId', String(userId)]]}),*/
        API.cui.getPersonDetailedStatusHistory({qs : [
                ['userId', userId], 
                ['startDate','01-Jan-2016'],
                ['lastDate',qsLastDate]
            ]})/*,
         API.cui.getPasswordCangeHistory({personId:userId})*/
    );

    $q.all(apiPromises)
    .then((res) => {
        userDetailsHistory.statusHistory = res[0]
        /*userDetailsHistory.passwordChangeHistory = res[1]*/
    	userDetailsHistory.loading = false;
    })
    .catch((error) => {
    	userDetailsHistory.loading = false;
    	console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

});
