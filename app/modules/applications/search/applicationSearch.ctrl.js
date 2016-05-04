angular.module('applications')
.controller('applicationSearchCtrl',['API','$scope','$stateParams','$state','$filter','AppRequests',
function(API,$scope,$stateParams,$state,$filter,AppRequests) {
    'use strict';
    var applicationSearch = this;

    var userOrg;
    var detailsFetchStep = 0;
    var nameSearch = $stateParams.name;
    var categorySearch = $stateParams.category;
    var packageList = [];
    var userPackageList = []; // WORKAROUND CASE #1
    var listOfAvailabeApps = [];
    var bundled = [];
    var related = [];

    applicationSearch.numberOfRequests = 0;
    applicationSearch.nameSearch = nameSearch; // get name url param to pre-populate the search field
    applicationSearch.category = categorySearch; // get category url param to pre-populate search field
    applicationSearch.packageRequests = AppRequests.get();
    applicationSearch.appCheckbox = {};
    applicationSearch.detailsLoadingDone = {};

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function(err) {
        console.log('Error \n', err);
    };

    var processNumberOfRequiredApps = function(pkgRequest) {
        if (pkgRequest) {
            applicationSearch.numberOfRequests++;
        }
        else {
            applicationSearch.numberOfRequests--;
        }
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    Object.keys(applicationSearch.packageRequests).forEach(function(appId) { // Gets the list of package requests saved in memory
        // This sets the checkboxes back to marked when the user clicks back
        applicationSearch.appCheckbox[appId] = true;  // after being in request review
        applicationSearch.numberOfRequests++;
    });

    let query = [];
    if(nameSearch) query.push(['service.name',nameSearch]);
    if(categorySearch) query.push(['service.category',categorySearch]);

    let opts = {
        personId: API.getUser(),
        useCuid:true,
        qs: query
    }

    console.log('person',API.getUser());

    // TODO: PAGINATE
    API.cui.getPersonRequestableApps(opts)
    .then((res)=>{
        console.log(res);
        applicationSearch.list = res;
        applicationSearch.doneLoading = true;
        $scope.$digest();
    });

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    applicationSearch.nameSearchUpdate = function(appName) {
        $state.go('applications.search', {name: appName});
    };

    applicationSearch.toggleRequest = function(application) {
        if (!applicationSearch.packageRequests[application.id]) {
            applicationSearch.packageRequests[application.id] = application;
        }
        else {
            delete applicationSearch.packageRequests[application.id];
        }
        processNumberOfRequiredApps(applicationSearch.packageRequests[application.id]);
        console.log(applicationSearch.packageRequests);
    };

    applicationSearch.saveRequestsAndCheckout = function() {
        AppRequests.set(applicationSearch.packageRequests);
        $state.go('applications.reviewRequest');
    };

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);
