angular.module('organization')
.controller('organizationApplicationsCtrl', function(API,Sort,User,$filter,$pagination,$q,$scope,$state,$stateParams,Loader) {

    const organizationApplications = this;
    organizationApplications.stateParamsOrgId=$stateParams.orgId

    Loader.onFor('organizationApplications.init')
    organizationApplications.activeAppsTab=true
    organizationApplications.activeRequestTab=false
    organizationApplications.activeGrantTab=false
    organizationApplications.sortClicked = false
    organizationApplications.onLoadFirst = true 
    organizationApplications.search = {orgId:organizationApplications.stateParamsOrgId};
    organizationApplications.search.page = organizationApplications.search.page || 1;
    organizationApplications.paginationPageSize = organizationApplications.paginationPageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    organizationApplications.search.pageSize = organizationApplications.paginationPageSize;

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    /*const switchBetween = (property, firstValue, secondValue) => { 
        // helper function to switch a property between two values or set to undefined if values not passed;
        if(!firstValue) organizationApplications.search[property] = undefined;
        organizationApplications.search[property] === firstValue ? organizationApplications.search[property] = secondValue : organizationApplications.search[property] = firstValue;
    };*/

    /*const switchBetween = (property, firstValue, secondValue) => { 
        // helper function to switch a property between two values or set to undefined if values not passed;
        if(!firstValue) {
            organizationApplications.search[property] = undefined;
            return
        }
        organizationApplications.search[property] = organizationApplications.search[property] === firstValue
            ? secondValue
            : firstValue
    }*/

    const switchBetween = (property, firstValue, secondValue) => {
        // helper function to switch a property between two values or set to undefined if values not passed
        if (!firstValue) {
            organizationApplications.search[property] = undefined
            return
        }
        organizationApplications.search[property] = organizationApplications.search[property] === firstValue
            ? secondValue
            : firstValue
    }

    const getPackageServices = (ArrayOfPackages) => {
        let services = [];

        ArrayOfPackages.forEach((servicePackage) => {
            API.cui.getPackageServices({packageId: servicePackage.servicePackage.id})
            .then((res) => {
                res.forEach((service) => {
                    services.push(service);
                });
            });
        });

        return services;
    };

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    const onLoad = (previouslyLoaded) => {
        if (previouslyLoaded) {
            Loader.offFor('organizationApplications.init')
        }
        else {
            organizationApplications.search.name = $stateParams.name;
            organizationApplications.search.category = $stateParams.category;
            organizationApplications.search.sortBy = $stateParams.sortBy;
            organizationApplications.search.refine = $stateParams.refine;
            if($stateParams.page)
                organizationApplications.search.page = parseInt($stateParams.page);
            if($stateParams.pageSize)
                organizationApplications.search.pageSize = parseInt($stateParams.pageSize);

            
            API.cui.getOrgAppCategories({organizationId:organizationApplications.stateParamsOrgId})
            .then((res)=>{
                organizationApplications.categories = res;
                $scope.$digest();
            })
            .fail((err)=>{
               
            });

        }

        let queryParams = [['page', String(organizationApplications.search.page)], ['pageSize', String(organizationApplications.search.pageSize)]];
        const promises = [];
        const opts = {
            organizationId: organizationApplications.stateParamsOrgId,
            qs: queryParams
        };

        if (organizationApplications.search.name) queryParams.push(['service.name', organizationApplications.search.name]);
        if (organizationApplications.search.category) queryParams.push(['service.category', organizationApplications.search.category]);
        // sortBy: +/-service.name, +/-service.creation, +/-grant.instant
        if (organizationApplications.search.sortBy) queryParams.push(['sortBy', organizationApplications.search.sortBy]);

        switch (organizationApplications.search.refine) {
            case 'active':
            case 'suspended':
                queryParams.push(['grant.status', organizationApplications.search.refine]);
                promises.push(API.cui.getOrganizationGrantedApps(opts),API.cui.getOrganizationGrantedCount(opts));
              /*promises.push(API.cui.getOrganizationGrantedApps(opts));*/
                break;
            case 'pending':
                /*promises.push(
                    API.cui.getOrgPendingServicePackages({qs: [['requestor.id', organizationId], ['requestor.type', 'organization']]})
                    .then((res) => {
                        return getPackageServices(res);
                    }),
                    API.cui.getOrganizationRequestableCount({organizationId: organizationId})
                );*/
                queryParams.push(['grant.status', organizationApplications.search.refine]);
               /* promises.push(API.cui.getOrganizationGrantedApps(opts));*/
                promises.push(API.cui.getOrganizationGrantedApps(opts),API.cui.getOrganizationGrantedCount(opts));
                break;
            case undefined:
                /*promises.push(API.cui.getOrganizationGrantedApps(opts));*/
                promises.push(API.cui.getOrganizationGrantedApps(opts),API.cui.getOrganizationGrantedCount(opts));
                break;
        }

        $q.all(promises)
        .then((res) => {
            organizationApplications.appList = res[0];
            organizationApplications.count = res[1];
            /*organizationApplications.count = res[0].length;*/
            Loader.offFor('organizationApplications.init')
            if (organizationApplications.reRenderPaginate) organizationApplications.reRenderPaginate();
        })
        .catch(err => {
            organizationApplications.loadingError=true
            Loader.offFor('organizationApplications.init')
        })
    };
    // get Organization to display name
    API.cui.getOrganization({organizationId:organizationApplications.stateParamsOrgId})
    .then(res => {
        organizationApplications.organization=res;
    })
    onLoad(false);

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

    organizationApplications.pageChange = (newpage) => {
        organizationApplications.updateSearch('page', newpage);
    };

    organizationApplications.updateSearchByName = () => {
        organizationApplications.updateSearch('name',organizationApplications.search['name'])
    }

    organizationApplications.updateSearch = (updateType, updateValue) => {
        switch (updateType){
            case 'alphabetic':
                switchBetween('sortBy', '+service.name', '-service.name');
                break;
            case 'date':
                switchBetween('sortBy', '+grant.instant', '-grant.instant');
                break;
            case 'status':
                organizationApplications.search.page = 1;
                organizationApplications.search.refine = updateValue;
                break;
            case 'category':
                organizationApplications.search.page = 1;
                organizationApplications.search.category = $filter('cuiI18n')(updateValue);
                break;
            case 'name':
                organizationApplications.search.page = 1
                break
        }

        // Updates URL, doesn't change state
        $state.transitionTo('organization.applications', organizationApplications.search, {notify: false});
        onLoad(true);
    };

    organizationApplications.goToDetails = (application) => {
        const opts = {
            appId: application.id,
            orgId: application.owningOrganization.id
        };
        $state.go('organization.applicationDetails', opts);
    };

    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

    organizationApplications.searchApp = {orgId:organizationApplications.stateParamsOrgId};
    organizationApplications.searchApp.page = organizationApplications.searchApp.page || 1;
    organizationApplications.searchApp.pageSize = 200;
    organizationApplications.searchBy='name'
    const getCountsOfStatus=(qsValue)=>{
        let opts = {
             organizationId:organizationApplications.stateParamsOrgId
        }
        //Assign query strings if any value passed 
        //otherwise it will get full count
        if (qsValue) {
            opts.qs = [['status',qsValue]]
        }
        API.cui.getOrgAppsGrantHistory(opts)
        .then(res=>{
            if (!qsValue) {
                organizationApplications.popupCount=res.length;
            }else if (qsValue==="active") {
                organizationApplications.activeCount=res.length;
            }
            else{
                organizationApplications.suspendedCount=res.length;
            }
            $scope.$digest();
        })
        .fail(err=>{

        })
    }

    const getPersonRequestedApps = (opts) => {
        organizationApplications.requestedHistory = [];
         API.cui.getOrgAppsRequestHistory(opts)
         .then(res => {
            organizationApplications.requestedHistory=res
            Loader.offFor('organizationApplications.init')
            $scope.$digest()
            /*As of now No API available for Org apps request count*/ 
            /*API.cui.getPersonApplicationsRequestHistoryCount(opts)
            .then(res =>{
                organizationApplications.requestedHistoryCount=res
                organizationApplications.loading = false
                $scope.$digest()
            })
            .fail(err =>{
                organizationApplications.loading = false
                console.log(err)
                $scope.$digest()
            })*/

         })
         .fail(err =>{
            Loader.offFor('organizationApplications.init')
            console.log(err)
         })
    }

    const getPersonGrantedApps = (opts) => {
        organizationApplications.grantedHistory = [];
         API.cui.getOrgAppsGrantHistory(opts)
         .then(res => {
           organizationApplications.grantedHistory=res
          /* if(organizationApplications.grantedHistory.length>0&&organizationApplications.onLoadFirst){
                getCountsOfStatus("active")
                getCountsOfStatus("suspended")
                //To getFull count
                getCountsOfStatus(undefined)
                organizationApplications.onLoadFirst=false
            }*/
            Loader.offFor('organizationApplications.init')
            $scope.$digest()
            /*As of now No API available for Org apps grant count*/ 
            /*API.cui.getPersonApplicationsGrantHistoryCount(opts)
            .then(res =>{
                organizationApplications.grantedHistoryCount=res
                organizationApplications.loading = false
                $scope.$digest()
            })
            .fail(err =>{
                organizationApplications.loading = false
                console.log(err)
                $scope.$digest()
            })*/
         })
         .fail(err =>{
            Loader.offFor('organizationApplications.init')
            console.log(err)
         })
    }

    organizationApplications.pagesChange = (newpage) => {
        organizationApplications.updatesSearch('page', newpage, 'request')
    }

    organizationApplications.pageGrantedChange = (newpage) => {
        organizationApplications.updatesSearch('page', newpage, 'grant')
    }

    organizationApplications.updatesSearch = (updateType, updateValue, updatePage) => {
        Loader.onFor('organizationApplications.init')
        switch (updateType) {
            case 'requesteddate':
                switchsBetween('sortBy', '+requestedDate', '-requestedDate')
                break
            case 'decisiondate':
                switchsBetween('sortBy', '+evaluationDate', '-evaluationDate')
                break
            case 'status':
                organizationApplications.searchApp.page = 1
                organizationApplications.searchApp['status'] = updateValue
                break
            case 'eventdate':
                switchsBetween('sortBy', '+eventDate', '-eventDate')
                break
            case 'eventType':
                switchsBetween('sortBy', '+eventType', '-eventType')
                break
            case 'actorId':
                switchsBetween('sortBy', '+actorId', '-actorId')
                break
            case 'search':
                organizationApplications.searchApp.page = 1
                if(organizationApplications.searchBy==='name'){
                    organizationApplications.searchApp['name'] = updateValue
                    organizationApplications.searchApp['eventType'] = undefined}
                else{
                    organizationApplications.searchApp['name'] = undefined
                    organizationApplications.searchApp['eventType'] = updateValue}
                break
        }

        if(organizationApplications.searchApp.page==0){
          organizationApplications.searchApp.page=1  
        }
        let queryParams = [['page', String(organizationApplications.searchApp.page)], ['pageSize', '200']];
        if(organizationApplications.searchApp.sortBy)
            queryParams.push(['sortBy',organizationApplications.searchApp['sortBy']])
        if(organizationApplications.searchApp.status)
            queryParams.push(['status',organizationApplications.searchApp['status']])
        if(organizationApplications.searchApp.name)
            queryParams.push(['name',organizationApplications.searchApp['name']])
        if(organizationApplications.searchApp.eventType)
            queryParams.push(['eventType',organizationApplications.searchApp['eventType']])
        const opts = {
            organizationId:organizationApplications.stateParamsOrgId,
            qs: queryParams
        };
        organizationApplications.searchApp.orgId=organizationApplications.stateParamsOrgId

        // doesn't change state, only updates the url
        $state.transitionTo('organization.directory.orgDetails', organizationApplications.searchApp, { notify:false })
             if(updatePage=='request'){
                getPersonRequestedApps(opts)
             }
             else{
                getPersonGrantedApps(opts)
             } 
    }

    const switchsBetween = (property, firstValue, secondValue) => {
        // helper function to switch a property between two values or set to undefined if values not passed
        if (!firstValue) {
            organizationApplications.searchApp[property] = undefined
            return
        }
        organizationApplications.searchApp[property] = organizationApplications.searchApp[property] === firstValue
            ? secondValue
            : firstValue
    }
    $scope.$watch("organizationApplications.activeRequestTab", function(n) {
            organizationApplications.searchApp = undefined
            organizationApplications.searchApp = Object.assign({}, {})
            organizationApplications.searchApp.page = 1
            let value=(organizationApplications.activeRequestTab)?'request':'grant'
            organizationApplications.searchApp.pageSize = organizationApplications.searchApp.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
            if(organizationApplications.activeRequestTab){
               organizationApplications.updatesSearch('','',value)
           }
    }, true);
    $scope.$watch("organizationApplications.activeGrantTab", function(n) {
           organizationApplications.searchApp = undefined  
           organizationApplications.searchApp = Object.assign({}, {})
           organizationApplications.searchApp.page = 1
           organizationApplications.searchApp.pageSize = organizationApplications.searchApp.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
           let value=(organizationApplications.activeGrantTab)?'grant':'request'
           if(organizationApplications.activeGrantTab){
            organizationApplications.updatesSearch('','',value)
           } 
    }, true);
});
