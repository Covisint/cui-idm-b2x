angular.module('organization')
.controller('orgDetailsAppsCtrl',function(API,$stateParams,$q,$state,DataStorage,$pagination,Loader,$filter,$scope) {
    'use strict';

	
    const orgDetailsApps = this;
    const scopeName = 'orgDetailsApps.'
    orgDetailsApps.stateParamsOrgId=$stateParams.orgId

    Loader.onFor('orgDetailsApps.init')
    orgDetailsApps.search = {orgId:orgDetailsApps.stateParamsOrgId};
    orgDetailsApps.search.page = orgDetailsApps.search.page || 1;
    orgDetailsApps.paginationPageSize = orgDetailsApps.paginationPageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    orgDetailsApps.search.pageSize = orgDetailsApps.paginationPageSize;

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    /*const switchBetween = (property, firstValue, secondValue) => { 
        // helper function to switch a property between two values or set to undefined if values not passed;
        if(!firstValue) orgDetailsApps.search[property] = undefined;
        orgDetailsApps.search[property] === firstValue ? orgDetailsApps.search[property] = secondValue : orgDetailsApps.search[property] = firstValue;
    };*/

    /*const switchBetween = (property, firstValue, secondValue) => { 
        // helper function to switch a property between two values or set to undefined if values not passed;
        if(!firstValue) {
            orgDetailsApps.search[property] = undefined;
            return
        }
        orgDetailsApps.search[property] = orgDetailsApps.search[property] === firstValue
            ? secondValue
            : firstValue
    }*/

    const switchBetween = (property, firstValue, secondValue) => {
        // helper function to switch a property between two values or set to undefined if values not passed
        if (!firstValue) {
            orgDetailsApps.search[property] = undefined
            return
        }
        orgDetailsApps.search[property] = orgDetailsApps.search[property] === firstValue
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
            Loader.offFor('orgDetailsApps.init')
        }
        else {
            orgDetailsApps.search.name = $stateParams.name;
            orgDetailsApps.search.category = $stateParams.category;
            orgDetailsApps.search.sortBy = $stateParams.sortBy;
            orgDetailsApps.search.refine = $stateParams.refine;
            if($stateParams.page)
                orgDetailsApps.search.page = parseInt($stateParams.page);
            if($stateParams.pageSize)
                orgDetailsApps.search.pageSize = parseInt($stateParams.pageSize);

            
            API.cui.getOrgAppCategories({organizationId:orgDetailsApps.stateParamsOrgId})
            .then((res)=>{
                orgDetailsApps.categories = res;
                $scope.$digest();
            })
            .fail((err)=>{
               
            });

        }

        let queryParams = [['page', String(orgDetailsApps.search.page)], ['pageSize', String(orgDetailsApps.search.pageSize)]];
        const promises = [];
        const opts = {
            organizationId: orgDetailsApps.stateParamsOrgId,
            qs: queryParams
        };

        if (orgDetailsApps.search.name) queryParams.push(['service.name', orgDetailsApps.search.name]);
        if (orgDetailsApps.search.category) queryParams.push(['service.category', orgDetailsApps.search.category]);
        // sortBy: +/-service.name, +/-service.creation, +/-grant.instant
        if (orgDetailsApps.search.sortBy) queryParams.push(['sortBy', orgDetailsApps.search.sortBy]);

        switch (orgDetailsApps.search.refine) {
            case 'active':
            case 'suspended':
                queryParams.push(['grant.status', orgDetailsApps.search.refine]);
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
                queryParams.push(['grant.status', orgDetailsApps.search.refine]);
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
            orgDetailsApps.appList = res[0];
            orgDetailsApps.count = res[1];
            /*orgDetailsApps.count = res[0].length;*/
            Loader.offFor('orgDetailsApps.init')
            if (orgDetailsApps.reRenderPaginate) orgDetailsApps.reRenderPaginate();
        })
        .catch(err => {
            orgDetailsApps.loadingError=true
            Loader.offFor('orgDetailsApps.init')
        })
    };
    // get Organization to display name
    API.cui.getOrganization({organizationId:orgDetailsApps.stateParamsOrgId})
    .then(res => {
        orgDetailsApps.organization=res;
    })
    onLoad(false);

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------
    orgDetailsApps.activeAppsTab=true
    orgDetailsApps.activeRequestTab=false
    orgDetailsApps.activeGrantTab=false
    orgDetailsApps.sortClicked = false
    orgDetailsApps.onLoadFirst = true 
    
    orgDetailsApps.pageChange = (newpage) => {
        orgDetailsApps.updateSearch('page', newpage);
    };

    orgDetailsApps.updateSearchByName = () => {
        orgDetailsApps.updateSearch('name',orgDetailsApps.search['name'])
    }

    orgDetailsApps.updateSearch = (updateType, updateValue) => {
        switch (updateType){
            case 'alphabetic':
                switchBetween('sortBy', '+service.name', '-service.name');
                break;
            case 'date':
                switchBetween('sortBy', '+grant.instant', '-grant.instant');
                break;
            case 'status':
                orgDetailsApps.search.page = 1;
                orgDetailsApps.search.refine = updateValue;
                break;
            case 'category':
                orgDetailsApps.search.page = 1;
                orgDetailsApps.search.category = $filter('cuiI18n')(updateValue);
                break;
            case 'name':
                orgDetailsApps.search.page = 1
                break
        }

        // Updates URL, doesn't change state
        $state.transitionTo('organization.directory.orgDetails', orgDetailsApps.search, {notify: false});
        onLoad(true);
    };

    orgDetailsApps.goToDetails = (application) => {
        const opts = {
            appId: application.id,
            orgId: $stateParams.orgId
        };
        $state.go('organization.applicationDetails', opts);
    };
    // ON CLICK FUNCTIONS END ------------------------------------------------------------------------
    orgDetailsApps.searchApp = {orgId:orgDetailsApps.stateParamsOrgId};
    orgDetailsApps.searchApp.page = orgDetailsApps.searchApp.page || 1;
    orgDetailsApps.searchApp.pageSize = 200;
    orgDetailsApps.searchBy='name'
    const getCountsOfStatus=(qsValue)=>{
        let opts = {
             organizationId:orgDetailsApps.stateParamsOrgId
        }
        //Assign query strings if any value passed 
        //otherwise it will get full count
        if (qsValue) {
            opts.qs = [['status',qsValue]]
        }
        API.cui.getOrgAppsGrantHistory(opts)
        .then(res=>{
            if (!qsValue) {
                orgDetailsApps.popupCount=res.length;
            }else if (qsValue==="active") {
                orgDetailsApps.activeCount=res.length;
            }
            else{
                orgDetailsApps.suspendedCount=res.length;
            }
            $scope.$digest();
        })
        .fail(err=>{

        })
    }

    const getPersonRequestedApps = (opts) => {
        orgDetailsApps.requestedHistory = [];
         API.cui.getOrgAppsRequestHistory(opts)
         .then(res => {
            orgDetailsApps.requestedHistory=res
            Loader.offFor('orgDetailsApps.init')
            $scope.$digest()
            /*As of now No API available for Org apps request count*/ 
            /*API.cui.getPersonApplicationsRequestHistoryCount(opts)
            .then(res =>{
                orgDetailsApps.requestedHistoryCount=res
                orgDetailsApps.loading = false
                $scope.$digest()
            })
            .fail(err =>{
                orgDetailsApps.loading = false
                console.log(err)
                $scope.$digest()
            })*/

         })
         .fail(err =>{
            Loader.offFor('orgDetailsApps.init')
            console.log(err)
         })
    }

    const getPersonGrantedApps = (opts) => {
        orgDetailsApps.grantedHistory = [];
         API.cui.getOrgAppsGrantHistory(opts)
         .then(res => {
           orgDetailsApps.grantedHistory=res
          /* if(orgDetailsApps.grantedHistory.length>0&&orgDetailsApps.onLoadFirst){
                getCountsOfStatus("active")
                getCountsOfStatus("suspended")
                //To getFull count
                getCountsOfStatus(undefined)
                orgDetailsApps.onLoadFirst=false
            }*/
            Loader.offFor('orgDetailsApps.init')
            $scope.$digest()
            /*As of now No API available for Org apps grant count*/ 
            /*API.cui.getPersonApplicationsGrantHistoryCount(opts)
            .then(res =>{
                orgDetailsApps.grantedHistoryCount=res
                orgDetailsApps.loading = false
                $scope.$digest()
            })
            .fail(err =>{
                orgDetailsApps.loading = false
                console.log(err)
                $scope.$digest()
            })*/
         })
         .fail(err =>{
            Loader.offFor('orgDetailsApps.init')
            console.log(err)
         })
    }

    orgDetailsApps.pagesChange = (newpage) => {
        orgDetailsApps.updatesSearch('page', newpage, 'request')
    }

    orgDetailsApps.pageGrantedChange = (newpage) => {
        orgDetailsApps.updatesSearch('page', newpage, 'grant')
    }

    orgDetailsApps.updatesSearch = (updateType, updateValue, updatePage) => {
        Loader.onFor('orgDetailsApps.init')
        switch (updateType) {
            case 'requesteddate':
                switchsBetween('sortBy', '+requestedDate', '-requestedDate')
                break
            case 'decisiondate':
                switchsBetween('sortBy', '+evaluationDate', '-evaluationDate')
                break
            case 'status':
                orgDetailsApps.searchApp.page = 1
                orgDetailsApps.searchApp['status'] = updateValue
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
                orgDetailsApps.searchApp.page = 1
                if(orgDetailsApps.searchBy==='name'){
                    orgDetailsApps.searchApp['name'] = updateValue
                    orgDetailsApps.searchApp['eventType'] = undefined}
                else{
                    orgDetailsApps.searchApp['name'] = undefined
                    orgDetailsApps.searchApp['eventType'] = updateValue}
                break
        }

        if(orgDetailsApps.searchApp.page==0){
          orgDetailsApps.searchApp.page=1  
        }
        let queryParams = [['page', String(orgDetailsApps.searchApp.page)], ['pageSize', '200']];
        if(orgDetailsApps.searchApp.sortBy)
            queryParams.push(['sortBy',orgDetailsApps.searchApp['sortBy']])
        if(orgDetailsApps.searchApp.status)
            queryParams.push(['status',orgDetailsApps.searchApp['status']])
        if(orgDetailsApps.searchApp.name)
            queryParams.push(['name',orgDetailsApps.searchApp['name']])
        if(orgDetailsApps.searchApp.eventType)
            queryParams.push(['eventType',orgDetailsApps.searchApp['eventType']])
        const opts = {
            organizationId:orgDetailsApps.stateParamsOrgId,
            qs: queryParams
        };
        orgDetailsApps.searchApp.orgId=orgDetailsApps.stateParamsOrgId

        // doesn't change state, only updates the url
        $state.transitionTo('organization.directory.orgDetails', orgDetailsApps.searchApp, { notify:false })
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
            orgDetailsApps.searchApp[property] = undefined
            return
        }
        orgDetailsApps.searchApp[property] = orgDetailsApps.searchApp[property] === firstValue
            ? secondValue
            : firstValue
    }
    $scope.$watch("orgDetailsApps.activeRequestTab", function(n) {
            orgDetailsApps.searchApp = undefined
            orgDetailsApps.searchApp = Object.assign({}, {})
            orgDetailsApps.searchApp.page = 1
            let value=(orgDetailsApps.activeRequestTab)?'request':'grant'
            orgDetailsApps.searchApp.pageSize = orgDetailsApps.searchApp.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
            if(orgDetailsApps.activeRequestTab){
               orgDetailsApps.updatesSearch('','',value)
           }
    }, true);
    $scope.$watch("orgDetailsApps.activeGrantTab", function(n) {
           orgDetailsApps.searchApp = undefined  
           orgDetailsApps.searchApp = Object.assign({}, {})
           orgDetailsApps.searchApp.page = 1
           orgDetailsApps.searchApp.pageSize = orgDetailsApps.searchApp.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
           let value=(orgDetailsApps.activeGrantTab)?'grant':'request'
           if(orgDetailsApps.activeGrantTab){
            orgDetailsApps.updatesSearch('','',value)
           } 
    }, true);
});
