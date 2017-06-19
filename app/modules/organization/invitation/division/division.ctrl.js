angular.module('organization')
.controller('divisionCtrl', function(APIError, API, $scope, $state,$q,Base,$stateParams,User,$timeout,DataStorage) {

    const division = this
    division.sendInvitationError=''
    const promises=[]
    division.userSelectedOrg={}
    division.userSelectedOrg.originalObject={}
    division.userSelectedOrg.originalObject.name=User.user.organization.name
    division.userSelectedOrg.originalObject.id=User.user.organization.id
    division.stateParamsOrgId=User.user.organization.id
    //division.emailSubject='Register as an adminstrator within '

    const storedData = DataStorage.getType('orgHierarchy',User.user.id)

    if (storedData) {
        division.organizationHierarchyRoot = storedData
        division.organizationHierarchy = storedData[0].children
        const organizationList=[]
        angular.forEach(division.organizationHierarchy,function(value){
          let array={
            "id":value.id,
            "name":value.name[0].text
          }
          organizationList.push(array)
        })
        division.organizationList=organizationList
    }else{
      division.loader=true
      API.cui.getOrganizationHierarchy({organizationId:User.user.organization.id })
      .done(res => {
          DataStorage.setType('orgHierarchy', [res],User.user.id)
          const organizationList=[]
          // Put hierarchy response in an array as the hierarchy directive expects an array
          const storedDatas = DataStorage.getType('orgHierarchy',User.user.id)
          division.organizationHierarchyRoot = storedDatas
          division.organizationHierarchy = storedDatas[0].children
          
          angular.forEach(division.organizationHierarchy,function(value){
            let array={
              "id":value.id,
              "name":value.name[0].text
            }
           
            organizationList.push(array)
          })
          division.organizationList=organizationList
          console.log(division.organizationList)
         
      })
      .fail(err => {
          APIError.onFor(pageLoader, err)
      })
      .always(() => {
          division.loader=false
          $scope.$digest()
      })
  }


    division.sendInvitation = () => {
           const promises=[]
      const validEmails=[]
      division.emailAddressError=false
      division.sendInvitationError=false
      var EMAIL_REGEXP = /^[a-z0-9!#$%&*?_.-]+@[a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+[.][a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+/i;
      division.emailArray=new Array()
      division.emailArray=division.emailAddress.split(',')      
      angular.forEach(division.emailArray,function(email){
        if(EMAIL_REGEXP.test(email)){
            validEmails.push(email)
          }
      })
      if(validEmails.length===division.emailArray.length){
        division.loader=true
        angular.forEach(division.emailArray,function(email){
          let opts = {
            "email":email,
            "invitor":{
              "id":User.user.id,
              "type":"person"
              },
            "targetOrganization":{
              "id":division.userSelectedOrg.originalObject.id,
              "type":"organization"
              }
          }
          promises.push(API.cui.createOrgDivisionInvitation({data:opts})) 
        })
        
        $q.all(promises)
        .then((res) => {
          division.loader=false
          division.success=true
           division.sendInvitationError=false;
           $timeout(() => {
                 $state.go('invitation.inviteSelect');
            }, 3000); 
        })
        .catch(error => {
             division.loader=false
             division.sendInvitationError=true
        });
      }else{
         division.emailAddressError=true
      }
    }
    division.goToOrgPrfile = (org) => {
        division.userSelectedOrg.originalObject={}
        division.userSelectedOrg.originalObject.name=org.name[0].text
        division.userSelectedOrg.originalObject.id=org.id
        division.selectOrgFromList=false
        $scope.$digest()
    }
     division.goToOrg = () => {
        
    }
})
