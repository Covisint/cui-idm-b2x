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
// HELPER FUNCTIONS START -------------------------------------------------------------------------------

// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------
	const onLoad = (updating) => {	
		if (updating) {
			Loader.onFor(scopeName+'packages')
		}
		API.cui.getPackages()
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
	// Get Previously Loaded data from storage and do a lazy update
	if (DataStorage.getType('manageAllApplications')) {
		manageAllApplications.packages=DataStorage.getType('manageAllApplications')
		onLoad(false)
	}else{
		onLoad(true)
	}	

// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------


// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------
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
// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------
})