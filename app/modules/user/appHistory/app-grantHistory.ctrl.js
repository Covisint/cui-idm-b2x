angular.module('user')
.controller('appGrantHistoryCtrl', function(Loader, User, $scope, API, APIError, $filter,$pagination,$q,$state,$stateParams) {

    const appGrantHistory = this
    const scopeName = 'appGrantHistory.'
    appGrantHistory.search = Object.assign({}, $stateParams)
    appGrantHistory.search.page = appGrantHistory.search.page || 1;
    appGrantHistory.paginationPageSize = appGrantHistory.paginationPageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    appGrantHistory.search.pageSize = appGrantHistory.paginationPageSize;
    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */

    appGrantHistory.pageGrantedChange = (newpage) => {
        appGrantHistory.updateSearch('page', '1','granted')
    }

    appGrantHistory.pageRequestedChange = (newpage) => {
        appGrantHistory.updateSearch('page', '1','requested')
    }

    appGrantHistory.updateSearch = (updateType, updateValue,updatePage) => {
        switch (updateType) {
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
                appGrantHistory.search.page = 1
                appGrantHistory.search['grant.status'] = updateValue
                break
            case 'page':
            if (updatePage==='granted') {
                appGrantHistory.search.page = appGrantHistory.grantedSearch.page
                appGrantHistory.search.pageSize = appGrantHistory.grantedSearch.pageSize
            };
                
                break
        }

        let queryParams = [['page', String(appGrantHistory.search.page)], ['pageSize', String(appGrantHistory.search.pageSize)]];
        if(appGrantHistory.search.sortBy)
            queryParams.push(['sortBy',appGrantHistory.search['sortBy']])
        const opts = {
            personId:User.user.id,
            qs: queryParams
        };

        // doesn't change state, only updates the url
        $state.transitionTo('user.appGrantHistory', appGrantHistory.search, { notify:false })
        if(updatePage=='requested'){
            console.log(appGrantHistory.search);
            appGrantHistory.requestedHistory = [];
             API.cui.getPersonApplicationsRequestHistory(opts)
             .then(res => {
                appGrantHistory.requestedHistory=res;
                // if(appGrantHistory.requestedHistory.length>0)
                //     getPkgDetailsRequested(appGrantHistory.requestedHistory);
                $scope.$digest()
             })
             .fail(err =>{
                APIError.onFor(scopeName + 'initHistory')
                console.log(err)
             })
              //onLoad(true,opts)
        }
        else if(updatePage=='granted'){
            console.log(appGrantHistory.search);
             appGrantHistory.grantedHistory = [];
             API.cui.getPersonApplicationsGrantHistory(opts)
             .then(res => {
               appGrantHistory.grantedHistory=res;
                // if(appGrantHistory.grantedHistory.length>0)
                //     getPkgDetailsGrant(appGrantHistory.grantedHistory);
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
            appGrantHistory.search[property] = undefined
            return
        }
        appGrantHistory.search[property] = appGrantHistory.search[property] === firstValue
            ? secondValue
            : firstValue
    }

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
                appGrantHistory.popupGrantedCount=res.length;
                console.log(appGrantHistory.popupGrantedCount);
            }else if (qsValue==="active") {
                appGrantHistory.activeCount=res.length;
                console.log(appGrantHistory.activeCount);
            }
            else{
                appGrantHistory.suspendedCount=res.length;
                console.log(appGrantHistory.suspendedCount);
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
                appGrantHistory.popuprequestedCount=res.length;
                console.log(appGrantHistory.popuprequestedCount);
            }else if (qsValue==="active") {
                appGrantHistory.yesCount=res.length;
                console.log(appGrantHistory.yesCount);
            }
            else{
                appGrantHistory.noCount=res.length;
                console.log(appGrantHistory.noCount);
            }
            $scope.$digest();
        })
        .fail(err=>{

        })
    }
    /* -------------------------------------------- HELPER FUNCTIONS END ----------------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    appGrantHistory.user=User.user

    let queryParams = [['page', String(appGrantHistory.search.page)], ['pageSize', String(appGrantHistory.search.pageSize)]];
        if(appGrantHistory.search.sortBy)
            queryParams.push(['sortBy',appGrantHistory.search['sortBy']])
        const opts = {
            personId:User.user.id,
            qs: queryParams
        };

    Loader.onFor(scopeName + 'initHistory')
     API.cui.getPersonApplicationsGrantHistory(opts)
     .then(res => {
        appGrantHistory.grantedHistory=res;
        // if(appGrantHistory.grantedHistory.length>0)
        //     getPkgDetailsGrant(appGrantHistory.grantedHistory);
        return API.cui.getPersonApplicationsRequestHistory(opts);
     })
     .then(res => {
        appGrantHistory.requestedHistory=res;
        // if(appGrantHistory.requestedHistory.length>0)
        //     getPkgDetailsRequested(appGrantHistory.requestedHistory);
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
        appGrantHistory.grantedHistoryCount=res
        /*appGrantHistory.grantedHistoryCount=20*/
        return API.cui.getPersonApplicationsRequestHistoryCount(opts) 
     })
     .then(res => {
        console.log(res)
        appGrantHistory.count=res
        /*console.log(appGrantHistory.count)*/
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