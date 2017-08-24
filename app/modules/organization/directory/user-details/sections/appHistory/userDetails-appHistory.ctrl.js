angular.module('organization')
.controller('userDetailsAppsHistoryCtrl',function(API,$stateParams,$q) {
	'use strict';

	const userDetailsAppsHistory = this,
        userId = $stateParams.userId,
        organizationId = $stateParams.orgId;

    let apiPromises = [];

    userDetailsAppsHistory.loading = true;
    userDetailsAppsHistory.sortClicked = false;

/*     let queryParams = [['page', String(userDetailsAppsHistory.search.page)], ['pageSize', String(userDetailsHistory.search.pageSize)]];
        if(userDetailsAppsHistory.search.sortBy)
            queryParams.push(['sortBy',userDetailsAppsHistory.search['sortBy']])*/
        const opts = {
            personId:userId
        };

    // ON LOAD START ---------------------------------------------------------------------------------
       
	
    apiPromises.push(
		
       API.cui.getPersonApplicationsGrantHistory(opts),
        API.cui.getPersonApplicationsGrantHistoryCount(opts),
        API.cui.getPersonApplicationsRequestHistory(opts),
        API.cui.getPersonApplicationsRequestHistoryCount(opts)
    );

    $q.all(apiPromises)
    .then((res) => {

        userDetailsAppsHistory.grantedHistory=res[0]
        userDetailsAppsHistory.grantedHistoryCount=res[1]
        userDetailsAppsHistory.requestedHistory=res[2]
        userDetailsAppsHistory.requestedHistoryCount=res[3]
    	userDetailsAppsHistory.loading = false;
    })
    .catch((error) => {
    	userDetailsAppsHistory.loading = false;
    	console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

});
