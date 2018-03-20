angular.module('administration')
.controller('createPackageCtrl', function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,$scope,DataStorage,Base,EditAndCreateApps){
	const createPackage=this
	const scopeName="createPackage."
	// Initialization
	createPackage.claims=[]
	createPackage.services =[]
	createPackage.addServiceForm=true
	createPackage.addClaimsForm =true
	createPackage.step=1
// HELPER FUNCTIONS START -------------------------------------------------------------------------------

	const initializeMultiLanguageFields = () => {
		angular.merge(createPackage.packageViewData,EditAndCreateApps.initializeMultilanguageData(true,false))
		
		createPackage.serviceViewData =EditAndCreateApps.initializeMultilanguageData(true,false)

		createPackage.claimViewData=EditAndCreateApps.initializeMultilanguageData(true,true)
		createPackage.claimViewData.indicator='many'
	}

	const initializeRadioOptions = () => {
		createPackage.packageViewData={
			requestable:false,
	        grantable:false,
	       	displayable:true,
	        requestReasonRequired:false,
	        requireCompanyAdmin:true,
			requireAppAdmin:false
		}
	}

	const finishSubmitting = () => {
		Loader.offFor(scopeName+'submitting')		
		$scope.$digest()
	}

// HELPER FUNCTIONS START -------------------------------------------------------------------------------

// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------


// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------
	initializeRadioOptions()
	initializeMultiLanguageFields()	
	EditAndCreateApps.initializeServiceTemplateData(createPackage)
	if (DataStorage.getType('createPackage')) {
		createPackage.packageData=DataStorage.getType('createPackage')
		updateApprovalFlags()
	};
	

// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

	createPackage.addClaim = () => {
		createPackage.claims.push(createPackage.tempClaim)
	}

	createPackage.addClaimValue = () => {
		claim.claimValues.push(createPackage.tempClaimValue)
	}

	createPackage.submit = () => {
		Loader.onFor(scopeName+'submitting')
		createPackage.packageSubmitData = EditAndCreateApps.buildPackageData(createPackage.packageViewData)
		// First service will be created from package Data, need to assign few values
		createPackage.packageSubmitData.category=createPackage.services[0].category
		createPackage.packageSubmitData.targetUrl= createPackage.services[0].urls[0].value
		console.log(createPackage.packageSubmitData)
		API.cui.createPackage({data:createPackage.packageSubmitData})
		.then(packageresult => {
			let apiPromises=[]
			createPackage.services.forEach((service,index) => {
				// first service will be created when package created we need to update first one
				if (index!==0) {
					apiPromises.push(API.cui.createService({data:service}))
				}
				else{
					// once update api ready need to push to promises array
				}
			})
			$q.all(apiPromises)
			.then(servicesResult => {
				let qs=[['packageId',packageresult.id]]
				servicesResult.forEach(service =>qs.push(['serviceId',service.id]))
				// associate each service to package
				API.cui.assignService({qs:qs})
				.then(res => {
					finishSubmitting()
				})
			})
			
		})
		.fail(err => {
			console.error("Error when creating package", err)
			APIError.onFor(scopeName+'submitting')
			finishSubmitting()
		})
	}

	createPackage.checkDuplicateLanguages = (data) => {
		return EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(data)
	}

	createPackage.next = () => {
		angular.copy(createPackage.packageViewData.name, createPackage.serviceViewData.name)
		angular.copy(createPackage.packageViewData.description, createPackage.serviceViewData.description)
	}

	// ******************Related to Service***********************
	createPackage.toggleEditServiceForm = (selectedService) => {
		selectedService.editService=!selectedService.editService
		createPackage.serviceViewData = EditAndCreateApps.getDataForServiceTemplate(selectedService)
		createPackage.services.forEach( service => {
			if (service.id!==selectedService.id) {
				service.editService=false
			}
		})	
		createPackage.addServiceForm=false;
	}
	// On clicking edit service Cancel
	createPackage.cancelEdit = () => {
		// set add service form to false
		if (createPackage.services.length!==0) {
			createPackage.addServiceForm=false;
		}
		// set editservice flag to false for services
		createPackage.services.forEach( service => service.editService=false)
	}

	// On clicking edit service Add/Update
	createPackage.saveService = () => {
		if(EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(createPackage.serviceViewData)){
			// toggleServiceFormFlags(editFlag)
			let selectedService=EditAndCreateApps.buildServiceData(createPackage.serviceViewData)
			selectedService.editService=false
			if (createPackage.serviceViewData.editService ) {
				selectedService.id=createPackage.serviceViewData.id
				 createPackage.services.forEach(service => {
				 	if (service.id===selectedService.id) {
				 		angular.copy(selectedService,service)
				 	};
				 })
			}else{
				createPackage.addServiceForm=false
				selectedService.id=createPackage.services.length
				createPackage.services.push(selectedService)
			}
			
		}
	}

	// called when trying to add new service
	// reset the object whcih is being sent to service form template
	createPackage.updateAddServiceForm = () => {
		createPackage.addServiceForm=true
		createPackage.serviceViewData=EditAndCreateApps.initializeMultilanguageData(true,false)
		createPackage.services.forEach( service => service.editService=false)
	}

	createPackage.deleteService =  (index) => {
		createPackage.services.splice(index,1)
	}

	// **************************Claims Related**********************
	createPackage.updateAddClaimForm = () => {
		createPackage.addClaimsForm=true
	}

	createPackage.updateAddClaimValueForm = () => {

	}
// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------

// ERROR HANDLING FUNCTIONS START-------------------------------------------------------------------
	createPackage.customErrors = {
        url: {
            url: function(){
                var URL_REGEXP = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
                if (createPackage.serviceViewData.targetUrl) {
                    return URL_REGEXP.test(createPackage.serviceViewData.targetUrl)
                }else{
                    return true;
                }
            }
        }
    }

// ERROR HANDLING FUNCTIONS END-------------------------------------------------------------------
})