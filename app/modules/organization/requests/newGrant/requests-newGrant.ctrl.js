angular.module('organization')
.controller('newGrantCtrl', function(API, $stateParams, $scope, $state, $filter, Loader, DataStorage) {

    const newGrant = this

    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    newGrant.searchType = 'applications'

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

    const newGrantsInStorage = DataStorage.getDataThatMatches('newGrant', { userId: $stateParams.userID })
    if(newGrantsInStorage) {
        newGrant.appsBeingRequested = newGrantsInStorage.applications
        newGrant.packagesBeingRequested = newGrantsInStorage.packages
    }
    else {
        newGrant.appsBeingRequested = {}
        newGrant.packagesBeingRequested = {}
    }

    newGrant.numberOfRequests = Object.keys(newGrant.appsBeingRequested).length + Object.keys(newGrant.packagesBeingRequested).length

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
        newGrant.categories = res.slice()
        Loader.offFor('newGrant.categories')
        $scope.$digest()
    })

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    newGrant.searchCallback = (opts) => {
        if (!opts) $state.go('organization.requests.newGrantSearch',{type:newGrant.searchType, userID: $stateParams.userID})
        else if (typeof opts ==='string') $state.go('organization.requests.newGrantSearch',{type:newGrant.searchType, userID: $stateParams.userID, name: opts})
        else {
            const optsParser = {
                category: (unparsedCategory) => {
                    const category = $filter('cuiI18n')(unparsedCategory)
                    $state.go('organization.requests.newGrantSearch',{type:newGrant.searchType, userID: $stateParams.userID, category})
                }
            }
            optsParser[opts.type](opts.value)
        }
    }

    // ON CLICK END ----------------------------------------------------------------------------------

});
