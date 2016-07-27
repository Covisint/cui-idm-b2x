angular.module('applications')
.controller('myApplicationsCtrl', function(localStorageService, $scope, $stateParams, API, $state, $filter, $q, $pagination, Loader, APIHelpers, APIError) {

    let myApplications = this

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    const switchBetween = (property, firstValue, secondValue) => {
        // helper function to switch a property between two values or set to undefined if values not passed
        if (!firstValue) {
            myApplications.search[property] = undefined
            return
        }
        myApplications.search[property] = myApplications.search[property] === firstValue
            ? secondValue
            : firstValue
    }

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    const loaderName = 'myApplications.'

    const onLoad = (previouslyLoaded) => {

        if (previouslyLoaded) {
            Loader.onFor(loaderName + 'reloadingApps')
        } else { // pre populate fields based on state params on first load
            Loader.onFor(loaderName + 'apps')
            myApplications.search = Object.assign({}, $stateParams)

            Loader.onFor(loaderName + 'categories')
            API.cui.getCategories()
            .then(res => {
                APIError.offFor(loaderName + 'categories')
                myApplications.categories = Object.assign({}, res)
                APIError.offFor(loaderName + 'categories')
            })
            .fail(err => {
                APIError.onFor(loaderName + 'categories')
            })
            .done(() => {
                Loader.offFor(loaderName + 'categories')
                $scope.$digest()
            })
        }

        myApplications.search.pageSize = myApplications.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

        const opts = {
            personId: API.getUser(),
            useCuid:true,
            qs: APIHelpers.getQs(myApplications.search)
        }

        const promises = [API.cui.getPersonGrantedApps(opts), API.cui.getPersonGrantedCount(opts)]

        $q.all(promises)
        .then(res => {
            myApplications.list = Object.assign(res[0])
            myApplications.count = res[1]
            myApplications.reRenderPaginate && myApplications.reRenderPaginate() // re-render pagination if available
            APIError.offFor(loaderName + 'apps')
        })
        .catch(err => {
            APIError.onFor(loaderName + 'apps')
        })
        .finally(() => {
            if (previouslyLoaded) Loader.offFor(loaderName + 'reloadingApps')
            else Loader.offFor(loaderName + 'apps')
        })
    }

    onLoad(false)

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

    myApplications.pageChange = (newpage) => {
        myApplications.updateSearch('page', newpage)
    }

    myApplications.updateSearch = (updateType, updateValue) => {
        switch (updateType){
            case 'alphabetic':
                switchBetween('sort', '+service.name', '-service.name')
                break
            case 'date':
                switchBetween('sort', '+grant.instant', '-grant.instant')
                break
            case 'status':
                myApplications.search.page = 1
                myApplications.search.refine = updateValue
                break
            case 'category':
                myApplications.search.page = 1
                myApplications.search.category = $filter('cuiI18n')(updateValue)
                break
        }

        $state.transitionTo('applications.myApplications', myApplications.search, { notify:false }) // doesn't change state, only updates the url
        onLoad(true)

    }

    myApplications.goToDetails = (application) => {
        const opts = {
            appId: application.id
        }
        $state.go('applications.myApplicationDetails', opts)
    }


    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

})
