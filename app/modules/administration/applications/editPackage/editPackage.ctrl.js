angular.module('administration')
.controller('editPackageCtrl', function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,$scope,DataStorage){
	const editPackage=this
	const scopeName="editPackage."
	editPackage.search= {}
	editPackage.claims=[]
	editPackage.tempClaim={}
	editPackage.tempClaimValue={}

// HELPER FUNCTIONS START -------------------------------------------------------------------------------
	const finishLoading = (updating) => {
		if (updating) {
			Loader.offFor(scopeName+'packages')
		}		
		$scope.$digest()
	}


// HELPER FUNCTIONS START -------------------------------------------------------------------------------

// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------


// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------


// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

	editPackage.addClaim = () => {
		editPackage.claims.push(editPackage.tempClaim)
	}

	editPackage.addClaimValue = (claim) => {
		claim.claimValues.push(editPackage.tempClaimValue)
	}
// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------
})