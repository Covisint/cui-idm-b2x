angular.module('administration')
.controller('editPackageCtrl', function($timeout,$filter,UserList,$pagination,$state,$stateParams,$http,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,$scope,DataStorage,EditAndCreateApps,$q){
	const editPackage=this
	const scopeName="editPackage."
	// Initialization
	editPackage.claims=[]
	editPackage.services =[]
	editPackage.addClaimsForm =true
	editPackage.step=1

	editPackage.tempClaim={}
	editPackage.tempClaimValue={}
	editPackage.serviceData = {
		categories : [
			{lang:"en",text:"Administration"},
			{lang:"en",text:"Application"},
			{lang:"en",text:"Roles"}
		]
	}

	editPackage.userList =[];

    editPackage.selectedUserIds =[];

    editPackage.search ={};

	editPackage.search.page = parseInt($stateParams.page || 1)
	//editPackage.pageSize = parseInt($stateParams.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions[0])

    editPackage.pageSize = 	10;


	//--------------------------------------------Add Admin START

  $scope.$watch('editPackage.searchValue', function(newValue, oldValue) {
  if(oldValue){
    if(!newValue){
      editPackage.clearSearchParams();
      editPackage.intiateAdminPage();
    }
  }
});

  editPackage.clearSearchParams=()=>{

    for(let option of editPackage.options){
      delete editPackage.search[option.attributeName];
    }
  }
 const populateAvailableUsers = ({ page, pageSize} = {}) => {
        editPackage.availableUserList = _.drop(editPackage.availableUsers, (page -1) * pageSize).slice(0, pageSize)
      
    }


   const updateStateParams = ({ page, pageSize } = {}) => {
        if (page && pageSize) {
            editPackage.page = page
            editPackage.pageSize = pageSize
        }
       // $state.transitionTo('cuiTable', editPackage.sortBy, { notify: false })
    }

   editPackage.sortBy = {}

	editPackage.cuiTableOptions = {
	paginate: true,
	recordCount: 0,
    pageSize: editPackage.pageSize,
    initialPage: editPackage.page,
	onPageChange: (page, pageSize) => {
	   updateStateParams({ page, pageSize })
	   populateAvailableUsers({ page, pageSize })
	}
}

editPackage.userCheckbox={};
editPackage.availableUserCheckbox={};
editPackage.selectedAdminUsers =[];


//To externalize  the values
	editPackage.options =[{"attributeName":"fullName" ,"attributeValue":"firstname ,lastname","key":1},
  {"attributeName":"id","attributeValue":"user id","key":2},{"attributeName":"number","attributeValue":"phone number","key":3},
  {"attributeName":"email","attributeValue":"email address","key":4}];
  editPackage.criterias = [{"criteriaName" :"beginsWith","criteriaValue": "begins with","key":1},
     {"criteriaName" :"contains","criteriaValue": "contains","key":2}];

	editPackage.showAdminPage=false
	editPackage.search.pageSize= 10;
	// editPackage.packageData={
	// 	displayable:true,
	// 	requiredApprovals:['organizationAdmin']
	// }
	// editPackage.requireCompanyAdmin=true;
	//-------------------------------------------------------Add Admin End

  editPackage.loadAddAdminPage =()=>{
  	editPackage.showAdminPage = true;
  	editPackage.intiateAdminPage();
  }
// HELPER FUNCTIONS START -------------------------------------------------------------------------------
	const initializeMultiLanguageFields = () => {
		angular.merge(editPackage.packageViewData,EditAndCreateApps.initializeMultilanguageData(true,false, editPackage.packageData))
		
		editPackage.serviceViewData =EditAndCreateApps.initializeMultilanguageData(true,false)

		editPackage.claimViewData=EditAndCreateApps.initializeMultilanguageData(true,true)
		editPackage.claimViewData.indicator='many'
		editPackage.claimViewData.claimValues=[]
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
  }



	const updateApprovalFlags = () => {
		editPackage.packageData.requiredApprovals.forEach(admin => {
			if (admin==='organizationAdmin') {
				editPackage.packageViewData.requireCompanyAdmin=true
			}
			else{
				editPackage.packageViewData.requireAppAdmin=true
			}
		})
	}

	const getClaimsDetails = () => {
		API.cui.getPackageClaims({qs:[['packageId',editPackage.packageData.id]]})
		.then(res => {
			editPackage.claims=res
			// Loader.offFor(scopeName+'claims')
			$scope.$digest()
		})
		.fail(err => {
			console.error('There was an error fetching claims', err)
			APIError.onFor(scopeName+'claims')
			// Loader.offFor(scopeName+'claims')
			$scope.$digest()
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

	const finishSubmitting = () => {
		Loader.offFor(scopeName+'submitting')		
		$scope.$digest()
	}

// HELPER FUNCTIONS START -------------------------------------------------------------------------------

// ON LOAD FUNCTIONS START -------------------------------------------------------------------------------
	EditAndCreateApps.initializeServiceTemplateData(editPackage)
	if (DataStorage.getType('EditPackage')) {
		editPackage.packageData=angular.copy(DataStorage.getType('EditPackage'))
		editPackage.services=editPackage.packageData.services
	};
	initializeRadioOptions()
	initializeMultiLanguageFields()
	getClaimsDetails()

// ON LOAD FUNCTIONS END -------------------------------------------------------------------------------


// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------
	editPackage.checkDuplicateLanguages = (data) => {
		return EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(data)
	}

	editPackage.indicatorChange = ( indicator ) => {
		if (indicator==="one"&&editPackage.claimViewData.claimValues && editPackage.claimViewData.claimValues.length>1) {
			editPackage.indicatorError=true
		}else{
			editPackage.indicatorError=false
			editPackage.indicatorErrorAddValue=false
		}
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
editPackage.select=()=>{
	console.log("ABDDDDDDDD");
	editPackage.userCheckbox;
}


editPackage.addUserAsAdmin =(user)=>{
  editPackage.selectedAdminUsers.push(user); 
  editPackage.selectedUserIds.push(user.id);

}
 editPackage.submitSelectedAdmin =()=>{
    //May use loop here to maintain order
    //Call The Api ..in Sucess Call back
      editPackage.userList=  editPackage.userList.concat(editPackage.selectedAdminUsers)
      editPackage.filterSelectedUsers(editPackage.availableUserList);
      editPackage.selectedAdminUsers.length = 0;
      editPackage.availableUserList.length = 0;
       delete editPackage.userCount;
      editPackage.showAdminPage = false;

 }

 editPackage.filterSelectedUsers=(availableUsers)=>{
  if(editPackage.selectedUserIds.length != 0){
    availableUsers = availableUsers.filter(function(availableUser){
    return editPackage.selectedUserIds.indexOf(availableUser.id) == -1;
  });
  }
  editPackage.availableUserList = availableUsers;
 
 }

 editPackage.callLocalApi=(apiPath)=>{
  $state.params;
  $stateParams.creationDate;
  $stateParams.pkgId;
  let  config = {headers:  {
        'Accept': 'application/vnd.com.covisint.platform.person.v1+json',
        'Content-Type':'application/vnd.com.covisint.platform.person.v1+json',
        'x-realm':'Q-IDMBLR-INST1',
        'x-requestor':'q-idmblr-inst1_admin',
        'x-requestor-app':'Superuser (Q-IDMBLR-INST1)',
        'Access-Control-Request-Headers': 'Origin, Content-Type, Accept',
        'Access-Control-Allow-Origin':'*'
    }
};
  let localUrl ='http://localhost:9090'
 // $httpProvider.defaults.useXDomain = true
  $http.get(localUrl+apiPath,config)
    .then(function(response) {
        //First function handles success
       //$ed.content = response.data;
       editPackage.userList= response.data;
    }, function(response) {
        //Second function handles error
       // $scope.content = "Something went wrong";
    });
 }

editPackage.deleteSelectedAdmins =()=>{
  if(editPackage.userCheckbox.length >0){
    //remove
  } else{
    alert("Please select  a user");
  }
}
editPackage.intiateAdminPage = () => {

    editPackage.search['organization.id'] =  User.user.organization.id
    editPackage.search.pageSize  = editPackage.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

   // Add another call yo get the Admin List for an organization
   editPackage.callLocalApi('/persons/admins/PQ-IDMBLR-INST13284177980');

        let apiCalls = [
             UserList.getUserCount({ qs: [['organization.id', editPackage.search['organization.id']]] }),
            UserList.getUsers({ qs: APIHelpers.getQs(editPackage.search) }),
       
           
        ]

        $q.all(apiCalls)
        .then(([ userCount,users]) => {
        	//susers = users.concat(editPackage.userList);
           editPackage.filterSelectedUsers(users);
           //editPackage.userCount = editPackage.availableUserList.length;
           editPackage.userCount= 40;
           editPackage.reRenderPagination && editPackage.reRenderPagination()
          // editPackage.cuiTableOptions.onPageChange(editPackage.page, editPackage.pageSize)
        })
        .catch(error => {
            APIError.onFor(scopeName + 'userList')
        })
        .finally(() => {
            Loader.offFor(scopeName + 'userList')
        })
        
        
    }


  editPackage.updateSearchParams = (page) => {
        if (page) editPackage.search.page = page 
        //$state.transitionTo('organization.directory.orgDetails', orgDetailsUsers.search, {notify: false})
        editPackage.intiateAdminPage();
    }


editPackage.searchUsers =()=>{
  let partialSearchValue=  editPackage.searchValue;
  if(editPackage.searchValue){
    if(!angular.equals(editPackage.selectedFilter.attributeName ,"fullName")){
        if(editPackage.selectedCriteria.key ==1){
          partialSearchValue = "%"+editPackage.searchValue;
        }  else{
             partialSearchValue = "%"+editPackage.searchValue+"%";
        }
    }
      editPackage.search[editPackage.selectedFilter.attributeName]=partialSearchValue;
     editPackage.intiateAdminPage();
  }
//else  message saying to give some input in search field
}




	editPackage.addClaimValue = (claim) => {
		claim.claimValues.push(editPackage.tempClaimValue)
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
// ******************Related to Service End***********************

		// **************************Claims Related**********************
	editPackage.goToClaims = () => {
		editPackage.step=2			
	}

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
		editPackage.claimViewData.claimValues=[]
		editPackage.claims.forEach( claim => claim.edit=false)
	}

	editPackage.deleteClaim =  (index) => {
		editPackage.claims.splice(index,1)
	}

	// ******************* Value related *****************
	editPackage.toggleEditValueForm = (selectedValue) => {
		selectedValue.edit=!selectedValue.edit
		editPackage.claimViewData.valueViewData = EditAndCreateApps.getValueViewData(selectedValue)
		editPackage.claimViewData.claimValues.forEach( value => {
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
		editPackage.claimViewData.claimValues&&editPackage.claimViewData.claimValues.forEach( value => value.edit=false)
	}

	// On clicking edit service Add/Update
	editPackage.saveValue = () => {
		if(EditAndCreateApps.checkDuplicateLanguagesForNameAndDesc(editPackage.claimViewData.valueViewData)){
			// toggleServiceFormFlags(editFlag)
			let selectedValue=EditAndCreateApps.buildValueData(editPackage.claimViewData.valueViewData)
			selectedValue.edit=false
			if (editPackage.claimViewData.valueViewData.edit) {
				selectedValue.id=editPackage.claimViewData.valueViewData.id
				 editPackage.claimViewData.claimValues.forEach(value => {
				 	if (value.id===selectedValue.id) {
				 		angular.copy(selectedValue,value)
				 	};
				 })
			}else{
				editPackage.claimViewData.addValueForm=false
				if (!editPackage.claimViewData.claimValues) {
					editPackage.claimViewData.claimValues=[]
				};
				selectedValue.id=editPackage.claimViewData.claimValues.length
				editPackage.claimViewData.claimValues.push(selectedValue)
			}
			
		}
	}
	editPackage.updateAddClaimValueForm = () => {
		if (editPackage.claimViewData.indicator==="one"&&editPackage.claimViewData.claimValues&&editPackage.claimViewData.claimValues.length===1) {
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
		if (editPackage.claimViewData.claimValues) {
			editPackage.claimViewData.claimValues.forEach(value => value.edit=false)
		};
	}

	editPackage.deleteClaimValue =  (index) => {
		editPackage.claimViewData.claimValues.splice(index,1)
		if (editPackage.indicatorError&&editPackage.claimViewData.claimValues.length<2) {
			editPackage.indicatorError=false
		};
	}

	editPackage.submit = () => {
		Loader.onFor(scopeName+'submitting')
		editPackage.packageSubmitData = EditAndCreateApps.buildPackageDataForUpdate(editPackage.packageViewData,editPackage.packageData)
		API.cui.updatePackage({packageId:$stateParams.pkgId,data:editPackage.packageSubmitData})
		.then( packageresult => {
			$timeout( () => {
				$state.go('administration.applications.manageApplications')
			},3000)
			Loader.offFor(scopeName+'submitting')
		})
		.fail(handleError)
	}


// ON CLICK FUNCTIONS END -------------------------------------------------------------------------------

// ERROR HANDLING FUNCTIONS START-------------------------------------------------------------------
	editPackage.customErrors = {
		duplicateValue:{
			duplicateValue:function(){
				return editPackage.claimViewData.claimValues.every( value => {
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