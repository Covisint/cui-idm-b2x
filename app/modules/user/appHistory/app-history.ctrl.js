angular.module('user')
.controller('appHistoryCtrl', function(Loader, User, $scope, API, APIError, $filter,$pagination,$q,$state,$stateParams) {

    const appHistory = this
    const scopeName = 'appHistory.'
    appHistory.search = Object.assign({}, $stateParams)
    appHistory.search.page = appHistory.search.page || 1;
    appHistory.paginationPageSize = appHistory.paginationPageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    appHistory.search.pageSize = appHistory.paginationPageSize;
    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */

    appHistory.pageGrantedChange = (newpage) => {
        appHistory.updateSearch('page', '1','granted')
    }

    appHistory.pageRequestedChange = (newpage) => {
        appHistory.updateSearch('page', '1','requested')
    }

    appHistory.updateSearch = (updateType, updateValue,updatePage) => {
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
            case 'evaluator':
                switchBetween('sortBy', '+evaluatorId', '-evaluatorId')
                break
            case 'status':
                appHistory.search.page = 1
                appHistory.search['grant.status'] = updateValue
                break
            case 'page':
                appHistory.search.page = appHistory.grantedSearch.page
                appHistory.search.pageSize = appHistory.grantedSearch.pageSize
                break
        }

        let queryParams = [['page', String(appHistory.search.page)], ['pageSize', String(appHistory.search.pageSize)]];
        if(appHistory.search.sortBy)
            queryParams.push(['sortBy',appHistory.search['sortBy']])
        const opts = {
            personId:User.user.id,
            qs: queryParams
        };

        // doesn't change state, only updates the url
        $state.transitionTo('user.appHistory', appHistory.search, { notify:false })
        if(updatePage=='requested'){
            console.log(appHistory.search);
            appHistory.requestedHistory = [];
             API.cui.getPersonApplicationsRequestHistory(opts)
             .then(res => {
                appHistory.requestedHistory=res;
                // if(appHistory.requestedHistory.length>0)
                //     getPkgDetailsRequested(appHistory.requestedHistory);
                $scope.$digest()
             })
             .fail(err =>{
                APIError.onFor(scopeName + 'initHistory')
                console.log(err)
             })
              //onLoad(true,opts)
        }
        else if(updatePage=='granted'){
            console.log(appHistory.search);
             appHistory.grantedHistory = [];
             API.cui.getPersonApplicationsGrantHistory(opts)
             .then(res => {
               appHistory.grantedHistory=res;
                // if(appHistory.grantedHistory.length>0)
                //     getPkgDetailsGrant(appHistory.grantedHistory);
                $scope.$digest()
             })
             .fail(err =>{
                APIError.onFor(scopeName + 'initHistory')
                console.log(err)
             })
          //onLoadGranted(true,opts)
        }  
        else
            return undefined

    }

    const switchBetween = (property, firstValue, secondValue) => {
        // helper function to switch a property between two values or set to undefined if values not passed
        if (!firstValue) {
            appHistory.search[property] = undefined
            return
        }
        appHistory.search[property] = appHistory.search[property] === firstValue
            ? secondValue
            : firstValue
    }
/*
     const onLoad = (previouslyLoaded,opts) => {
        console.log(appHistory.search);
        appHistory.requestedHistory = [];
         API.cui.getPersonApplicationsRequestHistory({personId:User.user.id,'qs':[['sortBy',appHistory.search['sortBy']]] })
         .then(res => {
            appHistory.requestedHistory=res;
            // if(appHistory.requestedHistory.length>0)
            //     getPkgDetailsRequested(appHistory.requestedHistory);
            $scope.$digest()
         })
         .fail(err =>{
            APIError.onFor(scopeName + 'initHistory')
            console.log(err)
         })
     }*/

/*     const onLoadGranted = (previouslyLoaded) => {
        appHistory.grantedHistory = [];
         API.cui.getPersonApplicationsGrantHistory({personId:User.user.id,'qs':[['sortBy',appHistory.search['sortBy']]] })
         .then(res => {
           appHistory.grantedHistory=res;
            // if(appHistory.grantedHistory.length>0)
            //     getPkgDetailsGrant(appHistory.grantedHistory);
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
                appHistory.popupGrantedCount=res.length;
                console.log(appHistory.popupGrantedCount);
            }else if (qsValue==="active") {
                appHistory.activeCount=res.length;
                console.log(appHistory.activeCount);
            }
            else{
                appHistory.suspendedCount=res.length;
                console.log(appHistory.suspendedCount);
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
                appHistory.popuprequestedCount=res.length;
                console.log(appHistory.popuprequestedCount);
            }else if (qsValue==="active") {
                appHistory.yesCount=res.length;
                console.log(appHistory.yesCount);
            }
            else{
                appHistory.noCount=res.length;
                console.log(appHistory.noCount);
            }
            $scope.$digest();
        })
        .fail(err=>{

        })
    }
    /* -------------------------------------------- HELPER FUNCTIONS END ----------------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    appHistory.user=User.user

    let queryParams = [['page', String(appHistory.search.page)], ['pageSize', String(appHistory.search.pageSize)]];
        if(appHistory.search.sortBy)
            queryParams.push(['sortBy',appHistory.search['sortBy']])
        const opts = {
            personId:User.user.id,
            qs: queryParams
        };

    Loader.onFor(scopeName + 'initHistory')
     API.cui.getPersonApplicationsGrantHistory(opts)
     .then(res => {
        appHistory.grantedHistory=res;
        // if(appHistory.grantedHistory.length>0)
        //     getPkgDetailsGrant(appHistory.grantedHistory);
        return API.cui.getPersonApplicationsRequestHistory(opts);
     })
     .then(res => {
        appHistory.requestedHistory=res;
        // if(appHistory.requestedHistory.length>0)
        //     getPkgDetailsRequested(appHistory.requestedHistory);
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
        return API.cui.getPersonApplicationsGrantHistoryCount(opts)
     })
     .then(res =>{
        console.log(res)
        appHistory.grantedHistoryCount=res
        appHistory.grantedHistoryCount=20
        return API.cui.getPersonApplicationsRequestHistoryCount(opts) 
     })
     .then(res => {
        console.log(res)
        appHistory.count=15
        console.log(appHistory.count)
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