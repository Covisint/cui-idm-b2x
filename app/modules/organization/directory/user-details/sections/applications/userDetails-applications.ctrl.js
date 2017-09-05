angular.module('organization')
.controller('userDetailsAppsCtrl',function(API,$stateParams,$q,$state,DataStorage,$pagination,$scope) {
    'use strict';

	const userDetailsApps = this,
        userId = $stateParams.userId,
        organizationId = $stateParams.orgId;
        userDetailsApps.activeAppsTab=true
        userDetailsApps.activeRequestTab=false
        userDetailsApps.activeGrantTab=false
        userDetailsApps.sortClicked = false
        userDetailsApps.onLoadFirst = true 

    let apiPromises = [];

    userDetailsApps.loading = true;
    userDetailsApps.appList = [];

    userDetailsApps.search = Object.assign({}, $stateParams)
    userDetailsApps.search.page = userDetailsApps.search.page || 1;
    userDetailsApps.search.pageSize = userDetailsApps.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    userDetailsApps.searchBy='name'
    const opts = {
        personId:userId
    };

    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    const getPackageServices = (servicePackage) => {
        return API.cui.getPackageServices({packageId: servicePackage.servicePackage.id})
        .then((res) => {
            res.forEach((pendingService) => {
                pendingService.grant = { 
                    status: 'pending'
                };
                pendingService.servicePackage=servicePackage
                userDetailsApps.appList.push(pendingService);
            });
        });
    };

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
                userDetailsApps.popupCount=res.length;
            }else if (qsValue==="active") {
                userDetailsApps.activeCount=res.length;
            }
            else{
                userDetailsApps.suspendedCount=res.length;
            }
            $scope.$digest();
        })
        .fail(err=>{

        })
    }

    // HELPER FUNCTIONS END ------------------------------------------------------------------------
    // ON LOAD START ---------------------------------------------------------------------------------

    const getPersonApps = () =>{
        // Pagination is complicated as we are showing the data from two api calls
        apiPromises.push(
            // Get user's granted applications
            API.cui.getPersonGrantedApps({personId: userId, qs:[['page','1'],['pageSize','200']]})
            .then((res) => {
                res.forEach((grantedApp) => {
                    userDetailsApps.appList.push(grantedApp);
                });
            })
        )
        apiPromises.push(
            // Get user's pending service packages
            API.cui.getPersonPendingServicePackages({qs: [['requestor.id', userId],['requestor.type', 'person'],['page','1'],['pageSize','200']]})
            .then((res) => {
                let pendingServicePromises = [];

                res.forEach((servicePackage) => {
                    // For each packages get its services
                    pendingServicePromises.push(getPackageServices(servicePackage));
                });

                $q.all(pendingServicePromises)
                .then(() => {
                    userDetailsApps.loading = false;
                })
                .catch((error) => {
                    userDetailsApps.loading = false;
                    console.log(error);
                });
            })
        )
        apiPromises.push(
            // Get categories of applications
            API.cui.getCategories()
            .then((res) => {
                userDetailsApps.appCategories = res;
            })
        );

        apiPromises.push(
            // Get user's granted applications count
            API.cui.getPersonGrantedAppCount({personId: userId})
            .then((res) => {
                userDetailsApps.appCount = res;
            })
        );

        $q.all(apiPromises)
        .catch((error) => {
            userDetailsApps.loading = false;
            console.log(error);
        });
    }

    getPersonApps()

    const getPersonRequestedApps = (opts) => {
        userDetailsApps.requestedHistory = [];
         API.cui.getPersonApplicationsRequestHistory(opts)
         .then(res => {
            userDetailsApps.requestedHistory=res
            API.cui.getPersonApplicationsRequestHistoryCount(opts)
            .then(res =>{
                userDetailsApps.requestedHistoryCount=res
                userDetailsApps.loading = false
                $scope.$digest()
            })
            .fail(err =>{
                userDetailsApps.loading = false
                console.log(err)
                $scope.$digest()
            })

         })
         .fail(err =>{
            userDetailsApps.loading = false
            console.log(err)
         })
    }

    const getPersonGrantedApps = (opts) => {
        userDetailsApps.grantedHistory = [];
         API.cui.getPersonApplicationsGrantHistory(opts)
         .then(res => {
           userDetailsApps.grantedHistory=res
           if(userDetailsApps.grantedHistory.length>0&&userDetailsApps.onLoadFirst){
                getCountsOfStatus("active")
                getCountsOfStatus("suspended")
                //To getFull count
                getCountsOfStatus(undefined)
                userDetailsApps.onLoadFirst=false
            }
            API.cui.getPersonApplicationsGrantHistoryCount(opts)
            .then(res =>{
                userDetailsApps.grantedHistoryCount=res
                userDetailsApps.loading = false
                $scope.$digest()
            })
            .fail(err =>{
                userDetailsApps.loading = false
                console.log(err)
                $scope.$digest()
            })
         })
         .fail(err =>{
            userDetailsApps.loading = false
            console.log(err)
         })
    }
 

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START ----------------------------------------------------------------------

    userDetailsApps.goToDetails = (application) => {
        DataStorage.setType('userAppDetail',application)
        if (application.grant.status==='pending') {
            $state.go('organization.requests.pendingRequests', {
                    'userId': userId, 
                    'orgId': organizationId,
                    'packageId': application.servicePackage.servicePackage.id
                })
        }
        else
        $state.go('organization.directory.userAppDetails',{appId:application.id,orgId:organizationId,userId:userId})
    }
    
    userDetailsApps.pageChange = (newpage) => {
        userDetailsApps.updateSearch('page', newpage, 'request')
    }

    userDetailsApps.pageGrantedChange = (newpage) => {
        userDetailsApps.updateSearch('page', newpage, 'grant')
    }

    userDetailsApps.pageAppsChange = (newpage) => {
        userDetailsApps.updateSearch('page', newpage, 'apps')
    }

    userDetailsApps.updateSearch = (updateType, updateValue, updatePage) => {
        userDetailsApps.loading = true
        switch (updateType) {
            case 'requesteddate':
                switchBetween('sortBy', '+requestedDate', '-requestedDate')
                break
            case 'decisiondate':
                switchBetween('sortBy', '+evaluationDate', '-evaluationDate')
                break
            case 'status':
                userDetailsApps.search.page = 1
                userDetailsApps.search['status'] = updateValue
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
                userDetailsApps.search.page = 1
                if(userDetailsApps.searchBy==='name'){
                    userDetailsApps.search['name'] = updateValue
                    userDetailsApps.search['eventType'] = undefined}
                else{
                    userDetailsApps.search['name'] = undefined
                    userDetailsApps.search['eventType'] = updateValue}
                break
        }

        if(userDetailsApps.search.page==0){
          userDetailsApps.search.page=1  
        }
        let queryParams = [['page', String(userDetailsApps.search.page)], ['pageSize', String(userDetailsApps.search.pageSize)]];
        if(userDetailsApps.search.sortBy)
            queryParams.push(['sortBy',userDetailsApps.search['sortBy']])
        if(userDetailsApps.search.status)
            queryParams.push(['status',userDetailsApps.search['status']])
        if(userDetailsApps.search.name)
            queryParams.push(['name',userDetailsApps.search['name']])
        if(userDetailsApps.search.eventType)
            queryParams.push(['eventType',userDetailsApps.search['eventType']])
        const opts = {
            personId:userId,
            qs: queryParams
        };
        userDetailsApps.search.userId=userId
        userDetailsApps.search.orgId=organizationId

        // doesn't change state, only updates the url
        $state.transitionTo('organization.directory.userDetails', userDetailsApps.search, { notify:false })
             if(updatePage=='request'){
                getPersonRequestedApps(opts)
             }
             else if(updatePage=='apps'){
                getPersonApps(opts)
             }
             else{
                 getPersonGrantedApps(opts)
             } 
    }

    const switchBetween = (property, firstValue, secondValue) => {
        // helper function to switch a property between two values or set to undefined if values not passed
        if (!firstValue) {
            userDetailsApps.search[property] = undefined
            return
        }
        userDetailsApps.search[property] = userDetailsApps.search[property] === firstValue
            ? secondValue
            : firstValue
    }

// ON CLICK FUNCTIONS END ------------------------------------------------------------------------

// $WATCHERS START ------------------------------------------------------------------------

    $scope.$watch("userDetailsApps.activeRequestTab", function(n) {
            userDetailsApps.search = undefined
            userDetailsApps.search = Object.assign({}, {})
            userDetailsApps.search.page = 1
            let value=(userDetailsApps.activeRequestTab)?'request':'grant'
            userDetailsApps.search.pageSize = userDetailsApps.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
            if(userDetailsApps.activeRequestTab){
               userDetailsApps.updateSearch('','',value)
           }
    }, true);
    $scope.$watch("userDetailsApps.activeGrantTab", function(n) {
           userDetailsApps.search = undefined  
           userDetailsApps.search = Object.assign({}, {})
           userDetailsApps.search.page = 1
           userDetailsApps.search.pageSize = userDetailsApps.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
           let value=(userDetailsApps.activeGrantTab)?'grant':'request'
           if(userDetailsApps.activeGrantTab){
            userDetailsApps.updateSearch('','',value)
           } 
    }, true);

    // $WATCHERS END ------------------------------------------------------------------------
});
