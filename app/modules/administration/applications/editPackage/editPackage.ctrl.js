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
		editPackage.claimViewData.values=[]
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
		editPackage.packageData=angular.copy(DataStorage.getType('EditPackage'))
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

		// **************************Claims Related**********************

	editPackage.toggleEditClaimForm = (selectedClaim) => {
		selectedClaim.edit=!selectedClaim.edit
		editPackage.claimViewData = EditAndCreateApps.getClaimViewData(selectedClaim)
		editPackage.claims.forEach( claim => {
			if (claim.id!==selectedClaim.id) {
				claim.edit=false
			}
		})	
		editPackage.addClaimsForm=false;
	}
	// On clicking edit service Cancel
	editPackage.cancelClaimEdit = () => {
		// set add service form to false
		if (editPackage.claims.length!==0) {
			editPackage.addClaimsForm=false;
		}
		// set editservice flag to false for services
		editPackage.claims.forEach( claim => claim.edit=false)
	}

	// On clicking edit service Add/Update
	editPackage.saveClaim = () => {
		if(EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(editPackage.claimViewData)){
			// toggleServiceFormFlags(editFlag)
			let selectedClaim=EditAndCreateApps.buildClaimData(editPackage.claimViewData)
			selectedClaim.edit=false
			if (editPackage.claimViewData.edit ) {
				selectedClaim.id=editPackage.claimViewData.id
				 editPackage.claims.forEach(claim => {
				 	if (claim.id===selectedClaim.id) {
				 		angular.copy(selectedClaim,claim)
				 	};
				 })
			}else{
				editPackage.addClaimsForm=false
				selectedClaim.id=editPackage.claims.length
				editPackage.claims.push(selectedClaim)
			}
			
		}
	}

	editPackage.updateAddClaimForm = () => {
		editPackage.addClaimsForm=true
		editPackage.claimViewData=EditAndCreateApps.initializeMultilanguageData(true,true)
		editPackage.claimViewData.indicator="many"
		editPackage.claimViewData.values=[]
		editPackage.claims.forEach( claim => claim.edit=false)
	}

	editPackage.deleteClaim =  (index) => {
		editPackage.claims.splice(index,1)
	}

	// ******************* Value related *****************
	editPackage.toggleEditValueForm = (selectedValue) => {
		selectedValue.edit=!selectedValue.edit
		editPackage.claimViewData.valueViewData = EditAndCreateApps.getValueViewData(selectedValue)
		editPackage.claimViewData.values.forEach( value => {
			if (value.id!==selectedValue.id) {
				value.edit=false
			}
		})	
		editPackage.claimViewData.addValueForm=false;
	}
	// On clicking edit value Cancel
	editPackage.cancelValueEdit = () => {
		editPackage.claimViewData.addValueForm=false;
		// set editservice flag to false for services
		editPackage.claimViewData.values&&editPackage.claimViewData.values.forEach( value => value.edit=false)
	}

	// On clicking edit service Add/Update
	editPackage.saveValue = () => {
		if(EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(editPackage.claimViewData.valueViewData)){
			// toggleServiceFormFlags(editFlag)
			let selectedValue=EditAndCreateApps.buildValueData(editPackage.claimViewData.valueViewData)
			selectedValue.edit=false
			if (editPackage.claimViewData.valueViewData.edit) {
				selectedValue.id=editPackage.claimViewData.valueViewData.id
				 editPackage.claimViewData.values.forEach(value => {
				 	if (value.id===selectedValue.id) {
				 		angular.copy(selectedValue,value)
				 	};
				 })
			}else{
				editPackage.claimViewData.addValueForm=false
				if (!editPackage.claimViewData.values) {
					editPackage.claimViewData.values=[]
				};
				selectedValue.id=editPackage.claimViewData.values.length
				editPackage.claimViewData.values.push(selectedValue)
			}
			
		}
	}
	editPackage.updateAddClaimValueForm = () => {
		if (editPackage.claimViewData.indicator==="one"&&editPackage.claimViewData.values&&editPackage.claimViewData.values.length===1) {
			editPackage.indicatorErrorAddValue=true
			$timeout(() => {
				editPackage.indicatorErrorAddValue=false
			},3000)
			return
		}
		else{
			editPackage.indicatorErrorAddValue=false
		}
		editPackage.claimViewData.addValueForm=true
		editPackage.claimViewData.valueViewData=EditAndCreateApps.initializeMultilanguageData(true,true)
		if (editPackage.claimViewData.values) {
			editPackage.claimViewData.values.forEach(value => value.edit=false)
		};
	}

	editPackage.deleteClaimValue =  (index) => {
		editPackage.claimViewData.values.splice(index,1)
		if (editPackage.indicatorError&&editPackage.claimViewData.values.length<2) {
			editPackage.indicatorError=false
		};
	}

	editPackage.checkForValueDuplicates = () => {
		editPackage.claimViewData.values.forEach
	}

// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------

// ERROR HANDLING FUNCTIONS START-------------------------------------------------------------------
	editPackage.customErrors = {
		duplicateValue:{
			duplicateValue:function(){
				return editPackage.claimViewData.values.every( value => {
					if (editPackage.claimViewData.valueViewData.id!==value.id) {
						return value.claimValueId!==editPackage.claimViewData.valueViewData.claimValueId
					}else{
						return true
					}
				})
			}
		},
		duplicateClaim:{
			duplicateClaim:function(){
				return editPackage.claims.every( claim => {
					if (editPackage.claimViewData.id!==claim.id) {
						return claim.claimId!==editPackage.claimViewData.claimId
					}else{
						return true
					}
				})
			}
		},
        url: {
            url: function(){
                var URL_REGEXP = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
                if (editPackage.serviceViewData.targetUrl) {
                    return URL_REGEXP.test(editPackage.serviceViewData.targetUrl)
                }else{
                    return true;
                }
            }
        }
    }

// ERROR HANDLING FUNCTIONS END-------------------------------------------------------------------
})