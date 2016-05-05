angular.module('applications')
.controller('applicationSearchCtrl',['API','$scope','$stateParams','$state','AppRequests','localStorageService', function (API,$scope,$stateParams,$state,AppRequests,localStorage) {
    let applicationSearch = this;

    if(Object.keys(AppRequests.get()).length===0 && localStorage.get('appsBeingRequested')) {
        AppRequests.set(localStorage.get('appsBeingRequested'));
    }
    applicationSearch.packageRequests = AppRequests.get();
    applicationSearch.appCheckbox = {};

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const processNumberOfRequestedApps = (pkgRequest) => {
        if (pkgRequest) applicationSearch.numberOfRequests++;
        else applicationSearch.numberOfRequests--;
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    const onLoad = (previouslyLoaded) => {
        if(previouslyLoaded) applicationSearch.doneLoading = false;
        else { // pre populate fields based on state params on first load
            applicationSearch.numberOfRequests = 0;
            Object.keys(applicationSearch.packageRequests).forEach(function(appId) { // Gets the list of package requests saved in memory
                // This sets the checkboxes back to marked when the user clicks back after being in request review
                applicationSearch.appCheckbox[appId] = true;
                applicationSearch.numberOfRequests++;
            });
            applicationSearch.nameSearch = $stateParams.name;
            applicationSearch.category = $stateParams.category;
            applicationSearch.page = $stateParams.page;
        }

        let query = [];
        if(applicationSearch.nameSearch) query.push(['service.name',applicationSearch.nameSearch]);
        if(applicationSearch.category) query.push(['service.category',applicationSearch.category]);
        if(applicationSearch.page) query.push(['page',applicationSearch.page]);

        let opts = {
            personId: API.getUser(),
            useCuid:true,
            qs: query
        };

        // TODO: PAGINATE
        API.cui.getPersonRequestableApps(opts)
        .then((res)=>{
            applicationSearch.list = res;
            applicationSearch.doneLoading = true;
            $scope.$digest();
        });
    };
    onLoad(false);

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    applicationSearch.searchUpdate = function() {
        let opts = {};
        if(applicationSearch.nameSearch && applicationSearch.nameSearch!=='') opts.name = applicationSearch.nameSearch;
        if(applicationSearch.category) opts.category = applicationSearch.category;
        if(applicationSearch.page) opts.page = applicationSearch.page;
        $state.transitionTo('applications.search', opts, {notify:false}); // doesn't change state, only updates the url
        onLoad(true);
    };

    applicationSearch.toggleRequest = function(application) {
        if (!applicationSearch.packageRequests[application.id]) applicationSearch.packageRequests[application.id] = application;
        else delete applicationSearch.packageRequests[application.id];
        localStorage.set('appsBeingRequested',applicationSearch.packageRequests);
        processNumberOfRequestedApps(applicationSearch.packageRequests[application.id]);

    };

    applicationSearch.saveRequestsAndCheckout = function() {
        AppRequests.set(applicationSearch.packageRequests);
        $state.go('applications.reviewRequest');
    };

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);
