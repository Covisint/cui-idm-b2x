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
            orgId: application.owningOrganization.id
        };
        $state.go('organization.applicationDetails', opts);
    };
    // ON CLICK FUNCTIONS END ------------------------------------------------------------------------
});
