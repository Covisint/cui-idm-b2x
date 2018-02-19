angular.module('administration')
.controller('manageAllApplicationsCtrl', function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,$scope,DataStorage){
	const manageAllApplications=this
	const scopeName="manageAllApplications."
	manageAllApplications.search= {}

// HELPER FUNCTIONS START -------------------------------------------------------------------------------
	const finishLoading = (updating) => {
		if (updating) {
			Loader.offFor(scopeName+'packages')
		}		
		$scope.$digest()
	}

	const resetExpandedProperty = () => {
		manageAllApplications.packages.forEach(packageData => {
			packageData.expanded=false;
		})
	}

	const switchBetween = (property, firstValue, secondValue) => {
        // helper function to switch a property between two values or set to undefined if values not passed
        if (!firstValue) {
            manageAllApplications.search[property] = undefined
            return
        }
        manageAllApplications.search[property] = manageAllApplications.search[property] === firstValue
            ? secondValue
            : firstValue
    }
// HELPER FUNCTIONS START -------------------------------------------------------------------------------

// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------
	const onLoad = (updating) => {	
		Loader.onFor(scopeName+'count')
		if (updating) {
			Loader.onFor(scopeName+'packages')
		}

		let qs= APIHelpers.getQs(manageAllApplications.search)
		API.cui.countPackages({qs:qs})
		.then(count => {
			manageAllApplications.count=count
			Loader.offFor(scopeName+'count')
			manageAllApplications.reRenderPaginate && manageAllApplications.reRenderPaginate()
			return API.cui.getPackages({qs:qs})
		})
		.then(res => {
			manageAllApplications.packages = res
			res.forEach((packageData, index) => {
				API.cui.getPackageServices({packageId:packageData.id})
				.then(services => {
					packageData.services=services
					if (index === res.length-1) {
						DataStorage.setType('manageAllApplications', manageAllApplications.packages)
						finishLoading(updating)
					};
				})
				.fail(err=> {
					APIError.onFor(scopeName + 'services')
					if (index === res.length-1) {
						finishLoading(updating)
					};
				})
			})
		})
		.fail(err => {
			APIError.onFor(scopeName +'packages')
			finishLoading(updating)
		})
	}

	manageAllApplications.search = Object.assign({}, $stateParams)
	manageAllApplications.search.pageSize = manageAllApplications.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]
	manageAllApplications.search.page= manageAllApplications.search.page || 1
	// Get Previously Loaded data from storage and do a lazy update
	if (DataStorage.getType('manageAllApplications')) {
		manageAllApplications.packages=DataStorage.getType('manageAllApplications')
		resetExpandedProperty()
		onLoad(false)
	}else{
		onLoad(true)
	}	

// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------


// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------
	manageAllApplications.pageChange = (newpage) => {
        manageAllApplications.updateSearch('page', newpage)
    }

    manageAllApplications.updateSearchByName = () => {
        manageAllApplications.updateSearch('name',manageAllApplications.search['service.name'])
    }
    manageAllApplications.updateSearch = (updateType, updateValue) => {
        switch (updateType) {
            case 'alphabetic':
                switchBetween('sortBy', '+service.name', '-service.name')
                break
            case 'date':
                switchBetween('sortBy', '+grant.instant', '-grant.instant')
                break
            case 'status':
                manageAllApplications.search.page = 1
                manageAllApplications.search['grant.status'] = updateValue
                break
            case 'category':
                manageAllApplications.search.page = 1
                manageAllApplications.search['service.category'] = $filter('cuiI18n')(updateValue)
                break
            case 'name':
                manageAllApplications.search.page = 1
                break
        }

        // doesn't change state, only updates the url
        $state.transitionTo('administration.applications.manageApplications', manageAllApplications.search, { notify:false })
        onLoad(true)
    }

	manageAllApplications.expandAll = () =>{
		manageAllApplications.packages.forEach( packageData => {
			packageData.expanded=true;
		})
	}
		

	manageAllApplications.collapseAll = () => {
		manageAllApplications.packages.forEach( packageData => {
			packageData.expanded=false;
		})
	}

	manageAllApplications.goToEditPackage = (packageData) => {
		DataStorage.setType('EditPackage',packageData)
		$state.go("administration.applications.editPackage",{pkgId:packageData.id})
	}

	manageAllApplications.goToEditService = (serviceData) => {
		DataStorage.setType('EditService',serviceData)
		$state.go("administration.applications.editService",{serviceId:serviceData.id})
	}
// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------
})