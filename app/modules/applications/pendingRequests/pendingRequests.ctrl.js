angular.module('applications')
.controller('pendingAppRequestsCtrl', function(API,APIError,APIHelpers,DataStorage,Loader,$filter,$pagination,$q,$scope,$state,$stateParams) {

	const pendingAppRequests = this
    const loaderName = 'pendingAppRequests.'

    let checkedLocalStorage = false
    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    const switchBetween = (property, firstValue, secondValue) => {
        // helper function to switch a property between two values or set to undefined if values not passed
        if (!firstValue) {
            pendingAppRequests.search[property] = undefined
            return
        }
        pendingAppRequests.search[property] = pendingAppRequests.search[property] === firstValue
            ? secondValue
            : firstValue
    }

    // HELPER FUNCTIONS END ---------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------
    
    const loadStoredData = () => {
        // Check DataStorage if this page has been loaded before. We initially populate this screen
        // with data that was previously retrieved from the API while we redo calls to get the up to date data.
        const storedData = DataStorage.getType('pendingAppRequestsList')

        if (storedData) {
            Loader.onFor(loaderName + 'apps')
            pendingAppRequests.list = storedData.appList
            // Pagination not supported now 
            // pendingAppRequests.count = storedData.appCount
            Loader.offFor(loaderName + 'apps')
        }

        checkedLocalStorage = true
        onLoad(false)
    }

    const onLoad = (previouslyLoaded) => {
        if (previouslyLoaded) {
            Loader.onFor(loaderName + 'reloadingApps')
        }
        else {
            checkedLocalStorage ? Loader.onFor(loaderName + 'updating') : Loader.onFor(loaderName + 'apps')
            pendingAppRequests.search = Object.assign({}, $stateParams)
        }
        // Pagination not supported now 
        // pendingAppRequests.search.pageSize = pendingAppRequests.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

        const opts = {
            personId: API.getUser(),
            useCuid:true,
            qs: APIHelpers.getQs(pendingAppRequests.search)
        }

        const promises = [
            API.cui.getPersonPendingApps(opts) 
            // Pagination not supported now 
            // API.cui.getPersonGrantedAppCount(opts)
        ]

        $q.all(promises)
        .then(res => {
        	// Pagination not supported now 
            // pendingAppRequests.count = res[1]
            pendingAppRequests.list=res[0];
            // re-render pagination if available
            // Pagination not supported now
            // pendingAppRequests.reRenderPaginate && pendingAppRequests.reRenderPaginate()

            const storageData = {
                appList: pendingAppRequests.list
                // appCount: pendingAppRequests.count, 
            }
            DataStorage.setType('pendingAppRequestsList', storageData)
            APIError.offFor(loaderName + 'apps')
        })
        .catch(err => {
        	console.error('There was an error in fetcting user\'s pending applications ' +err)
            APIError.onFor(loaderName + 'apps')
        })
        .finally(() => {
            if (previouslyLoaded) {
                Loader.offFor(loaderName + 'reloadingApps')
            } 
            else {
                checkedLocalStorage ? Loader.offFor(loaderName + 'updating') : Loader.offFor(loaderName + 'apps')
            }
        })
    }

    loadStoredData()

    // ON LOAD END ------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

    pendingAppRequests.pageChange = (newpage) => {
        pendingAppRequests.updateSearch('page', newpage)
    }

    pendingAppRequests.updateSearch = (updateType, updateValue) => {
        switch (updateType) {
            case 'alphabetic':
                switchBetween('sortBy', '+service.name', '-service.name')
                break
            case 'date':
                switchBetween('sortBy', '+requestedDate', '-requestedDate')
                break
            case 'name':
                // Pagination not supported now 
                // myApplications.search.page = 1
                pendingAppRequests.search['name'] = updateValue
                break
        }

        // doesn't change state, only updates the url
        $state.transitionTo('pendingAppRequests', pendingAppRequests.search, { notify:false })
        onLoad(true)
    }

    pendingAppRequests.searchCallback= (searchWord) => {
        pendingAppRequests.updateSearch('name',searchWord)
    }

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------------
})