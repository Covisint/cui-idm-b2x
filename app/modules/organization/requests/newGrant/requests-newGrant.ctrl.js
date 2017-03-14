angular.module('organization')
.controller('newGrantCtrl', function(API, $stateParams, $scope, $state, $filter, Loader, DataStorage,NewGrant) {

    const newGrant = this
    newGrant.prevStateParams={
        userId:$stateParams.userId
    }
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
    NewGrant.pullFromStorage(newGrant,$stateParams.userId,'person');
    Loader.onFor('newGrant.user')
    API.cui.getPerson({ personId:$stateParams.userId })
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
        if (!opts) {
            $state.go('organization.requests.newGrantSearch',{type:newGrant.searchType, userId: $stateParams.userId});
        } else if (typeof opts ==='string') {
            $state.go('organization.requests.newGrantSearch',{type:newGrant.searchType, userId: $stateParams.userId, name: opts});
        } else {
            const optsParser = {
                category: (unparsedCategory) => {
                    const category = $filter('cuiI18n')(unparsedCategory)
                    $state.go('organization.requests.newGrantSearch',{type:newGrant.searchType, userId: $stateParams.userId, category})
                }
            }
            optsParser[opts.type](opts.value)
        }
    }

    newGrant.goToClaimSelection = () => {
        $state.go('organization.requests.newGrantClaims', { userId: $stateParams.userId })
    }
    // ON CLICK END ----------------------------------------------------------------------------------

});
