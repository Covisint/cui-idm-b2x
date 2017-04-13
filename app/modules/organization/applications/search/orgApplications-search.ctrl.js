angular.module('organization')
.controller('orgAppSearchCtrl',function(API,DataStorage,Loader,User,$pagination,$q,$state,$stateParams) {

    const orgAppSearch = this;
    const loaderName = 'orgAppSearch.loading';
    orgAppSearch.stateParamsOrgId=$stateParams.orgId;

    orgAppSearch.packageRequests = DataStorage.getType('orgAppsBeingRequested', User.user.id) || {};
    orgAppSearch.appCheckbox = {};

    /* ---------------------------------------- HELPER FUNCTIONS START ---------------------------------------- */

    const processNumberOfRequestedApps = (pkgRequest) => {
        if (pkgRequest) orgAppSearch.numberOfRequests++;
        else orgAppSearch.numberOfRequests--;
    };

    /* ----------------------------------------- HELPER FUNCTIONS END ----------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    const onLoad = (previouslyLoaded) => {
        if (previouslyLoaded) {
            Loader.onFor(loaderName);
        }
        else { 
            Loader.onFor(loaderName);
            // pre populate fields based on state params on first load
            let numberOfRequests = 0;

            Object.keys(orgAppSearch.packageRequests).forEach(function(appId) { 
                // Gets the list of package requests saved in memory
                // This sets the checkboxes back to marked when the user clicks back after being in request review
                orgAppSearch.appCheckbox[appId] = true;
                numberOfRequests++;
            });
            
            orgAppSearch.numberOfRequests = numberOfRequests;

            orgAppSearch.search = {};
            orgAppSearch.search.name = $stateParams.name;
            orgAppSearch.search.category = $stateParams.category;
            orgAppSearch.search.page = parseInt($stateParams.page);
            orgAppSearch.search.pageSize = parseInt($stateParams.pageSize);
        }

        let query = [];

        if (orgAppSearch.search.name) query.push(['service.name',orgAppSearch.search.name]);
        if (orgAppSearch.search.category) query.push(['service.category',orgAppSearch.search.category]);

        orgAppSearch.search.pageSize = orgAppSearch.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0] || 25;
        query.push(['pageSize',String(orgAppSearch.search.pageSize)]);

        orgAppSearch.search.page = orgAppSearch.search.page || 1;
        query.push(['page',String(orgAppSearch.search.page)]);

        let opts = {
            organizationId: User.user.organization.id,
            useCuid:true,
            qs: query
        };
        
        const promises = [API.cui.getOrganizationsRequestableApps(opts), API.cui.getOrganizationRequestableCount(opts)];

        $q.all(promises)
        .then((res) => {
             orgAppSearch.list = res[0];
             orgAppSearch.count = res[1];
             Loader.offFor(loaderName);
        });
    };

    onLoad(false);

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgAppSearch.pageChange = (newpage) => {
        orgAppSearch.updateSearch('page', newpage);
    };

    orgAppSearch.updateSearch = function(updateType, updateValue) {
        switch (updateType){
            case 'name':
                orgAppSearch.search.page = 1;
                break;
        }

        // Update current URL without changing the state
        $state.transitionTo('applications.orgApplications.search', orgAppSearch.search, {notify:false});
        onLoad(true);
    };

    orgAppSearch.toggleRequest = function(application) {
        if (!orgAppSearch.packageRequests[application.id]) orgAppSearch.packageRequests[application.id] = application;
        else delete orgAppSearch.packageRequests[application.id];

        DataStorage.setType('orgAppsBeingRequested', orgAppSearch.packageRequests);
        processNumberOfRequestedApps(orgAppSearch.packageRequests[application.id]);
    };

    orgAppSearch.saveRequestsAndCheckout = function() {
        DataStorage.setType('orgAppsBeingRequested', orgAppSearch.packageRequests);
        $state.go('organization.newRequestReview',{orgId:orgAppSearch.stateParamsOrgId});
    };

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

});
