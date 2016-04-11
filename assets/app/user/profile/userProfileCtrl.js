angular.module('app')
.controller('userProfileCtrl',['$scope','$timeout','API','$cuiI18n','Timezones','UserService',
function($scope,$timeout,API,$cuiI18n,Timezones,UserService){
    'use strict';
    var userProfile = this;

    userProfile.loading = true;
    userProfile.saving = true;
    userProfile.fail = false;
    userProfile.success = false;
    userProfile.timezoneById = Timezones.timezoneById;
    userProfile.toggleOffFunctions = {};

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var resetTempUser = function() {
        if (!angular.equals(userProfile.tempUser,userProfile.user)) angular.copy(userProfile.user,userProfile.tempUser);
    };

    var build = {
        personPasswordAccount: function() {
            return {
                version: '1',
                username: userProfile.user.username,
                currentPassword: userProfile.userPasswordAccount.currentPassword,
                password: userProfile.userPasswordAccount.password,
                passwordPolicy: userProfile.organization.passwordPolicy,
                authenticationPolicy: userProfile.organization.authenticationPolicy
            };
        }
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    UserService.getProfile( {personId: API.getUser(), useCuid:true}).then(function(res){
        angular.copy( res, userProfile );
        userProfile.loading = false;
    },function(err){
        userProfile.loading = false;
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    userProfile.toggleAllOff=function(){
        angular.forEach(userProfile.toggleOffFunctions,function(toggleOff) {
            toggleOff();
        });
        resetTempUser();
    };

    userProfile.resetTempObject = function(master, temp) {
        // Used to reset the temp object to the original when a user cancels their edit changes
        if (!angular.equals(master,temp)) angular.copy(master, temp);
    };

    userProfile.resetPasswordFields = function() {
        // Used to set the password fields to empty when a user clicks cancel during password edit
        userProfile.userPasswordAccount = {
            currentPassword: '',
            password: ''
        };
        userProfile.passwordRe = '';
    };

    userProfile.checkIfRepeatedSecurityAnswer = function(securityQuestions,formObject) {
        securityQuestions.forEach(function(secQuestion,i){
            var securityAnswerRepeatedIndex=_.findIndex(securityQuestions,function(secQuestionToCompareTo,z){
                return z!==i && secQuestion.answer && secQuestionToCompareTo.answer && secQuestion.answer.toUpperCase()===secQuestionToCompareTo.answer.toUpperCase();
            });
            if(securityAnswerRepeatedIndex>-1) {
                if(formObject['answer'+securityAnswerRepeatedIndex]) formObject['answer'+securityAnswerRepeatedIndex].$setValidity('securityAnswerRepeated',false);
                if(formObject['answer'+i]) formObject['answer'+i].$setValidity('securityAnswerRepeated',false);
            }
            else {
                if(formObject['answer'+i]) formObject['answer'+i].$setValidity('securityAnswerRepeated',true);
            }
        });
    };

    userProfile.resetChallengeQuestion = function(index) {
        userProfile.resetTempObject(userProfile.userSecurityQuestions.questions[index], userProfile.tempUserSecurityQuestions[index]);
    };

    userProfile.pushToggleOff=function(toggleOffObject){
        userProfile.toggleOffFunctions[toggleOffObject.name]=toggleOffObject.function;
    };

    // ON CLICK END ----------------------------------------------------------------------------------

    // UPDATE FUNCTIONS START ------------------------------------------------------------------------

    userProfile.updatePerson = function(section,toggleOff) {
        if(section) userProfile[section]={
            submitting:true
        };
        if (!userProfile.userCountry) {
            userProfile.tempUser.addresses[0].country = userProfile.user.addresses[0].country;
        }
        else {
            userProfile.tempUser.addresses[0].country = userProfile.userCountry.description.code;
        }

        API.cui.updatePerson({ personId: API.getUser(), useCuid:true , data:userProfile.tempUser})
        .then(function() {
            angular.copy(userProfile.tempUser, userProfile.user);
            if(section) userProfile[section].submitting=false;
            if(toggleOff) toggleOff();
            $scope.$digest();
        })
        .fail(function(error) {
            console.log(error);
            if(section) userProfile[section].submitting=false;
            if(section) userProfile[section].error=true;
            $scope.$digest();
        });
    };

    userProfile.updatePassword = function(section,toggleOff) {
        if (section) {
            userProfile[section] = { submitting:true };
        }

        API.cui.updatePersonPassword({ personId: API.getUser(), data: build.personPasswordAccount() })
        .then(function(res) {
            if (section) userProfile[section].submitting = false;
            if (toggleOff) toggleOff();
            userProfile.resetPasswordFields();
            $scope.$digest();
        })
        .fail(function(err) {
            console.log(err);
            if (section) userProfile[section].submitting = false;
            if (section) userProfile[section].error = true;
            $scope.$digest();
        });
    };

   userProfile.saveChallengeQuestions = function(section,toggleOff) {
        if(section) userProfile[section]={
            submitting:true
        };
        userProfile.userSecurityQuestions.questions = angular.copy(userProfile.tempUserSecurityQuestions);
        UserService.selectTextsForQuestions(userProfile);

        API.cui.updateSecurityQuestionAccount({
          personId: API.getUser(),
          data: {
            version: '1',
            id: API.getUser(),
            questions: userProfile.userSecurityQuestions.questions
            }
        })
        .then(function(res) {
            if(section) userProfile[section].submitting=false;
            if(toggleOff) toggleOff();
            $scope.$digest();
        })
        .fail(function(err) {
            console.log(err);
            if(section) userProfile[section].submitting=false;
            if(section) userProfile[section].error=true;
            $scope.$digest();
        });
    };

    // UPDATE FUNCTIONS END --------------------------------------------------------------------------

}]);
