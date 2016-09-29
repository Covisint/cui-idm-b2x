angular.module('applications')
.controller('orgApplicationsCtrl', function(API,Sort,User,$filter,$pagination,$q,$scope,$state,$stateParams) {

    const orgApplications = this
    const organizationId = User.user.organization.id

    orgApplications.loading = true
    orgApplications.search = {}
    orgApplications.search.page = orgApplications.search.page || 1
    orgApplications.paginationPageSize = orgApplications.paginationPageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    const switchBetween = (property, firstValue, secondValue) => { 
        // helper function to switch a property between two values or set to undefined if values not passed
        if(!firstValue) orgApplications.search[property] = undefined
        orgApplications.search[property] === firstValue ? orgApplications.search[property] = secondValue : orgApplications.search[property] = firstValue
    }

    const getPackageServices = (ArrayOfPackages) => {
        let services = []

        ArrayOfPackages.forEach((servicePackage) => {
            API.cui.getPackageServices({packageId: servicePackage.servicePackage.id})
            .then((res) => {
                res.forEach((service) => {
                    services.push(service)
                })
            })
        })

        return services
    }

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    const onLoad = (previouslyLoaded) => {
        if (previouslyLoaded) {
            orgApplications.loading = false
        }
        else {
            orgApplications.search.name = $stateParams.name
            orgApplications.search.category = $stateParams.category
            orgApplications.search.sortBy = $stateParams.sortBy
            orgApplications.search.refine = $stateParams.refine
            orgApplications.search.page = parseInt($stateParams.page)
            orgApplications.search.pageSize = parseInt($stateParams.pageSize)

            API.cui.getCategories()
            .then((res) => {
                orgApplications.categories = res
                $scope.$digest()
            })
        }

        let queryParams = [['page', String(orgApplications.search.page)], ['pageSize', String(orgApplications.search.pageSize)]]
        const promises = []
        const opts = {
            organizationId: organizationId,
            qs: queryParams
        }

        if (orgApplications.search.name) queryParams.push(['service.name', orgApplications.search.name])
        if (orgApplications.search.category) queryParams.push(['service.category', orgApplications.search.category])
        // sortBy: +/-service.name, +/-service.creation, +/-grant.instant
        if (orgApplications.search.sortBy) queryParams.push(['sortBy', orgApplications.search.sort])

        switch (orgApplications.search.refine) {
            case 'active':
            case 'suspended':
                queryParams.push(['grant.status', orgApplications.search.refine])
                promises.push(API.cui.getOrganizationGrantedApps(opts), API.cui.getPersonGrantedCount(opts))
                break
            case 'pending':
                promises.push(
                    API.cui.getOrgPendingServicePackages({qs: [['requestor.id', organizationId], ['requestor.type', 'organization']]})
                    .then((res) => {
                        return getPackageServices(res)
                    }),
                    API.cui.getOrganizationRequestableCount({organizationId: organizationId})
                )
                break
            case undefined:
                promises.push(API.cui.getOrganizationGrantedApps(opts), API.cui.getPersonGrantedCount(opts))
                break
        }

        $q.all(promises)
        .then((res) => {
            orgApplications.appList = res[0]
            orgApplications.count = res[1]
            orgApplications.loading = false
            if (orgApplications.reRenderPaginate) orgApplications.reRenderPaginate()
        })
    }

    onLoad(false)

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

    orgApplications.pageChange = (newpage) => {
        orgApplications.updateSearch('page', newpage)
    }

    orgApplications.updateSearch = (updateType, updateValue) => {
        switch (updateType){
            case 'alphabetic':
                switchBetween('sortBy', '+service.name', '-service.name')
                break
            case 'date':
                switchBetween('sortBy', '+grant.instant', '-grant.instant')
                break
            case 'status':
                orgApplications.search.page = 1
                orgApplications.search.refine = updateValue
                break
            case 'category':
                orgApplications.search.page = 1
                orgApplications.search.category = $filter('cuiI18n')(updateValue)
                break
        }

        // Updates URL, doesn't change state
        $state.transitionTo('applications.orgApplications', orgApplications.search, {notify: false})
        onLoad(true)
    }

    orgApplications.goToDetails = (application) => {
        const opts = {
            appId: application.id
        }
        $state.go('applications.orgApplications.applicationDetails', opts)
    }

    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

})
