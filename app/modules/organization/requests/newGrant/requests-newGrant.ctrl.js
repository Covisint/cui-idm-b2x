angular.module('organization')
.controller('newGrantCtrl', function(API, $stateParams, $scope, $state, Loader, DataStorage) {

    const newGrant = this

    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    newGrant.searchType = 'application'

    /****
        grants in DataStorage are under the type 'newGrant' and look like

        [
            {
                userId:<user for which the grant is being made>,
                applications:<array of applications being granted>,
                packages:<array of packages being granted>
            }
        ]
    ****/

    const newGrantsInStorage = DataStorage.getDataThatMatches(API.getUser(), 'newGrant', { userId: $stateParams.userID })
    if(newGrantsInStorage) {
        newGrant.appsBeingRequested = newGrantsInStorage.applications
        newGrant.packagesBeingRequested = newGrantsInStorage.packages
    }
    else {
        newGrant.packagesBeingRequested = newGrant.appsBeingRequested = []
    }

    newGrant.numberOfRequests = newGrant.appsBeingRequested.length + newGrant.packagesBeingRequested.length

    Loader.onFor('newGrant.user')
    API.cui.getPerson({ personId:$stateParams.userID })
    .then(res => {
        newGrant.user = Object.assign({}, res)
        Loader.offFor('newGrant.user')
        $scope.$digest()
    })

    Loader.onFor('newGrant.categories')
    API.cui.getCategories()
    .then(res => {
        newGrant.categories = Object.assign({}, res)
        Loader.offFor('newGrant.categories')
        $scope.$digest()
    })

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    newGrant.searchCallback = (name) => {
        $state.go('organization.requests.newGrant.search',{ type:newGrant.searchType, name })
    }

    // ON CLICK END ----------------------------------------------------------------------------------

});
