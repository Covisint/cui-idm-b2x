angular.module('user')
.controller('userProfileCtrl', function(Loader, User, UserProfile, $scope) {

    const userProfile = this
    const scopeName = 'userProfile.'
    //$cuiIconProvider.iconSet('cui','node_modules/@covisint/cui-icons/dist/icons/icons-out.svg','0 0 48 48')
    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */

    //Error handler for email 
        userProfile.customErrors = {
      email: {
          email: function(){
              var EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ;
              if (userProfile.tempUser.email) {
                  return EMAIL_REGEXP.test(userProfile.tempUser.email)
              }else{
                  return true;
              }
          }
      }
    }
    /* -------------------------------------------- HELPER FUNCTIONS END --------------------------------------------- */
    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    userProfile.maskAnswers=true;
    userProfile.inputType = 'password';
    userProfile.updateUIMasking=function(){
         if(userProfile.maskAnswers){
            userProfile.inputType='password';
        }
        else{
            userProfile.inputType='text';
        }
    }
    
    UserProfile.injectUI(userProfile, $scope, User.user.id)

    Loader.onFor(scopeName + 'initProfile')

    UserProfile.initUserProfile(User.user.id, User.user.organization.id)
    .then(res => {
        angular.merge(userProfile, res)
        Loader.offFor(scopeName + 'initProfile')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
