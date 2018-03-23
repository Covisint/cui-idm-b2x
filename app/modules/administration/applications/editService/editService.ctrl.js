angular.module('administration')
.controller('editServiceCtrl', function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,$scope,DataStorage){
const editService=this
	const scopeName="editService."
	// Initialization
	editService.serviceData = {
		categories : [
			{lang:"en",text:"Administration"},
			{lang:"en",text:"Application"},
			{lang:"en",text:"Roles"}
		]
	}
	// editService.packageData={
	// 	displayable:true,
	// 	requiredApprovals:['organizationAdmin']
	// }
	// editService.requireCompanyAdmin=true;
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
	if (DataStorage.getType('EditService')) {
		editService.serviceData.service=DataStorage.getType('EditService')
	};
	editService.tempServiceName=editService.serviceData.service.name
// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

	editService.showServiceForm = (service) => {
		editService.serviceData.service={}
		if (service) {
			editService.tempServiceName=service.name
			editService.serviceData.edit=true;
			angular.copy(service,editService.serviceData.service)
		};		
		editService.showServiceFormFlag=true;
	}

	editService.cancelEdit = () => {
		$state.go("administration.applications.manageApplications")
	}

	editService.saveService = () => {

	}
// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------
})