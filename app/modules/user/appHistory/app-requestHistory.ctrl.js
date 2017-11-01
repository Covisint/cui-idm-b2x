angular.module('user')
.controller('appRequestHistoryCtrl', function(Loader, User, $scope, API, APIError, $filter,$pagination,$q,$state,$stateParams) {

    const appRequestHistory = this
    const scopeName = 'appRequestHistory.'
    appRequestHistory.search = Object.assign({}, $stateParams)
    appRequestHistory.search.page = appRequestHistory.search.page || 1;
    appRequestHistory.paginationPageSize = appRequestHistory.paginationPageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    appRequestHistory.search.pageSize = appRequestHistory.paginationPageSize;
    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */

    appRequestHistory.pageChange = (newpage) => {
        appRequestHistory.updateSearch('page', newpage)
    }

    appRequestHistory.updateSearch = (updateType, updateValue) => {
        switch (updateType) {
            case 'alphabetic':
                switchBetween('sortBy', '+service.name', '-service.name')
                break
            case 'requesteddate':
                switchBetween('sortBy', '+requestedDate', '-requestedDate')
                break
            case 'decisiondate':
                switchBetween('sortBy', '+evaluationDate', '-evaluationDate')
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
            case 'evaluator':
                switchBetween('sortBy', '+evaluatorId', '-evaluatorId')
                break
            case 'status':
                appRequestHistory.search.page = 1
                appRequestHistory.search['grant.status'] = updateValue
                break
        }

        let queryParams = [['page', String(appRequestHistory.search.page)], ['pageSize', String(appRequestHistory.search.pageSize)]];
        if(appRequestHistory.search.sortBy)
            queryParams.push(['sortBy',appRequestHistory.search['sortBy']])
        const opts = {
            personId:User.user.id,
            qs: queryParams
        };

        // doesn't change state, only updates the url
        $state.transitionTo('user.appRequestHistory', appRequestHistory.search, { notify:false })
            console.log(appRequestHistory.search);
            appRequestHistory.requestedHistory = [];
             API.cui.getPersonApplicationsRequestHistory(opts)
             .then(res => {
                appRequestHistory.requestedHistory=res;
                // if(appRequestHistory.requestedHistory.length>0)
                //     getPkgDetailsRequested(appRequestHistory.requestedHistory);
                $scope.$digest()
             })
             .fail(err =>{
                APIError.onFor(scopeName + 'initHistory')
                console.log(err)
             })
              //onLoad(true,opts)
    }

    const switchBetween = (property, firstValue, secondValue) => {
        // helper function to switch a property between two values or set to undefined if values not passed
        if (!firstValue) {
            appRequestHistory.search[property] = undefined
            return
        }
        appRequestHistory.search[property] = appRequestHistory.search[property] === firstValue
            ? secondValue
            : firstValue
    }
/*
     const onLoad = (previouslyLoaded,opts) => {
        console.log(appRequestHistory.search);
        appRequestHistory.requestedHistory = [];
         API.cui.getPersonApplicationsRequestHistory({personId:User.user.id,'qs':[['sortBy',appRequestHistory.search['sortBy']]] })
         .then(res => {
            appRequestHistory.requestedHistory=res;
            // if(appRequestHistory.requestedHistory.length>0)
            //     getPkgDetailsRequested(appRequestHistory.requestedHistory);
            $scope.$digest()
         })
         .fail(err =>{
            APIError.onFor(scopeName + 'initHistory')
            console.log(err)
         })
     }*/

/*     const onLoadGranted = (previouslyLoaded) => {
        appRequestHistory.grantedHistory = [];
         API.cui.getPersonApplicationsGrantHistory({personId:User.user.id,'qs':[['sortBy',appRequestHistory.search['sortBy']]] })
         .then(res => {
           appRequestHistory.grantedHistory=res;
            // if(appRequestHistory.grantedHistory.length>0)
            //     getPkgDetailsGrant(appRequestHistory.grantedHistory);
            $scope.$digest()
         })
         .fail(err =>{
            APIError.onFor(scopeName + 'initHistory')
            console.log(err)
         })
     }*/

     const getCountsOfStatus=(qsValue)=>{
        let opts = {
            personId: API.getUser(),
            useCuid:true
        }
        //Assign query strings if any value passed 
        //otherwise it will get full count
        if (qsValue) {
            opts.qs = [['status',qsValue]]
        }
        API.cui.getPersonApplicationsGrantHistory(opts)
        .then(res=>{
            if (!qsValue) {
                appRequestHistory.popupGrantedCount=res.length;
                console.log(appRequestHistory.popupGrantedCount);
            }else if (qsValue==="active") {
                appRequestHistory.activeCount=res.length;
                console.log(appRequestHistory.activeCount);
            }
            else{
                appRequestHistory.suspendedCount=res.length;
                console.log(appRequestHistory.suspendedCount);
            }
            $scope.$digest();
        })
        .fail(err=>{

        })
    }

    const getCountsOfApproved=(qsValue)=>{
        let opts = {
            personId: API.getUser(),
            useCuid:true
        }
        //Assign query strings if any value passed 
        //otherwise it will get full count
        if (qsValue) {
            opts.qs = [['status',qsValue]]
        }
        API.cui.getPersonApplicationsRequestHistory(opts)
        .then(res=>{
            if (!qsValue) {
                appRequestHistory.popuprequestedCount=res.length;
                console.log(appRequestHistory.popuprequestedCount);
            }else if (qsValue==="active") {
                appRequestHistory.yesCount=res.length;
                console.log(appRequestHistory.yesCount);
            }
            else{
                appRequestHistory.noCount=res.length;
                console.log(appRequestHistory.noCount);
            }
            $scope.$digest();
        })
        .fail(err=>{

        })
    }
    /* -------------------------------------------- HELPER FUNCTIONS END ----------------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    appRequestHistory.user=User.user

    let queryParams = [['page', String(appRequestHistory.search.page)], ['pageSize', String(appRequestHistory.search.pageSize)]];
        if(appRequestHistory.search.sortBy)
            queryParams.push(['sortBy',appRequestHistory.search['sortBy']])
        const opts = {
            personId:User.user.id,
            qs: queryParams
        };

    Loader.onFor(scopeName + 'initHistory')
     API.cui.getPersonApplicationsRequestHistory(opts)
     .then(res => {
        appRequestHistory.requestedHistory=res;
        // if(appRequestHistory.requestedHistory.length>0)
        //     getPkgDetailsRequested(appRequestHistory.requestedHistory);
/*        //to display in popover
        getCountsOfStatus("active")
        getCountsOfStatus("suspended")
        //To getFull count
        getCountsOfStatus(undefined)*/
/*        //to display in popover
        getCountsOfStatus("active")
        getCountsOfStatus("suspended")
        //To getFull count
        getCountsOfStatus(undefined)*/
       /* Loader.offFor(scopeName + 'initHistory')
        $scope.$apply();*/
        return API.cui.getPersonApplicationsRequestHistoryCount(opts) 
     })
     .then(res => {
        appRequestHistory.count=res
        Loader.offFor(scopeName + 'initHistory')
        $scope.$apply();
     })
     .fail(err =>{
        APIError.onFor(scopeName + 'initHistory')
        console.log(err)
     })
     .always( ()=>{
        Loader.offFor(scopeName + 'initHistory')
        $scope.$digest()
     })
    /* -------------------------------------------- ON LOAD END --------------------------------------------- */
    
})