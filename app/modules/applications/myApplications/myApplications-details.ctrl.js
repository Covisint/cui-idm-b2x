angular.module('applications')
.controller('myApplicationDetailsCtrl',['API','$scope','$stateParams','$state','$q',
function(API,$scope,$stateParams,$state,$q) {
    let myApplicationDetails = this;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function(err) {
        console.log('Error \n', err);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    const qs =  [
        ['service.id', $stateParams.appId]
    ];

    let opts = {
        personId: API.getUser(),
        useCuid:true,
        qs
    };

    API.cui.getPersonGrantedApps(opts)
    .then((res)=>{
        myApplicationDetails.app = res[0];
        getClaims(res[0]);
    });

    const getClaims = (app) => {
        const packageId = app.servicePackage.id;

        API.cui.getPersonPackageClaims({ grantee:API.getUser(), useCuid:true, packageId })
        .then((res) => {
            myApplicationDetails.claims = res;
            myApplicationDetails.doneLoading = true;
            $scope.$digest();
        });
    };

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START ----------------------------------------------------------------------

    myApplicationDetails.goToDetails = function(application) {
        $state.go('applications.myApplicationDetails', {'packageId':application.packageId, 'appId':application.id});
    };

    // ON CLICK FUNCTIONS END ------------------------------------------------------------------------

}]);
