angular.module('organization')
.controller('orgDetailsRolesCtrl',function(API,$stateParams,$q,$scope,APIError,$timeout) {
	'use strict';

	const orgDetailsRoles = this,
        userId = $stateParams.userId,
        organizationId = $stateParams.orgId;

    let apiPromises = [];

    orgDetailsRoles.loading = true;

    // ON LOAD START ---------------------------------------------------------------------------------

    let init = function init(){

    apiPromises.push(
	    API.cui.getPersonRoles({personId: userId})
	    .then((res) => {
	    	orgDetailsRoles.assignedRoles = res;
            API.cui.getPersonRolesGrantable({personId:userId})
            .then(res =>{
                orgDetailsRoles.rolesGrantable=res;
            })
            .fail(err =>{
                orgDetailsRoles.grantedHistoryError=true;
            })
	    })
    );

    apiPromises.push(
        API.cui.getPersonRolesGrantable({personId:userId})
        .then(res =>{
            orgDetailsRoles.rolesGrantable=res;
        })
        .fail(err =>{
            orgDetailsRoles.grantedHistoryError=true;
        })
    );

    $q.all(apiPromises)
    .then((res) => {
    	orgDetailsRoles.loading = false;
        orgDetailsRoles.success=false
    })
    .catch((error) => {
		orgDetailsRoles.loading = false;
        orgDetailsRoles.grantedHistoryError=true;
        orgDetailsRoles.success=false
		console.log(error);
    });
}

     init();

    orgDetailsRoles.assignRoles = () =>{
       let roles =[]
       angular.forEach(orgDetailsRoles.appCheckbox,function(dsd,appId){
       /*Object.keys(userRoles.appCheckbox).forEach(function(appId) {*/
           if(dsd){
                let test={
                "id":appId
               }
               roles.push(test)
           }
        });
        let rolesSubmitData={
        "userId": userId,
        "roles": roles
        }
        console.log(rolesSubmitData)
        
       orgDetailsRoles.loading = true
        API.cui.assignPersonRoles({data:rolesSubmitData})
        .then(res =>{
            console.log(res)
            $scope.$digest()
            orgDetailsRoles.success=true
             $timeout(() => {
                orgDetailsRoles.loading = false

                init();
            }, 3000);
            
        })
        .fail(err =>{
            orgDetailsRoles.loading=false
            APIError.onFor(scopeName + 'initHistory')
            orgDetailsRoles.rolessubmitError=true
            $scope.$digest()
        })
    }

     $scope.$watch("orgDetailsRoles.appCheckbox", function(n) {
       let count=0
       angular.forEach(orgDetailsRoles.appCheckbox,function(dsd,key){
        console.log(key)
        if(dsd)
            count+=1
       })
       if(count>0){
        orgDetailsRoles.appCheckboxValid=true
       }else{
        orgDetailsRoles.appCheckboxValid=false
       }
    }, true);

    // ON LOAD END -----------------------------------------------------------------------------------

});
