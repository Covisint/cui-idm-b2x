angular.module('organization')
.controller('newGrantClaimsCtrl', function($stateParams, $state, API, NewGrant, Loader, $scope, APIHelpers, $q){
    let newGrantClaims = this

    const loaderType = 'newGrantClaims.'

    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    newGrantClaims.packageRequests = {}

    NewGrant.pullFromStorage(newGrantClaims)

    // get the claims for each app being requested
    Object.keys(newGrantClaims.appsBeingRequested).forEach((appId, i) => {
        const app = newGrantClaims.appsBeingRequested[appId]

        if (!newGrantClaims.packageRequests[app.servicePackage.id]) {
            newGrantClaims.packageRequests[app.servicePackage.id] = {
                claims: {},
                administratorRights: false
            }
        }

        Loader.onFor(loaderType + 'claims' + i)
        const opts = {
            qs: APIHelpers.getQs({
                packageId: newGrantClaims.appsBeingRequested[appId].servicePackage.id
            })
        }
        API.cui.getPackageClaims(opts)
        .then(res => {
            newGrantClaims['claims' + i] = Object.assign({}, res)
            res.forEach(claim => {
                newGrantClaims.packageRequests[app.servicePackage.id].claims[claim.id] = {}
            })
            Loader.offFor(loaderType + 'claims' + i)
            $scope.$digest()
        })
        .fail(err => { // claims endpoint throws an error when the package has no claims
            newGrantClaims['claims' + i] = []
            Loader.offFor(loaderType + 'claims' + i)
            $scope.$digest()
        })
    })

    Loader.onFor(loaderType + 'user')
    API.cui.getPerson({ personId: $stateParams.userID })
    .then(res => {
        newGrantClaims.user = Object.assign({}, res)
        Loader.offFor(loaderType + 'user')
        $scope.$digest()
    })

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    newGrantClaims.submit = () => {
        Loader.onFor(loaderType + 'submit')

        // Grant Packages
        $q.all(NewGrant.packageGrants($stateParams.userID, newGrantClaims.packageRequests).map(opts => API.cui.grantPersonPackage(opts)))
        .then(res => {
            // grant claims
            return $q.all(NewGrant.claimGrants($stateParams.userID, newGrantClaims.packageRequests).map(opts => API.cui.grantClaims(opts)))
        })
        .then(res => {
            Loader.offFor(loaderType + 'submit')
            newGrantClaims.success = true
        })
        .catch(err => {
            Loader.onFor(loaderType + 'submit')
            newGrantClaims.error = true
        })

    }

    // ON CLICK END ----------------------------------------------------------------------------------
})
