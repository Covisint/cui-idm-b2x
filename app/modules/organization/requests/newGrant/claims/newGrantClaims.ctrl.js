angular.module('organization')
.controller('newGrantClaimsCtrl', function($stateParams, $state, API, NewGrant, Loader, $scope, APIHelpers){
    let newGrantClaims = this

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

        Loader.onFor('newGrantClaims.claims' + i)
        const opts = {
            qs: APIHelpers.getQs({
                packageId: newGrantClaims.appsBeingRequested[appId].servicePackage.id
            })
        }
        API.cui.getPackageClaims(opts)
        .then(res => {
            newGrantClaims['claims'+i] = Object.assign({},res)
            res.forEach(claim => {
                newGrantClaims.packageRequests[app.servicePackage.id].claims[claim.id] = {}
            })
            Loader.offFor('newGrantClaims.claims' + i)
            $scope.$digest()
        })
        .fail(err => {
            newGrantClaims['claims'+i] = []
            Loader.offFor('newGrantClaims.claims' + i)
            $scope.$digest()
        })
    })

    Loader.onFor('newGrantClaims.user')
    API.cui.getPerson({ personId: $stateParams.userID })
    .then(res => {
        newGrantClaims.user = Object.assign({}, res)
        Loader.offFor('newGrantClaims.user')
        $scope.$digest()
    })

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    newGrantClaims.submit = () => {
        // TODO CALL REAL API HERE
        console.log(NewGrant.buildGrantRequests($stateParams.userID, newGrantClaims.packageRequests))
    }

    // ON CLICK END ----------------------------------------------------------------------------------
})