angular.module('applications')
.controller('newAppRequestCtrl',['API','$scope','$state','AppRequests','localStorageService', function(API,$scope,$state,AppRequests,localStorage) {

    let newAppRequest = this;

    if(Object.keys(AppRequests.get()).length===0 && localStorage.get('appsBeingRequested')) {
        AppRequests.set(localStorage.get('appsBeingRequested'));
    }
    const appsBeingRequested = AppRequests.get();

    newAppRequest.appsBeingRequested = [];
    newAppRequest.numberOfRequests = 0;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    Object.keys(appsBeingRequested).forEach(function(appId) {
        // This sets the checkboxes back to marked when the user clicks back
        newAppRequest.numberOfRequests++;
        newAppRequest.appsBeingRequested.push(appsBeingRequested[appId]);
    });

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    API.cui.getCategories()
    .then((res)=>{
        newAppRequest.categories = res;
        newAppRequest.loadingDone = true;
        $scope.$digest();
    })

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    newAppRequest.searchCallback = function(searchWord) {
        $state.go('applications.search', {name: searchWord});
    };

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);
