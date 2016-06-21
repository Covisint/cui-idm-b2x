angular.module('applications')
.controller('applicationSearchCtrl',function (API, $scope, $stateParams, $state, DataStorage, $q, $pagination, APIHelpers, APIError, Loader) {
    let applicationSearch = this

    const appsBeingRequested = applicationSearch.appRequests = DataStorage.getType('appRequests') || []

    applicationSearch.appCheckbox = {}

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    const loaderName = 'applicationSearch.'

    const onLoad = (previouslyLoaded) => {
        if(previouslyLoaded) {
            Loader.onFor(loaderName + 'reloadingApps')
        }
        else {
            Loader.onFor(loaderName + 'apps')

            let numberOfRequests = 0
            appsBeingRequested.forEach(app => {
                applicationSearch.appCheckbox[app.id] = true
                numberOfRequests++
            })
            applicationSearch.numberOfRequests = numberOfRequests

            // pre populate fields based on state params on first load
            applicationSearch.search = Object.assign({}, $stateParams)
        }

        applicationSearch.search.pageSize = applicationSearch.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

        let opts = {
            personId: API.getUser(),
            useCuid:true,
            qs: APIHelpers.getQs(applicationSearch.search)
        }

        const promises = [API.cui.getPersonRequestableApps(opts), API.cui.getPersonRequestableCount(opts)]

        $q.all(promises)
        .then(res => {
            applicationSearch.list = Object.assign({}, res[0])
            applicationSearch.count = res[1]
            APIError.offFor(loaderName + 'apps')
        })
        .catch(err => {
            APIError.onFor(loaderName + 'apps')
        })
        .finally(() => {
            previouslyLoaded
                ? Loader.offFor(loaderName + 'reloadingApps')
                : Loader.offFor(loaderName + 'apps')
            applicationSearch.reRenderPaginate && applicationSearch.reRenderPaginate()
        })
    }
    onLoad(false)

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    applicationSearch.pageChange = (newpage) => {
        applicationSearch.updateSearch('page', newpage)
    }

    applicationSearch.updateSearch = (updateType, updateValue) => {
        switch (updateType) {
            case 'name':
                applicationSearch.search.page = 1
                break
        }

        $state.transitionTo('applications.search', applicationSearch.search, {notify: false}) // doesn't change state, only updates the url
        onLoad(true)
    }

    applicationSearch.toggleRequest = (application) => {
        if (DataStorage.getDataThatMatches('appRequests', {id: application.id})) {
            DataStorage.deleteDataThatMatches('appRequests', {id: application.id})
            applicationSearch.numberOfRequests--
            delete applicationSearch.appCheckbox[application.id]
        }
        else {
            DataStorage.appendToType('appRequests', application)
            applicationSearch.numberOfRequests++
            applicationSearch.appCheckbox[application.id] = true
        }
        applicationSearch.appRequests = DataStorage.getType('appRequests')
    }

    applicationSearch.checkout = () => {
        $state.go('applications.reviewRequest')
    }

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

})
