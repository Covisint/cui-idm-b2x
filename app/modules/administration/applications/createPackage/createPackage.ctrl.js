angular.module('administration')
.controller('createPackageCtrl', function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,$scope,DataStorage,Base,EditAndCreateApps){
	const createPackage=this
	const scopeName="createPackage."
	// Initialization
	createPackage.search= {}
	createPackage.claims=[]
	createPackage.tempClaim={}
	createPackage.tempClaimValue={}
	createPackage.serviceData = {
		categories : [
			{lang:"en",text:"administration"},
			{lang:"en",text:"cui-applications"},
			{lang:"en",text:"roles"}
		]
	}


	createPackage.test1 = () => {
			console.log("in controller")
				}
	// createPackage.packageData={
	// 	displayable:true,
	// 	requiredApprovals:['organizationAdmin']
	// }
	// createPackage.requireCompanyAdmin=true;
// HELPER FUNCTIONS START -------------------------------------------------------------------------------

	const initializeMultiLanguageFields = () => {
		createPackage.packageViewData.name={ 
			languages:[],
			label:'cui-name',
			required:true
		}
		createPackage.packageViewData.description={ 
			languages:[],
			label:'description',
			required:false
		}
		
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

	const finishLoading = (updating) => {
		if (updating) {
			Loader.offFor(scopeName+'packages')
		}		
		$scope.$digest()
	}

	// const updateApprovalFlags = () => {
	// 	createPackage.packageData.requiredApprovals.forEach(admin => {
	// 		if (admin==='organizationAdmin') {
	// 			createPackage.requireCompanyAdmin=true
	// 		}
	// 		else{
	// 			createPackage.requireAppAdmin=true
	// 		}
	// 	})
	// }

// HELPER FUNCTIONS START -------------------------------------------------------------------------------

// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------


// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------
	initializeRadioOptions()
	initializeMultiLanguageFields()	
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

	createPackage.showServiceForm = (service) => {
		createPackage.serviceData.service={}
		if (service) {
			createPackage.tempServiceName=service.name
			createPackage.serviceData.edit=true;
			angular.copy(service,createPackage.serviceData.service)
		};		
		createPackage.showServiceFormFlag=true;
	}

	createPackage.submit = () => {

	}
	createPackage.cancelEdit = () => {
		createPackage.showServiceFormFlag=false;
	}

	createPackage.saveService = () => {

	}

	createPackage.checkDuplicateLanguages = () => {
		createPackage.duplicateLanguage=EditAndCreateApps.checkDuplicateLanguages(createPackage.packageViewData.name)
		if (!createPackage.duplicateLanguage) {
			createPackage.duplicateLanguage=EditAndCreateApps.checkDuplicateLanguages(createPackage.packageViewData.description)
		}
		// createPackage.name.languages.every( selectedLanguage => {
		// 	if(createPackage.name.languages.filter( language => selectedLanguage.lang===language.lang).length>1){
		// 		createPackage.duplicateLanguage=true
		// 		return false
		// 	}else{
		// 		return true
		// 	}
		// })
		// No need to check next field if there is one with duplicate 
		// if (!createPackage.duplicateLanguage) {
		// 	createPackage.description.languages.every( selectedLanguage => {
		// 		if (selectedLanguage.text!=='') {
		// 			console.log(createPackage.description.languages.filter( language => selectedLanguage.lang===language.lang&&language.text!=='').length)
		// 			if(createPackage.description.languages.filter( language => selectedLanguage.lang===language.lang&&language.text!=='').length>1){
		// 				createPackage.duplicateLanguage=true
		// 				return false
		// 			}else{
		// 				return true
		// 			}
		// 		}
		// 		else{
		// 			return true
		// 		}
				
		// 	})
		// }
		$timeout(() => {
			createPackage.duplicateLanguage=false
		},5000)
		return !createPackage.duplicateLanguage
	}

	createPackage.createPackage = () => {
		createPackage.packageSubmitData = EditAndCreateApps.buildPackageData(createPackage.packageViewData)
	}
// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------
})