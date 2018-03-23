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

	createPackage.toggleEditClaimForm = (selectedClaim) => {
		selectedClaim.edit=!selectedClaim.edit
		createPackage.claimViewData = EditAndCreateApps.getClaimViewData(selectedClaim)
		createPackage.claims.forEach( claim => {
			if (claim.id!==selectedClaim.id) {
				claim.edit=false
			}
		})	
		createPackage.addClaimsForm=false;
	}
	// On clicking edit service Cancel
	createPackage.cancelClaimEdit = () => {
		// set add service form to false
		if (createPackage.claims.length!==0) {
			createPackage.addClaimsForm=false;
		}
		// set editservice flag to false for services
		createPackage.claims.forEach( claim => claim.edit=false)
	}

	// On clicking edit service Add/Update
	createPackage.saveClaim = () => {
		if(EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(createPackage.claimViewData)){
			// toggleServiceFormFlags(editFlag)
			let selectedClaim=EditAndCreateApps.buildClaimData(createPackage.claimViewData)
			selectedClaim.edit=false
			if (createPackage.claimViewData.edit ) {
				selectedClaim.id=createPackage.claimViewData.id
				 createPackage.claims.forEach(claim => {
				 	if (claim.id===selectedClaim.id) {
				 		angular.copy(selectedClaim,claim)
				 	};
				 })
			}else{
				createPackage.addClaimsForm=false
				selectedClaim.id=createPackage.claims.length
				createPackage.claims.push(selectedClaim)
			}
			
		}
	}

	createPackage.updateAddClaimForm = () => {
		createPackage.addClaimsForm=true
		createPackage.claimViewData=EditAndCreateApps.initializeMultilanguageData(true,true)
		createPackage.claimViewData.indicator="many"
		createPackage.claims.forEach( claim => claim.edit=false)
	}

	createPackage.deleteClaim =  (index) => {
		createPackage.claims.splice(index,1)
	}

	// ******************* Value related *****************
	createPackage.toggleEditValueForm = (selectedValue) => {
		selectedValue.edit=!selectedValue.edit
		createPackage.claimViewData.valueViewData = EditAndCreateApps.getValueViewData(selectedValue)
		createPackage.claimViewData.values.forEach( value => {
			if (value.id!==selectedValue.id) {
				value.edit=false
			}
		})	
		createPackage.claimViewData.addValueForm=false;
	}
	// On clicking edit value Cancel
	createPackage.cancelValueEdit = () => {
		createPackage.claimViewData.addValueForm=false;
		// set editservice flag to false for services
		createPackage.claimViewData.values&&createPackage.claimViewData.values.forEach( value => value.edit=false)
	}

	// On clicking edit service Add/Update
	createPackage.saveValue = () => {
		if(EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(createPackage.claimViewData.valueViewData)){
			// toggleServiceFormFlags(editFlag)
			let selectedValue=EditAndCreateApps.buildValueData(createPackage.claimViewData.valueViewData)
			selectedValue.edit=false
			if (createPackage.claimViewData.valueViewData.edit) {
				selectedValue.id=createPackage.claimViewData.valueViewData.id
				 createPackage.claimViewData.values.forEach(value => {
				 	if (value.id===selectedValue.id) {
				 		angular.copy(selectedValue,value)
				 	};
				 })
			}else{
				createPackage.claimViewData.addValueForm=false
				if (!createPackage.claimViewData.values) {
					createPackage.claimViewData.values=[]
				};
				selectedValue.id=createPackage.claimViewData.values.length
				createPackage.claimViewData.values.push(selectedValue)
			}
			
		}
	}
	createPackage.updateAddClaimValueForm = () => {
		createPackage.claimViewData.addValueForm=true
		createPackage.claimViewData.valueViewData=EditAndCreateApps.initializeMultilanguageData(true,true)
		if (createPackage.claimViewData.values) {
			createPackage.claimViewData.values.forEach(value => value.edit=false)
		};
	}

	createPackage.deleteClaimValue =  (index) => {
		createPackage.claimViewData.values.splice(index,1)
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