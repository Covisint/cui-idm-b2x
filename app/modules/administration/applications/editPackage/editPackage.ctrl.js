angular.module('administration')
.controller('editPackageCtrl', function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,$scope,DataStorage,EditAndCreateApps,$q){
	const editPackage=this
	const scopeName="editPackage."
	// Initialization
	editPackage.claims=[]
	editPackage.services =[]
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
		editPackage.services=editPackage.packageData.services
	};
	initializeRadioOptions()
	initializeMultiLanguageFields()

// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------
	editPackage.checkDuplicateLanguages = (data) => {
		return EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(data)
	}

		// ******************Related to Service***********************
	editPackage.toggleEditServiceForm = (selectedService) => {
		selectedService.editService=!selectedService.editService
		editPackage.serviceViewData = EditAndCreateApps.getDataForServiceTemplate(selectedService)
		editPackage.services.forEach( service => {
			if (service.id!==selectedService.id) {
				service.editService=false
			}
		})	
		editPackage.addServiceForm=false;
	}
	// On clicking edit service Cancel
	editPackage.cancelEdit = () => {
		// set add service form to false
		if (editPackage.services.length!==0) {
			editPackage.addServiceForm=false;
		}
		// set editservice flag to false for services
		editPackage.services.forEach( service => service.editService=false)
	}

	// On clicking edit service Add/Update
	editPackage.saveService = () => {
		if(EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(editPackage.serviceViewData)){
			// toggleServiceFormFlags(editFlag)
			let selectedService=EditAndCreateApps.buildServiceData(editPackage.serviceViewData)
			selectedService.editService=false
			if (editPackage.serviceViewData.editService ) {
				selectedService.id=editPackage.serviceViewData.id
				 editPackage.services.forEach(service => {
				 	if (service.id===selectedService.id) {
				 		angular.copy(selectedService,service)
				 	};
				 })
			}else{
				editPackage.addServiceForm=false
				selectedService.id=editPackage.services.length
				editPackage.services.push(selectedService)
			}
			
		}
	}

	// called when trying to add new service
	// reset the object whcih is being sent to service form template
	editPackage.updateAddServiceForm = () => {
		editPackage.addServiceForm=true
		editPackage.serviceViewData=EditAndCreateApps.initializeMultilanguageData(true,false)
		editPackage.services.forEach( service => service.editService=false)
	}

	editPackage.deleteService =  (index) => {
		editPackage.services.splice(index,1)
	}
// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------
})