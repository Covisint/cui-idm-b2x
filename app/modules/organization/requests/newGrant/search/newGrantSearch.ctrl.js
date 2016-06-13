angular.module('organization')
.controller('newGrantSearchCtrl', function ($scope, $state, $stateParams, API, DataStorage, Loader, $pagination, APIHelpers, $q) {
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
    if (newGrantsInStorage) {
        newGrantSearch.appsBeingRequested = newGrantsInStorage.applications
        newGrantSearch.packagesBeingRequested = newGrantsInStorage.packages
    }
    else {
        newGrantSearch.packagesBeingRequested = newGrantSearch.appsBeingRequested = []
    }

    newGrantSearch.numberOfRequests = newGrantSearch.appsBeingRequested.length + newGrantSearch.packagesBeingRequested.length

    Loader.onFor('newGrantSearch.user')
    API.cui.getPerson({ personId: $stateParams.userID })
    .then(res => {
        newGrantSearch.user = Object.assign({}, res)
        Loader.offFor('newGrantSearch.user')
        $scope.$digest()
    })

    const searchUpdate = (previouslyLoaded) => {
        Loader.onFor('newGrantSearch.apps')
        if (!previouslyLoaded) newGrantSearch.search = Object.assign({}, $stateParams)

        const type = newGrantSearch.search.type || 'applications'

        const queryParams = {
            'service.name': newGrantSearch.search.name,
            category: newGrantSearch.search.category,
            page: newGrantSearch.search.page || 1,
            pageSize: newGrantSearch.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0],
            sortBy: newGrantSearch.search.sortBy
        }

        const queryArray = APIHelpers.getQs(queryParams)

        const queryOptions = {
            personId: $stateParams.userID,
            qs: queryArray
        }

        if (type === 'applications') {
            $q.all([10, API.cui.getPersonGrantableApps(queryOptions)]) // TODO: REPLACE WITH REAL COUNT
            .then(res => {
                newGrantSearch.applicationList = res[1].slice()
                newGrantSearch.count = res[0]
                if(newGrantSearch.reRenderPaginate) newGrantSearch.reRenderPaginate()
                Loader.offFor('newGrantSearch.apps')
            })
        }
    }
    searchUpdate()

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    newGrantSearch.applicationCheckbox = {}

    newGrantSearch.packageCheckbox = {}

    newGrantSearch.requests = {
        application : {},
        package: {}
    }

    newGrantSearch.toggleRequest = ({ type, payload }) => {
        const storedRequests = newGrantSearch.requests[type]
        storedRequests[payload.id] ? delete storedRequests[payload.id] : storedRequests[payload.id] = payload
        if(storedRequests[payload.id]) newGrantSearch[type + 'Checkbox'][payload.id] = true
        else if(newGrantSearch[type + 'Checkbox'][payload.id]) delete newGrantSearch[type + 'Checkbox'][payload.id]
    }

    newGrantSearch.updateSearch = () => {
        const stateParams = Object.assign({}, newGrantSearch.search)
        $state.transitionTo('organization.requests.newGrantSearch', stateParams, {notify:false})
        searchUpdate(true)
    }

    // ON CLICK END ----------------------------------------------------------------------------------
})
