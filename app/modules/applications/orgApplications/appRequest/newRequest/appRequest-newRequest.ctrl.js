angular.module('applications')
.controller('orgAppRequestCtrl', function(API,Loader,AppRequests,$scope,$state) {

    const orgAppRequest = this;
    const appsBeingRequested = AppRequests.get();
    const loaderName = 'orgAppRequest.';

    orgAppRequest.appsBeingRequested = [];
    orgAppRequest.numberOfRequests = 0;

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(loaderName + 'loading');

    Object.keys(appsBeingRequested).forEach((appId) => {
        // This sets the checkboxes back to marked when the user clicks back
        orgAppRequest.numberOfRequests++;
        orgAppRequest.appsBeingRequested.push(appsBeingRequested[appId]);
    });

    API.cui.getCategories()
    .then((res)=>{
        orgAppRequest.categories = res;
        Loader.offFor(loaderName + 'loading');
        $scope.$digest();
    });

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgAppRequest.searchCallback = function(searchWord) {
        $state.go('applications.search', {name: searchWord});
    };

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

});
