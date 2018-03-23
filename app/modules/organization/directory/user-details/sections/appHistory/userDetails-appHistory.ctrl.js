angular.module('organization')
.controller('userDetailsAppsHistoryCtrl',function(API,$stateParams,$q,$pagination,$state,$scope) {
	'use strict';

	const userDetailsAppsHistory = this,
        userId = $stateParams.userId,
        organizationId = $stateParams.orgId;
        userDetailsAppsHistory.activeRequestTab=true
        userDetailsAppsHistory.activeGrantTab=false

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
        if(userDetailsAppsHistory.grantedHistory.length>0){
            getCountsOfStatus("active")
            getCountsOfStatus("suspended")
            //To getFull count
            getCountsOfStatus(undefined)
        }
        userDetailsAppsHistory.loading = false
    })
    .catch((error) => {
    	userDetailsAppsHistory.loading = false
    	console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------
    const getCountsOfStatus=(qsValue)=>{
        let opts = {
            personId: userId
        }
        //Assign query strings if any value passed 
        //otherwise it will get full count
        if (qsValue) {
            opts.qs = [['status',qsValue]]
        }
        API.cui.getPersonApplicationsGrantHistory(opts)
        .then(res=>{
            if (!qsValue) {
                userDetailsAppsHistory.popupGrantedCount=res.length;
            }else if (qsValue==="active") {
                userDetailsAppsHistory.activeCount=res.length;
            }
            else{
                userDetailsAppsHistory.suspendedCount=res.length;
            }
            $scope.$digest();
        })
        .fail(err=>{

        })
    }
    
    userDetailsAppsHistory.search = Object.assign({}, $stateParams)
    userDetailsAppsHistory.search.page = userDetailsAppsHistory.search.page || 1;
    userDetailsAppsHistory.paginationPageSize = userDetailsAppsHistory.paginationPageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    userDetailsAppsHistory.search.pageSize = userDetailsAppsHistory.paginationPageSize;
    userDetailsAppsHistory.searchBy='name'
    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */

    userDetailsAppsHistory.pageChange = (newpage) => {
        userDetailsAppsHistory.updateSearch('page', newpage, 'request')
    }

    userDetailsAppsHistory.pageGrantedChange = (newpage) => {
        userDetailsAppsHistory.updateSearch('page', newpage, 'grant')
    }

    userDetailsAppsHistory.updateSearch = (updateType, updateValue, updatePage) => {
        userDetailsAppsHistory.loading = true
        switch (updateType) {
            case 'requesteddate':
                switchBetween('sortBy', '+requestedDate', '-requestedDate')
                break
            case 'decisiondate':
                switchBetween('sortBy', '+evaluationDate', '-evaluationDate')
                break
            case 'status':
                userDetailsAppsHistory.search.page = 1
                userDetailsAppsHistory.search['status'] = updateValue
                break
            case 'eventdate':
                switchBetween('sortBy', '+eventDate', '-eventDate')
                break
            case 'eventType':
                switchBetween('sortBy', '+eventType', '-eventType')
                break
            case 'actorId':
                switchBetween('sortBy', '+actorId', '-actorId')
                break
            case 'search':
                if(userDetailsAppsHistory.searchBy==='name'){
                    userDetailsAppsHistory.search['name'] = updateValue
                    userDetailsAppsHistory.search['eventType'] = undefined}
                else{
                    userDetailsAppsHistory.search['name'] = undefined
                    userDetailsAppsHistory.search['eventType'] = updateValue}
                break
        }

        let queryParams = [['page', String(userDetailsAppsHistory.search.page)], ['pageSize', String(userDetailsAppsHistory.search.pageSize)]];
        if(userDetailsAppsHistory.search.sortBy)
            queryParams.push(['sortBy',userDetailsAppsHistory.search['sortBy']])
        if(userDetailsAppsHistory.search.status)
            queryParams.push(['status',userDetailsAppsHistory.search['status']])
        if(userDetailsAppsHistory.search.name)
            queryParams.push(['name',userDetailsAppsHistory.search['name']])
        if(userDetailsAppsHistory.search.eventType)
            queryParams.push(['eventType',userDetailsAppsHistory.search['eventType']])
        const opts = {
            personId:userId,
            qs: queryParams
        };
        userDetailsAppsHistory.search.userId=userId
        userDetailsAppsHistory.search.orgId=organizationId

        // doesn't change state, only updates the url
        $state.transitionTo('organization.directory.userDetails', userDetailsAppsHistory.search, { notify:false })
             if(updatePage=='request'){
                userDetailsAppsHistory.requestedHistory = [];
                 API.cui.getPersonApplicationsRequestHistory(opts)
                 .then(res => {
                    userDetailsAppsHistory.requestedHistory=res
                    userDetailsAppsHistory.loading = false
                    $scope.$digest()
                 })
                 .fail(err =>{
                    userDetailsAppsHistory.loading = false
                    console.log(err)
                 })
             }else{
                 userDetailsAppsHistory.grantedHistory = [];
                 API.cui.getPersonApplicationsGrantHistory(opts)
                 .then(res => {
                   userDetailsAppsHistory.grantedHistory=res
                   userDetailsAppsHistory.loading = false
                    $scope.$digest()
                 })
                 .fail(err =>{
                    userDetailsAppsHistory.loading = false
                    console.log(err)
                 })
             } 
    }

    const switchBetween = (property, firstValue, secondValue) => {
        // helper function to switch a property between two values or set to undefined if values not passed
        if (!firstValue) {
            userDetailsAppsHistory.search[property] = undefined
            return
        }
        userDetailsAppsHistory.search[property] = userDetailsAppsHistory.search[property] === firstValue
            ? secondValue
            : firstValue
    }

    $scope.$watch("userDetailsAppsHistory.activeRequestTab", function(n) {
            userDetailsAppsHistory.search = undefined
            userDetailsAppsHistory.search = Object.assign({}, {})
            userDetailsAppsHistory.search.page = 1
            let value=(userDetailsAppsHistory.activeRequestTab)?'request':'grant'
            userDetailsAppsHistory.search.pageSize = userDetailsAppsHistory.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
            userDetailsAppsHistory.updateSearch('','',value)
    }, true);
    $scope.$watch("userDetailsAppsHistory.activeGrantTab", function(n) {
           userDetailsAppsHistory.search = undefined  
           userDetailsAppsHistory.search = Object.assign({}, {})
           userDetailsAppsHistory.search.page = 1
           userDetailsAppsHistory.search.pageSize = userDetailsAppsHistory.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
           let value=(userDetailsAppsHistory.activeGrantTab)?'grant':'request'
           userDetailsAppsHistory.updateSearch('','',value)
    }, true);
});
