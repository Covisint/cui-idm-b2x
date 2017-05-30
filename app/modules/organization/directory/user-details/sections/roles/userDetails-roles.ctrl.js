angular.module('organization')
.controller('userDetailsRolesCtrl',function(API,$stateParams,$q,$scope,APIError,$timeout) {
	'use strict';

	const userDetailsRoles = this,
        userId = $stateParams.userId,
        organizationId = $stateParams.orgId;

    let apiPromises = [];

    userDetailsRoles.loading = true;

    // ON LOAD START ---------------------------------------------------------------------------------

    let init = function init(){

    apiPromises.push(
	    API.cui.getPersonRoles({personId: userId})
	    .then((res) => {
	    	userDetailsRoles.assignedRoles = res;
            API.cui.getPersonRolesGrantable({personId:userId})
            .then(res =>{
                userDetailsRoles.rolesGrantable=res;
            })
            .fail(err =>{
                userDetailsRoles.grantedHistoryError=true;
            })
	    })
    );

    apiPromises.push(
        API.cui.getPersonRolesGrantable({personId:userId})
        .then(res =>{
            userDetailsRoles.rolesGrantable=res;
        })
        .fail(err =>{
            userDetailsRoles.grantedHistoryError=true;
        })
    );

    $q.all(apiPromises)
    .then((res) => {
    	userDetailsRoles.loading = false;
        userDetailsRoles.success=false
    })
    .catch((error) => {
		userDetailsRoles.loading = false;
        userDetailsRoles.grantedHistoryError=true;
        userDetailsRoles.success=false
		console.log(error);
    });
}

     init();

    userDetailsRoles.assignRoles = () =>{
       let roles =[]
       angular.forEach(userDetailsRoles.appCheckbox,function(dsd,appId){
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
        
       userDetailsRoles.loading = true
        API.cui.assignPersonRoles({data:rolesSubmitData})
        .then(res =>{
            console.log(res)
            $scope.$digest()
            userDetailsRoles.success=true
             $timeout(() => {
                userDetailsRoles.loading = false

                init();
            }, 3000);
            
        })
        .fail(err =>{
            userDetailsRoles.loading=false
            APIError.onFor(scopeName + 'initHistory')
            userDetailsRoles.rolessubmitError=true
            $scope.$digest()
        })
    }

     $scope.$watch("userDetailsRoles.appCheckbox", function(n) {
       let count=0
       angular.forEach(userDetailsRoles.appCheckbox,function(dsd,key){
        console.log(key)
        if(dsd)
            count+=1
       })
       if(count>0){
        userDetailsRoles.appCheckboxValid=true
       }else{
        userDetailsRoles.appCheckboxValid=false
       }
    }, true);

    // ON LOAD END -----------------------------------------------------------------------------------

});
