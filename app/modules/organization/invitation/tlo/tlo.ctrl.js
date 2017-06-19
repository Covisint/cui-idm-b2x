angular.module('organization')
.controller('tloCtrl', function(APIError, API, $scope, $state,$q,Base,$stateParams,User,$timeout) {

    const tlo = this
    tlo.sendInvitationError=''
    const promises=[]
    tlo.organization={}
    tlo.organization.name=User.user.organization.name
    tlo.stateParamsOrgId=User.user.organization.id
    //tlo.emailSubject='Register as a new organization'

    tlo.sendInvitation = () => {
      const promises=[]
      const validEmails=[]
      tlo.emailAddressError=false
      tlo.sendInvitationError=false
      var EMAIL_REGEXP = /^[a-z0-9!#$%&*?_.-]+@[a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+[.][a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+/i;
      tlo.emailArray=new Array()
      tlo.emailArray=tlo.emailAddress.split(',')      
      angular.forEach(tlo.emailArray,function(email){
        if(EMAIL_REGEXP.test(email)){
            validEmails.push(email)
          }
      })
      if(validEmails.length===tlo.emailArray.length){
        tlo.loader=true
        angular.forEach(tlo.emailArray,function(email){
          let opts = {
            "email":email,
            "invitor":{
              "id":User.user.id,
              "type":"person"
              },
            "targetOrganization":{
              "id":User.user.organization.id,
              "type":"organization"
              }
          }
          promises.push(API.cui.createOrgCompanyInvitation({data:opts})) 
        })
        
        $q.all(promises)
        .then((res) => {
          tlo.loader=false
          tlo.success=true
           tlo.sendInvitationError=false;
           $timeout(() => {
                 $state.go('invitation.inviteSelect');
            }, 3000); 
        })
        .catch(error => {
             tlo.loader=false
             tlo.sendInvitationError=true
        });
      }else{
         tlo.emailAddressError=true
      }
    }
})
