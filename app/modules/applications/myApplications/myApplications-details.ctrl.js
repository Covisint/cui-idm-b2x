angular.module('applications')
.controller('myApplicationDetailsCtrl', function(API, $scope, $stateParams, $state, $q, APIHelpers, Loader, APIError) {
    let myApplicationDetails = this

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    const loaderName = 'myApplicationDetails.'

    const qs = {
        'service.id': $stateParams.appId
    }

    const opts = {
        personId: API.getUser(),
        useCuid:true,
        qs: APIHelpers.getQs(qs)
    }

    Loader.onFor(loaderName + 'app')
    API.cui.getPersonGrantedApps(opts)
    .then(res => {
        APIError.offFor(loaderName + 'app')
        myApplicationDetails.app = Object.assign({}, res[0])
        getClaims(myApplicationDetails.app)
    })
    .fail(err => {
        APIError.onFor(loaderName + 'app')
    })
    .done(() => {
        Loader.offFor(loaderName + 'app')
        $scope.$digest()
    })

    const getClaims = (app) => {
        const packageId = app.servicePackage.id

        Loader.onFor(loaderName + 'claims')
        API.cui.getPersonPackageClaims({ grantee:API.getUser(), useCuid:true, packageId })
        .then(res => {
            APIError.offFor(loaderName + 'claims')
            myApplicationDetails.claims = Object.assign({}, res)
        })
        .fail(err => {
            APIError.onFor(loaderName + 'claims')
        })
        .done(() => {
            Loader.offFor(loaderName + 'claims')
            $scope.$digest()
        })
    }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START ----------------------------------------------------------------------

    myApplicationDetails.goToDetails = (application) => {
        $state.go('applications.myApplicationDetails', {
            'packageId':application.packageId,
            'appId':application.id
        })
    }

    // ON CLICK FUNCTIONS END ------------------------------------------------------------------------

})
