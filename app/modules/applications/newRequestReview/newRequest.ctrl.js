angular.module('applications')
.controller('newAppRequestCtrl', function (API, $scope, $state, DataStorage, Loader, APIError) {

    let newAppRequest = this

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    // HELPER FUNCTIONS END ---------------------------------------------------------------------------

    // ON LOAD START ----------------------------------------------------------------------------------------

    const loaderName = 'newAppRequest.'

    newAppRequest.appsBeingRequested = DataStorage.getType('appRequests') || []

    newAppRequest.numberOfRequests = newAppRequest.appsBeingRequested.length

    Loader.onFor(loaderName + 'categories')
    API.cui.getCategories()
    .then(res => {
        newAppRequest.categories = Object.assign({}, res)
        APIError.offFor(loaderName + 'categories')
    })
    .fail(err => {
        APIError.onFor(loaderName + 'categories')
    })
    .done(() => {
        Loader.offFor(loaderName + 'categories')
        $scope.$digest()
    })

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    newAppRequest.searchCallback = function(searchWord) {
        $state.go('applications.search', {name: searchWord})
    }

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

})
