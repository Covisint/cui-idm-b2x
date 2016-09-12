angular.module('applications')
.controller('applicationSearchCtrl',['API','$scope','$stateParams','$state','AppRequests','localStorageService','$q','$pagination', function (API,$scope,$stateParams,$state,AppRequests,localStorage,$q,$pagination) {
    let applicationSearch = this;

    if(Object.keys(AppRequests.get()).length===0 && localStorage.get('appsBeingRequested')) { // If there's nothing in app memory and there's something in local storage
        AppRequests.set(localStorage.get('appsBeingRequested'));
    }
    applicationSearch.packageRequests = AppRequests.get();
    applicationSearch.appCheckbox = {};

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const processNumberOfRequestedApps = (pkgRequest) => {
        if (pkgRequest) {
            applicationSearch.numberOfRequests += 1;
        } else {
            applicationSearch.numberOfRequests -= 1;
        }
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    const onLoad = (previouslyLoaded) => {
        if(previouslyLoaded) {
            applicationSearch.doneReloading = false;
        }
        else { // pre populate fields based on state params on first load
            let numberOfRequests = 0;
            Object.keys(applicationSearch.packageRequests).forEach(function(appId) { // Gets the list of package requests saved in memory
                // This sets the checkboxes back to marked when the user clicks back after being in request review
                applicationSearch.appCheckbox[appId] = true;
                numberOfRequests += 1;
            });
            applicationSearch.numberOfRequests = numberOfRequests;

            applicationSearch.search = {};
            applicationSearch.search.name = $stateParams.name;
            applicationSearch.search.category = $stateParams.category;
            applicationSearch.search.page = parseInt($stateParams.page, 10);
            applicationSearch.search.pageSize = parseInt($stateParams.pageSize, 10);
        }

        let query = [];
        if (applicationSearch.search.name) {
            query.push(['service.name',applicationSearch.search.name]);
        }
        if (applicationSearch.search.category) {
            query.push(['service.category',applicationSearch.search.category]);
        }

        applicationSearch.search.pageSize = applicationSearch.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
        query.push(['pageSize',String(applicationSearch.search.pageSize)]);

        applicationSearch.search.page = applicationSearch.search.page || 1;
        query.push(['page',String(applicationSearch.search.page)]);

        let opts = {
            personId: API.getUser(),
            useCuid:true,
            qs: query
        };

        const promises = [API.cui.getPersonRequestableApps(opts),API.cui.getPersonRequestableCount(opts)];

        $q.all(promises)
        .then((res) => {
             applicationSearch.list = res[0];
             applicationSearch.count = res[1];
             applicationSearch.doneReloading = applicationSearch.doneLoading = true;
        });
    };
    onLoad(false);

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    applicationSearch.pageChange = (newpage) => {
        applicationSearch.updateSearch('page',newpage);
    };

    applicationSearch.updateSearch = function(updateType,updateValue) {
        switch (updateType){
            case 'name':
                applicationSearch.search.page = 1;
                break;
        }

        // doesn't change state, only updates the url
        $state.transitionTo('applications.search', applicationSearch.search, {notify:false});
        onLoad(true);
    };

    applicationSearch.toggleRequest = function(application) {
        if (!applicationSearch.packageRequests[application.id]) {
            applicationSearch.packageRequests[application.id] = application;
        } else {
            delete applicationSearch.packageRequests[application.id];
        }
        localStorage.set('appsBeingRequested',applicationSearch.packageRequests);
        processNumberOfRequestedApps(applicationSearch.packageRequests[application.id]);
    };

    applicationSearch.saveRequestsAndCheckout = function() {
        AppRequests.set(applicationSearch.packageRequests);
        $state.go('applications.reviewRequest');
    };

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);
