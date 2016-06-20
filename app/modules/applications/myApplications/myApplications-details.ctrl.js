angular.module('applications')
.controller('myApplicationDetailsCtrl', function(API, $scope, $stateParams, $state, $q, APIHelpers, Loader) {
    let myApplicationDetails = this

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const handleError = (err) => {
        console.log('Error \n', err);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    const loaderName = 'myApplicationsDetails.'
    Loader.onFor(loaderName + 'app')

    const qs = {
        'service.id': $stateParams.appId
    }

    const opts = {
        personId: API.getUser(),
        useCuid:true,
        qs: APIHelpers.getQs(qs)
    }

    API.cui.getPersonGrantedApps(opts)
    .then((res) => {
        myApplicationDetails.app = Object.assign({}, res[0])
        getClaims(myApplicationDetails.app)
    })

    const getClaims = (app) => {
        const packageId = app.servicePackage.id;

        API.cui.getPersonPackageClaims({ grantee:API.getUser(), useCuid:true, packageId })
        .then((res) => {
            myApplicationDetails.claims = Object.assign({}, res)
        })
        .done(() => {
            Loader.offFor(loaderName + 'app')
            $scope.$digest()
        })
    };

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START ----------------------------------------------------------------------

    myApplicationDetails.goToDetails = (application) => {
        $state.go('applications.myApplicationDetails', {'packageId':application.packageId, 'appId':application.id});
    };

    // ON CLICK FUNCTIONS END ------------------------------------------------------------------------

});
