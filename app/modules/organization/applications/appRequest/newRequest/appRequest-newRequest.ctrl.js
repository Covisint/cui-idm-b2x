angular.module('organization')
.controller('orgAppRequestCtrl', function(API,DataStorage,Loader,User,$scope,$state,$stateParams) {

    const orgAppRequest = this;
    const orgAppsBeingRequested = DataStorage.getType('orgAppsBeingRequested');
    const loaderName = 'orgAppRequest.loading';
    orgAppRequest.stateParamsOrgId=User.user.organization.id;

    orgAppRequest.orgAppsBeingRequested = [];
    orgAppRequest.numberOfOrgRequests = 0;

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(loaderName);

    if (orgAppsBeingRequested) {
        orgAppRequest.numberOfOrgRequests = Object.keys(orgAppsBeingRequested).length;
    }
    
    API.cui.getOrgAppCategories({organizationId:orgAppRequest.stateParamsOrgId})
    .then((res)=>{
        orgAppRequest.categories = res;
        Loader.offFor(loaderName);
        $scope.$digest();
    })
    .fail((err)=>{
         Loader.offFor(loaderName);
    });

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgAppRequest.searchCallback = function(searchWord) {
        $state.go('organization.search', {name: searchWord});
    };

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

});
