angular.module('applications')
.controller('newAppRequestCtrl',['API','$scope','$state','AppRequests','localStorageService',
function(API,$scope,$state,AppRequests,localStorage) {

    let newAppRequest = this;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    // HELPER FUNCTIONS END ---------------------------------------------------------------------------

    // ON LOAD START ----------------------------------------------------------------------------------------

    if(Object.keys(AppRequests.get()).length===0 && localStorage.get('appsBeingRequested')) {
        AppRequests.set(localStorage.get('appsBeingRequested'));
    }
    const appsBeingRequested = AppRequests.get();

    newAppRequest.appsBeingRequested = [];
    newAppRequest.numberOfRequests = 0;

    Object.keys(appsBeingRequested).forEach((appId) => {
        // This sets the checkboxes back to marked when the user clicks back
        newAppRequest.numberOfRequests += 1;
        newAppRequest.appsBeingRequested.push(appsBeingRequested[appId]);
    });

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
