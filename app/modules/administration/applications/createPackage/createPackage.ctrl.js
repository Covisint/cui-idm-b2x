angular.module('administration')
.controller('createPackageCtrl', function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,$scope,DataStorage){
	const createPackage=this
	const scopeName="createPackage."
	// Initialization
	createPackage.search= {}
	createPackage.claims=[]
	createPackage.tempClaim={}
	createPackage.tempClaimValue={}
	createPackage.serviceData = {
		categories : [
			{lang:"en",text:"Administration"},
			{lang:"en",text:"Application"},
			{lang:"en",text:"Roles"}
		]
	}
	// createPackage.packageData={
	// 	displayable:true,
	// 	requiredApprovals:['organizationAdmin']
	// }
	// createPackage.requireCompanyAdmin=true;
// HELPER FUNCTIONS START -------------------------------------------------------------------------------
	const finishLoading = (updating) => {
		if (updating) {
			Loader.offFor(scopeName+'packages')
		}		
		$scope.$digest()
	}

	const updateApprovalFlags = () => {
		createPackage.packageData.requiredApprovals.forEach(admin => {
			if (admin==='organizationAdmin') {
				createPackage.requireCompanyAdmin=true
			}
			else{
				createPackage.requireAppAdmin=true
			}
		})
	}

// HELPER FUNCTIONS START -------------------------------------------------------------------------------

// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------


// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------
	if (DataStorage.getType('createPackage')) {
		createPackage.packageData=DataStorage.getType('createPackage')
		updateApprovalFlags()
	};
	

// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

	createPackage.addClaim = () => {
		createPackage.claims.push(createPackage.tempClaim)
	}

	createPackage.addClaimValue = (claim) => {
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
// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------
})