angular.module('administration')
.controller('editPackageCtrl', function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,$scope,DataStorage){
	const editPackage=this
	const scopeName="editPackage."
	// Initialization
	editPackage.search= {}
	editPackage.claims=[]
	editPackage.tempClaim={}
	editPackage.tempClaimValue={}
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
		editPackage.storedData=DataStorage.getType('EditPackage')
	};
	editPackage.packageData= editPackage.storedData
	delete editPackage.packageData.services
	updateApprovalFlags()

// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

	editPackage.addClaim = () => {
		editPackage.claims.push(editPackage.tempClaim)
	}

	editPackage.addClaimValue = (claim) => {
		claim.claimValues.push(editPackage.tempClaimValue)
	}
// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------
})