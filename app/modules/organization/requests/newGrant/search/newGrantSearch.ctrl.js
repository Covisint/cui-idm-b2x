angular.module('organization')
.controller('newGrantSearchCtrl', function($scope, $stateParams, API) {
    const newGrantSearch = this

    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

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
        newGrantSearch.appsBeingRequested = newGrantsInStorage.applications
        newGrantSearch.packagesBeingRequested = newGrantsInStorage.packages
    }
    else {
        newGrantSearch.packagesBeingRequested = newGrantSearch.appsBeingRequested = []
    }

    newGrantSearch.numberOfRequests = newGrantSearch.appsBeingRequested.length + newGrantSearch.packagesBeingRequested.length

    Loader.onFor('newGrantSearch.user')
    API.cui.getPerson({ personId:$stateParams.userID })
    .then(res => {
        newGrantSearch.user = Object.assign({}, res)
        Loader.offFor('newGrantSearch.user')
        $scope.$digest()
    })

    const searchUpdate = () => {
        Loader.onFor('newGrantSearch.apps')

        newGrantSearch.search = Object.assign({}, $stateParams)
        let query = {
            personId: newGrantSearch.search.userID,
            category: newGrantSearch.search.category,
            page: newGrantSearch.search.page,
            pageSize: newGrant.search.pageSize,
            sortyBy: newGrant.search.sortyBy
        }

        if($stateParams.type==='application'){
            API.cui.getPersonGrantableApps({ personId:$stateParams.userID })
            .then(res => {
                newGrantSearch.applicationList = Object.assign({}, res)
                Loader.offFor('newGrantSearch.apps')
                $scope.$digest()
            })
        }
    }
    searchUpdate()



    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------



    // ON CLICK END ----------------------------------------------------------------------------------

})