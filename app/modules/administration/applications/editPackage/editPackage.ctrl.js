angular.module('administration')
.controller('editPackageCtrl', function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,$scope,DataStorage,EditAndCreateApps,$q){
	const editPackage=this
	const scopeName="editPackage."
	// Initialization
	editPackage.claims=[]
	editPackage.services =[]
	editPackage.addServiceForm=true
	editPackage.addClaimsForm =true
	editPackage.step=1

// HELPER FUNCTIONS START -------------------------------------------------------------------------------
	const initializeMultiLanguageFields = () => {
		angular.merge(editPackage.packageViewData,EditAndCreateApps.initializeMultilanguageData(true,false, editPackage.packageData))
		
		editPackage.serviceViewData =EditAndCreateApps.initializeMultilanguageData(true,false)

		editPackage.claimViewData=EditAndCreateApps.initializeMultilanguageData(true,true)
		editPackage.claimViewData.indicator='many'
	}

	const initializeRadioOptions = () => {
		editPackage.packageViewData={
			requestable:editPackage.packageData.requestable,
	        grantable:editPackage.packageData.grantable,
	       	displayable:editPackage.packageData.displayable,
	        requestReasonRequired:editPackage.packageData.requestReasonRequired,
	        requireCompanyAdmin:false,
	        requireAppAdmin:false
		}

		editPackage.packageData.requiredApprovals.forEach(admin => {
			if (admin==='organizationAdmin') {
				editPackage.packageViewData.requireCompanyAdmin=true
			}
			else{
				editPackage.packageViewData.requireAppAdmin=true
			}
		})
	}

	const finishLoading = (updating) => {
		if (updating) {
			Loader.offFor(scopeName+'packages')
		}		
		$scope.$digest()
	}

	const handleError = (err) =>{
		console.error("Error when creating services", err)
		APIError.onFor(scopeName+'submitting')
		finishSubmitting()
	}

// HELPER FUNCTIONS START -------------------------------------------------------------------------------

// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------


// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------
	EditAndCreateApps.initializeServiceTemplateData(editPackage)
	if (DataStorage.getType('EditPackage')) {
		editPackage.packageData=DataStorage.getType('EditPackage')
	};
	initializeRadioOptions()
	initializeMultiLanguageFields()

// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

	editPackage.addClaim = () => {
		editPackage.claims.push(editPackage.tempClaim)
	}

	editPackage.addClaimValue = (claim) => {
		claim.claimValues.push(editPackage.tempClaimValue)
	}

	editPackage.showServiceForm = (service) => {
		editPackage.serviceData.service={}
		if (service) {
			editPackage.tempServiceName=service.name
			editPackage.serviceData.edit=true;
			angular.copy(service,editPackage.serviceData.service)
		};		
		editPackage.showServiceFormFlag=true;
	}

	editPackage.submit = () => {

	}
	editPackage.cancelEdit = () => {
		editPackage.showServiceFormFlag=false;
	}

	editPackage.saveService = () => {

	}
// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------
})