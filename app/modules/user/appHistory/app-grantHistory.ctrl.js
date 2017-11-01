angular.module('user')
.controller('appGrantHistoryCtrl', function(Loader, User, $scope, API, APIError, $filter,$pagination,$q,$state,$stateParams) {

    const appGrantHistory = this
    const scopeName = 'appGrantHistory.'
    appGrantHistory.search = Object.assign({}, $stateParams)
    appGrantHistory.search.page = appGrantHistory.search.page || 1;
    appGrantHistory.paginationPageSize = appGrantHistory.paginationPageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    appGrantHistory.search.pageSize = appGrantHistory.paginationPageSize;
    appGrantHistory.searchBy='name'
    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */

    appGrantHistory.pageGrantedChange = (newpage) => {
        appGrantHistory.updateSearch('page', newpage)
    }

    appGrantHistory.updateSearch = (updateType, updateValue) => {
        switch (updateType) {
            case 'eventdate':
                switchBetween('sortBy', '+eventDate', '-eventDate')
                break
            case 'eventType':
                switchBetween('sortBy', '+eventType', '-eventType')
                break
            case 'actorId':
                switchBetween('sortBy', '+actorId', '-actorId')
                break
            case 'status':
                appGrantHistory.search.page = 1
                appGrantHistory.search['status'] = updateValue
                break
            case 'search':
                if(appGrantHistory.searchBy==='name')
                    appGrantHistory.search['name'] = updateValue
                else
                    appGrantHistory.search['eventType'] = updateValue
                break

        }

        let queryParams = [['page', String(appGrantHistory.search.page)], ['pageSize', String(appGrantHistory.search.pageSize)]];
        if(appGrantHistory.search.sortBy)
            queryParams.push(['sortBy',appGrantHistory.search['sortBy']])
        if(appGrantHistory.search.status)
            queryParams.push(['status',appGrantHistory.search['status']])
        if(appGrantHistory.search.name)
            queryParams.push(['name',appGrantHistory.search['name']])
        if(appGrantHistory.search.eventType)
            queryParams.push(['eventType',appGrantHistory.search['eventType']])
        const opts = {
            personId:User.user.id,
            qs: queryParams
        };

        // doesn't change state, only updates the url
        $state.transitionTo('user.appGrantHistory', appGrantHistory.search, { notify:false })
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
        // if(appGrantHistory.requestedHistory.length>0)
        //     getPkgDetailsRequested(appGrantHistory.requestedHistory);
        //to display in popover
        getCountsOfStatus("active")
        getCountsOfStatus("suspended")
        //To getFull count
        getCountsOfStatus(undefined)
    
        return API.cui.getPersonApplicationsGrantHistoryCount(opts)
     })
     .then(res =>{
        console.log(res)
        appGrantHistory.count=res
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