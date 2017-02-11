angular.module('user')
.controller('appHistoryCtrl', function(Loader, User, $scope, API, APIError, $filter,$pagination,$q,$state,$stateParams) {

    const appHistory = this
    const scopeName = 'appHistory.'
    appHistory.search = Object.assign({}, $stateParams)
    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */
     const getPkgDetailsGrant = (app) => {
        appHistory.grantedHistoryWithPkg = []
        app.forEach(function(list){
             Loader.onFor(scopeName + 'initHistory')
            API.cui.getPackage({ packageId: list.packageId})
            .then(res => {
                APIError.offFor(scopeName + 'initHistory')
                list.pkg=res;
                appHistory.grantedHistoryWithPkg.push(list);
            })
            .fail(err => {
                APIError.onFor(scopeName + 'initHistory')
            })
            .always(() => {
                Loader.offFor(scopeName + 'initHistory')
                $scope.$digest()
            })
        })
       
    }

    const getPkgDetailsRequested = (app) => {
        appHistory.requestHistoryWithPkg = []
        
        app.forEach(function(list){
             Loader.onFor(scopeName + 'initHistory')
            API.cui.getPackage({ packageId: list.packageId})
            .then(res => {
                APIError.offFor(scopeName + 'initHistory')
                list.pkg=res;
                appHistory.requestHistoryWithPkg.push(list);
            })
            .fail(err => {
                APIError.onFor(scopeName + 'initHistory')
            })
            .always(() => {
                Loader.offFor(scopeName + 'initHistory')
                $scope.$digest()
            })
        })
       
    }

     appHistory.pageGrantedChange = (newpage) => {
        appHistory.updateSearch('page', newpage)
    }

     appHistory.pageRequestedChange = (newpage) => {
        appHistory.updateSearch('page', newpage)
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
        }

        // doesn't change state, only updates the url
        $state.transitionTo('user.appHistory', appHistory.search, { notify:false })
        if(updatePage=='requested')
            onLoad(true)
        else if(updatePage=='granted')
            onLoadGranted(true)
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

     const onLoad = (previouslyLoaded) => {
        console.log(appHistory.search);
        appHistory.requestedHistory = [];
         API.cui.getPersonApplicationsRequestHistory({personId:User.user.id,'qs':[['sortBy',appHistory.search['sortBy']]] })
         .then(res => {
            appHistory.requestedHistory=res;
            if(appHistory.requestedHistory.length>0)
                getPkgDetailsRequested(appHistory.requestedHistory);
            $scope.$digest()
         })
         .fail(err =>{
            APIError.onFor(scopeName + 'initHistory')
            console.log(err)
         })
     }

     const onLoadGranted = (previouslyLoaded) => {
        appHistory.grantedHistory = [];
         API.cui.getPersonApplicationsGrantHistory({personId:User.user.id,'qs':[['sortBy',appHistory.search['sortBy']]] })
         .then(res => {
           appHistory.grantedHistory=res;
            if(appHistory.grantedHistory.length>0)
                getPkgDetailsGrant(appHistory.grantedHistory);
            $scope.$digest()
         })
         .fail(err =>{
            APIError.onFor(scopeName + 'initHistory')
            console.log(err)
         })
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
    Loader.onFor(scopeName + 'initHistory')
     API.cui.getPersonApplicationsGrantHistory({personId:User.user.id})
     .then(res => {
        appHistory.grantedHistory=res;
        if(appHistory.grantedHistory.length>0)
            getPkgDetailsGrant(appHistory.grantedHistory);
        return API.cui.getPersonApplicationsRequestHistory({personId:User.user.id});
     })
     .then(res => {
        appHistory.requestedHistory=res;
        if(appHistory.requestedHistory.length>0)
            getPkgDetailsRequested(appHistory.requestedHistory);
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