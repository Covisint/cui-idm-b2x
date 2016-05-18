angular.module('applications')
.controller('applicationSearchCtrl',['API','$scope','$stateParams','$state','AppRequests','localStorageService','$q','$pagination','$filter', function (API,$scope,$stateParams,$state,AppRequests,localStorage,$q,$pagination,$filter) {
    let applicationSearch = this;

    if(Object.keys(AppRequests.get()).length===0 && localStorage.get('appsBeingRequested')) { // If there's nothing in app memory and there's something in local storage
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

    applicationSearch.appList = [];
    applicationSearch.unparsedAppList = [];

    const handleError = (err) => {
        console.log(err);
        applicationSearch.doneLoading = true;
        $scope.$digest();
    }


    const getApplicationsFromGrants = (grants) => {
        // WORKAROUND CASE #1
        // Get services from each grant
        var i = 0;
        grants.forEach(function(grant) {
            API.cui.getPackageServices({ 'packageId': grant.servicePackage.id })
            .then(function(res) {
                i++;
                res.forEach(function(service) {
                    // Set some of the grant attributes to its associated service
                    service.status = grant.status;
                    service.dateCreated = grant.creation;
                    service.parentPackage = grant.servicePackage.id;
                    applicationSearch.unparsedAppList.push(service);
                });

                applicationSearch.unparsedAppList = _.uniq(applicationSearch.unparsedAppList, function(app) {
                    return app.id;
                });
                applicationSearch.updateSearch(applicationSearch.search.name);
                applicationSearch.doneLoading = true;
                $scope.$digest();
            })
            .fail(handleError);
        });
    };

    const onLoad = () => {

        let numberOfRequests = 0;
        Object.keys(applicationSearch.packageRequests).forEach(function(appId) { // Gets the list of package requests saved in memory
            // This sets the checkboxes back to marked when the user clicks back after being in request review
            applicationSearch.appCheckbox[appId] = true;
            numberOfRequests++;
        });
        applicationSearch.numberOfRequests = numberOfRequests;

        applicationSearch.search = {};
        applicationSearch.search.name = $stateParams.name;

        let query = [];
        if(applicationSearch.search.nameSearch) query.push(['service.name',applicationSearch.search.nameSearch]);

        let opts = {
            personId: API.getUser(),
            useCuid:true,
            qs: query
        };


        let personPackages,parsedPackages;

        $q.all([API.cui.getPerson({ personId: API.getUser(), useCuid:true }), API.cui.getPersonPackages({ personId: API.getUser(), useCuid:true })])
        .then((res) => {
            personPackages = res[1];
            return API.cui.getOrganizationPackages({ organizationId: res[0].organization.id });
        })
        .then((res) => {
            parsedPackages = res.reduce((parsedPkgs,unparsedPkg) => {
                if (_.findIndex(personPackages, pkg => pkg.servicePackage.id===unparsedPkg.servicePackage.id) >= 0){ // if the org package is in the list of user packages discard it
                    return parsedPkgs;
                }
                else {
                    parsedPkgs.push(unparsedPkg)
                    return parsedPkgs;
                }
            },[]);
            getApplicationsFromGrants(parsedPackages);
        });




    };
    onLoad(false);

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    applicationSearch.updateSearch = (name) => {
        if(!name || name === ''){
            angular.copy(applicationSearch.unparsedAppList,applicationSearch.appList);
        }
        else {
            applicationSearch.appList = applicationSearch.unparsedAppList.filter(app => $filter('cuiI18n')(app.name).toLowerCase().indexOf(name.toLowerCase())>-1);
        }

    }

    applicationSearch.saveRequestsAndCheckout = function() {
       AppRequests.set(applicationSearch.packageRequests);
       $state.go('applications.reviewRequest');
   };



   applicationSearch.toggleRequest = function(application) {
       if (!applicationSearch.packageRequests[application.id]) applicationSearch.packageRequests[application.id] = application;
       else delete applicationSearch.packageRequests[application.id];
       localStorage.set('appsBeingRequested',applicationSearch.packageRequests);
       processNumberOfRequestedApps(applicationSearch.packageRequests[application.id]);
   };

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);
