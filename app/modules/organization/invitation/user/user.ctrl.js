angular.module('organization')
.controller('userCtrl', function(APIError, API, $scope, $state,$q,Base,$stateParams,User,$timeout,DataStorage) {

    const user = this
    user.sendInvitationError=''
    const promises=[]
    user.userSelectedOrg={}
    user.userSelectedOrg.originalObject={}
    user.userSelectedOrg.originalObject.name=User.user.organization.name
    user.userSelectedOrg.originalObject.id=User.user.organization.id
    user.stateParamsOrgId=User.user.organization.id
    //user.emailSubject='Register as a user to join '
    user.selectOrgFromList=false

    const storedData = DataStorage.getType('orgHierarchy',User.user.id)

    if (storedData) {
        user.organizationHierarchyRoot = storedData
        user.organizationHierarchy = storedData[0].children
        const organizationList=[]
        angular.forEach(user.organizationHierarchy,function(value){
          let array={
            "id":value.id,
            "name":value.name[0].text
          }
          organizationList.push(array)
        })
        user.organizationList=organizationList
    }else{
      user.loader=true
      API.cui.getOrganizationHierarchy({organizationId:User.user.organization.id })
        .done(res => {
            DataStorage.setType('orgHierarchy', [res],User.user.id)
            const organizationList=[]
            const storedDatas = DataStorage.getType('orgHierarchy',User.user.id)
            // Put hierarchy response in an array as the hierarchy directive expects an array
            user.organizationHierarchyRoot = storedDatas
            user.organizationHierarchy = storedDatas[0].children
            
            angular.forEach(user.organizationHierarchy,function(value){
              let array={
                "id":value.id,
                "name":value.name[0].text
              }
             
              organizationList.push(array)
            })
            user.organizationList=organizationList
        })
        .fail(err => {
            APIError.onFor(pageLoader, err)
        })
        .always(() => {
            user.loader=false
            $scope.$digest()
        })
    }

   
    user.customErrors = {
      email: {
          email: function(){
              var EMAIL_REGEXP = /^[a-z0-9!#$%&*?_.-]+@[a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+[.][a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+/i;
              if (user.email) {
                  return EMAIL_REGEXP.test(user.email)
              }else{
                  return true;
              }
          }
      }
    }

    user.sendInvitation = () => {
      const promises=[]
      const validEmails=[]
      user.emailAddressError=false
      user.sendInvitationError=false
      var EMAIL_REGEXP = /^[a-z0-9!#$%&*?_.-]+@[a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+[.][a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+/i;
      user.emailArray=new Array()
      user.emailArray=user.emailAddress.split(',')      
      angular.forEach(user.emailArray,function(email){
        if(EMAIL_REGEXP.test(email)){
            validEmails.push(email)
          }
      })
      if(validEmails.length===user.emailArray.length){
        user.loader=true
        angular.forEach(user.emailArray,function(email){
          let opts = {
            "email":email,
            "invitor":{
              "id":User.user.id,
              "type":"person"
              },
            "targetOrganization":{
              "id":user.userSelectedOrg.originalObject.id,
              "type":"organization"
              }
          }
          promises.push(API.cui.createPersonInvitation({data:opts})) 
        })
        
        $q.all(promises)
        .then((res) => {
          user.loader=false
          user.success=true
           user.sendInvitationError=false;
           $timeout(() => {
                 $state.go('invitation.inviteSelect');
            }, 3000); 
        })
        .catch(error => {
             user.loader=false
             user.sendInvitationError=true
        });
      }else{
         user.emailAddressError=true
      }
      
    }

    user.goToOrgPrfile = (org) => {
        user.userSelectedOrg.originalObject={}
        user.userSelectedOrg.originalObject.name=org.name[0].text
        user.userSelectedOrg.originalObject.id=org.id
        user.selectOrgFromList=false
        $scope.$digest()
    }

})
