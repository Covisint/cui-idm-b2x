angular.module('applications')
.controller('orgAppRequestCtrl', function(API,DataStorage,Loader,User,$scope,$state) {

    const orgAppRequest = this;
    const orgAppsBeingRequested = DataStorage.getType('orgAppsBeingRequested');
    const loaderName = 'orgAppRequest.loading';

    orgAppRequest.orgAppsBeingRequested = [];
    orgAppRequest.numberOfOrgRequests = 0;

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(loaderName);

    console.log('orgAppsBeingRequested', orgAppsBeingRequested);

    Object.keys(orgAppsBeingRequested).forEach((appId) => {
        // This sets the checkboxes back to marked when the user clicks back
        orgAppRequest.numberOfOrgRequests++;
        orgAppRequest.orgAppsBeingRequested.push(orgAppsBeingRequested[appId]);
    });

    API.cui.getCategories()
    .then((res)=>{
        orgAppRequest.categories = res;
        Loader.offFor(loaderName);
        $scope.$digest();
    });

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgAppRequest.searchCallback = function(searchWord) {
        $state.go('applications.orgApplications.orgAppSearch', {name: searchWord});
    };

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

});
