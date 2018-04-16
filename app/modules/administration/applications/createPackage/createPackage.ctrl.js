angular.module('administration')
.controller('createPackageCtrl', function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,$scope,DataStorage,Base,EditAndCreateApps,$q){
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
		createPackage.claimViewData.claimValues=[]
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

	const handleError = (err) =>{
		console.error("Error when creating services", err)
		APIError.onFor(scopeName+'submitting')
		finishSubmitting()
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
	
	createPackage.firstSubmitStep = () =>{
		API.cui.createPackage({data:createPackage.packageSubmitData})
		.then( packageresult => {
			createPackage.packageresult=packageresult
			createPackage.submitStep=2
			createPackage.secondSubmitStep()
		})
		.fail(handleError)
	}

	createPackage.secondSubmitStep = () =>{
		let apiPromises=[]
		createPackage.services.forEach((service,index) => {
			// first service will be created when package created we need to update first one
			if (index!==0) {
				let data= angular.copy(service)
				delete data.id
				apiPromises.push(API.cui.createService({data:data}))
			}
			else{
				// once update api ready need to push to promises array
			}
		})
		$q.all(apiPromises)
		.then(servicesResult => {
			createPackage.submitStep=3
			createPackage.servicesResult=servicesResult
			createPackage.thirdSubmitStep()
		})
		.catch(err => {
			console.error("Error when creating services", err)
			APIError.onFor(scopeName+'submitting')
			Loader.offFor(scopeName+'submitting')
		})
	}

	createPackage.thirdSubmitStep = () =>{
		let qs=[['packageId',createPackage.packageresult.id]]
		createPackage.servicesResult.forEach(service =>qs.push(['serviceId',service.id]))
		// associate each service to package
		if (createPackage.servicesResult.length!==0) {
			API.cui.assignService({qs:qs})
			.then(res => {
				createPackage.success=true
				$timeout( () => {
					$state.go('administration.applications.manageApplications')
				},3000)
				finishSubmitting()
			})
			.fail(handleError)	
		}else{
			createPackage.success=true
			$timeout( () => {
				$state.go('administration.applications.manageApplications')
			},3000)
			Loader.offFor(scopeName+'submitting')	
		}
	}

	createPackage.submitStep=1

	createPackage.submit = () => {
		Loader.onFor(scopeName+'submitting')
		createPackage.packageSubmitData = EditAndCreateApps.buildPackageData(createPackage.packageViewData)
		// First service will be created from package Data, need to assign few values
		createPackage.packageSubmitData.category=createPackage.services[0].category
		createPackage.packageSubmitData.targetUrl= createPackage.services[0].urls[0].value
		switch(createPackage.submitStep){
			case 1:createPackage.firstSubmitStep();break;
			case 2:createPackage.secondSubmitStep();break;
			case 3:createPackage.thirdSubmitStep();break;
		}		
	}

	createPackage.checkDuplicateLanguages = (data) => {
		return EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(data)
	}

	createPackage.next = () => {
		angular.copy(createPackage.packageViewData.name, createPackage.serviceViewData.name)
		angular.copy(createPackage.packageViewData.description, createPackage.serviceViewData.description)
	}

	createPackage.indicatorChange = ( indicator ) => {
		if (indicator==="one"&&createPackage.claimViewData.claimValues && createPackage.claimViewData.claimValues.length>1) {
			createPackage.indicatorError=true
		}else{
			createPackage.indicatorError=false
			createPackage.indicatorErrorAddValue=false
		}
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
		createPackage.claimViewData.claimValues=[]
		createPackage.claims.forEach( claim => claim.edit=false)
	}

	createPackage.deleteClaim =  (index) => {
		createPackage.claims.splice(index,1)
	}

	// ******************* Value related *****************
	createPackage.toggleEditValueForm = (selectedValue) => {
		selectedValue.edit=!selectedValue.edit
		createPackage.claimViewData.valueViewData = EditAndCreateApps.getValueViewData(selectedValue)
		createPackage.claimViewData.claimValues.forEach( value => {
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
		createPackage.claimViewData.claimValues&&createPackage.claimViewData.claimValues.forEach( value => value.edit=false)
	}

	// On clicking edit service Add/Update
	createPackage.saveValue = () => {
		if(EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(createPackage.claimViewData.valueViewData)){
			// toggleServiceFormFlags(editFlag)
			let selectedValue=EditAndCreateApps.buildValueData(createPackage.claimViewData.valueViewData)
			selectedValue.edit=false
			if (createPackage.claimViewData.valueViewData.edit) {
				selectedValue.id=createPackage.claimViewData.valueViewData.id
				 createPackage.claimViewData.claimValues.forEach(value => {
				 	if (value.id===selectedValue.id) {
				 		angular.copy(selectedValue,value)
				 	};
				 })
			}else{
				createPackage.claimViewData.addValueForm=false
				if (!createPackage.claimViewData.claimValues) {
					createPackage.claimViewData.claimValues=[]
				};
				selectedValue.id=createPackage.claimViewData.claimValues.length
				createPackage.claimViewData.claimValues.push(selectedValue)
			}
			
		}
	}
	createPackage.updateAddClaimValueForm = () => {
		if (createPackage.claimViewData.indicator==="one"&&createPackage.claimViewData.claimValues&&createPackage.claimViewData.claimValues.length===1) {
			createPackage.indicatorErrorAddValue=true
			$timeout(() => {
				createPackage.indicatorErrorAddValue=false
			},3000)
			return
		}
		else{
			createPackage.indicatorErrorAddValue=false
		}
		createPackage.claimViewData.addValueForm=true
		createPackage.claimViewData.valueViewData=EditAndCreateApps.initializeMultilanguageData(true,true)
		if (createPackage.claimViewData.claimValues) {
			createPackage.claimViewData.claimValues.forEach(value => value.edit=false)
		};
	}

	createPackage.deleteClaimValue =  (index) => {
		createPackage.claimViewData.claimValues.splice(index,1)
		if (createPackage.indicatorError&&createPackage.claimViewData.claimValues.length<2) {
			createPackage.indicatorError=false
		};
	}


// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------

// ERROR HANDLING FUNCTIONS START-------------------------------------------------------------------
	createPackage.customErrors = {
		duplicateValue:{
			duplicateValue:function(){
				return createPackage.claimViewData.claimValues.every( value => {
					if (createPackage.claimViewData.valueViewData.id!==value.id) {
						return value.claimValueId!==createPackage.claimViewData.valueViewData.claimValueId
					}else{
						return true
					}
				})
			}
		},
		duplicateClaim:{
			duplicateClaim:function(){
				return createPackage.claims.every( claim => {
					if (createPackage.claimViewData.id!==claim.id) {
						return claim.claimId!==createPackage.claimViewData.claimId
					}else{
						return true
					}
				})
			}
		},
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