angular.module('user')
.controller('userRolesCtrl', function(Loader, User, UserProfile, $scope, API, APIError, $timeout, $state) {
    'use strict';

    const userRoles = this
    const scopeName = 'userRoles.'
    userRoles.user=User.user
    userRoles.grantedHistoryError=false
    userRoles.getRolesDetailsError=false
    userRoles.appCheckbox={}

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function handleError(err) {
        userRoles.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    

    let init = function init(){
        userRoles.success=false
        Loader.onFor(scopeName + 'initHistory')
        API.cui.getPersonRolesOnly({personId:User.user.id})
        .then(res =>{
            userRoles.rolesDetails=res;
            initiGrantable();
        })
        .fail(err =>{
            Loader.offFor(scopeName + 'initHistory')
            APIError.onFor(scopeName + 'initHistory')
            userRoles.getRolesDetailsError=true
            initiGrantable();
        })
    };

    let initiGrantable = function initiGrantable(){
        API.cui.getPersonRolesGrantable({personId:User.user.id})
            .then(res =>{
                userRoles.rolesGrantable=res
                Loader.offFor(scopeName + 'initHistory')
                $scope.$digest()
            })
            .fail(err =>{
                Loader.offFor(scopeName + 'initHistory')
                APIError.onFor(scopeName + 'initHistory')
                userRoles.grantedHistoryError=true
                $scope.$digest()
            })
    };

    init();
    
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------
    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------
    userRoles.assignRoles = () =>{
       let roles =[]
       angular.forEach(userRoles.appCheckbox,function(dsd,appId){
       /*Object.keys(userRoles.appCheckbox).forEach(function(appId) {*/
           if(dsd){
                let test={
                "id":appId
               }
               roles.push(test)
           }
        });
        let rolesSubmitData={
        "userId": User.user.id,
        "roles": roles
        }
        console.log(rolesSubmitData)
        
       Loader.onFor(scopeName + 'initHistory')
        API.cui.assignPersonRoles({data:rolesSubmitData})
        .then(res =>{
            console.log(res)
            Loader.offFor(scopeName + 'initHistory')
            $scope.$digest()
            userRoles.success=true
             $timeout(() => {
                init();
            }, 3000);
            
        })
        .fail(err =>{
            Loader.offFor(scopeName + 'initHistory')
            APIError.onFor(scopeName + 'initHistory')
            userRoles.rolessubmitError=true
            $scope.$digest()
        })
    }
/*    userRoles.checkrequest = (roleId) =>{
        if (!userRoles.selectedCheckbox[roleId]) {
            userRoles.selectedCheckbox[roleId] = roleId
        } else {
            delete userRoles.selectedCheckbox[roleId]
        }
        if(Object.keys(userRoles.selectedCheckbox).length<0){
            
        }else{
            userRoles.appCheckboxValid=true
        }
    }*/
     $scope.$watch("userRoles.appCheckbox", function(n) {
       let count=0
       angular.forEach(userRoles.appCheckbox,function(dsd,key){
        console.log(key)
        if(dsd)
            count+=1
       })
       if(count>0){
        userRoles.appCheckboxValid=true
       }else{
        userRoles.appCheckboxValid=false
       }
    }, true);
    // ON CLICK END ----------------------------------------------------------------------------------
});

