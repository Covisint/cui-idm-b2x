angular.module('user')
.controller('userProfileCtrl', function(Loader, User, UserProfile, $scope) {

    const userProfile = this
    const scopeName = 'userProfile.'
    //$cuiIconProvider.iconSet('cui','node_modules/@covisint/cui-icons/dist/icons/icons-out.svg','0 0 48 48')
    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */

    //Error handler for email inline Edit tag
    //Commenting out Inline Editing changes as they might not needed
    // userProfile.email=function(value){
    //     let EMAIL_REGXP=/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/i
    //     if (!angular.isDefined(value)) {
    //         userProfile.emailError={};
    //     }else{
    //         userProfile.emailError={
    //             required: value==="" || !value,
    //             email:!EMAIL_REGXP.test(value)
    //         }
    //     }
    //     userProfile.noSaveEmail= value==="" || !value || !EMAIL_REGXP.test(value)
    // }
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
