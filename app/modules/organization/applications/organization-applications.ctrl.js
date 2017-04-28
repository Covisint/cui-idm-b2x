angular.module('organization')
.controller('organizationApplicationsCtrl', function(API,Sort,User,$filter,$pagination,$q,$scope,$state,$stateParams) {

    const organizationApplications = this;
    organizationApplications.stateParamsOrgId=$stateParams.orgId

    organizationApplications.loading = true;
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
            organizationApplications.loading = false;
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
            organizationApplications.loading = false;
            if (organizationApplications.reRenderPaginate) organizationApplications.reRenderPaginate();
        })
        .catch(err => {
            organizationApplications.loadingError=true
            organizationApplications.loading = false;
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

});
