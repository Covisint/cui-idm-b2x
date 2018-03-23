angular.module('administration')
.controller('editPackageCtrl', function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,$scope,DataStorage){
	const editPackage=this
	const scopeName="editPackage."
	// Initialization
	editPackage.search= {}
	editPackage.claims=[]
	editPackage.tempClaim={}
	editPackage.tempClaimValue={}
	editPackage.serviceData = {
		categories : [
			{lang:"en",text:"Administration"},
			{lang:"en",text:"Application"},
			{lang:"en",text:"Roles"}
		]
	}
	// editPackage.packageData={
	// 	displayable:true,
	// 	requiredApprovals:['organizationAdmin']
	// }
	// editPackage.requireCompanyAdmin=true;
// HELPER FUNCTIONS START -------------------------------------------------------------------------------
	const finishLoading = (updating) => {
		if (updating) {
			Loader.offFor(scopeName+'packages')
		}		
		$scope.$digest()
	}

	const updateApprovalFlags = () => {
		editPackage.packageData.requiredApprovals.forEach(admin => {
			if (admin==='organizationAdmin') {
				editPackage.requireCompanyAdmin=true
			}
			else{
				editPackage.requireAppAdmin=true
			}
		})
	}

// HELPER FUNCTIONS START -------------------------------------------------------------------------------

// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------


// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------
	if (DataStorage.getType('EditPackage')) {
		editPackage.packageData=DataStorage.getType('EditPackage')
	};
	updateApprovalFlags()

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