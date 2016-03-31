angular.module('app')
.controller('usersEditCtrl',['$scope','$timeout','API','$cuiI18n','Timezones','CuiPasswordPolicies',
function($scope,$timeout,API,$cuiI18n,Timezones,CuiPasswordPolicies){
    'use strict';
    var usersEdit = this;

    usersEdit.loading = true;
    usersEdit.saving = true;
    usersEdit.fail = false;
    usersEdit.success = false;
    usersEdit.timezoneById = Timezones.timezoneById;
    usersEdit.toggleOffFunctions = {};

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var selectTextsForQuestions = function() {
        usersEdit.challengeQuestionsTexts = [];
        angular.forEach(usersEdit.userSecurityQuestions.questions, function(userQuestion) {
            var question = _.find(usersEdit.allSecurityQuestionsDup, function(question){return question.id === userQuestion.question.id});
            this.push(question.question[0].text);
        }, usersEdit.challengeQuestionsTexts);
    };

    var resetTempUser = function() {
        if (!angular.equals(usersEdit.tempUser,usersEdit.user)) angular.copy(usersEdit.user,usersEdit.tempUser);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    API.cui.getPerson({personId: API.getUser(), useCuid:true})
    .then(function(res) {
        if (!res.addresses) {
            // If the person has no addresses set we need to initialize it as an array
            // to follow the object structure
            res.addresses = [{}];
            res.addresses[0].streets = [[]];
        }
        usersEdit.user={};
        usersEdit.tempUser={};
        angular.copy(res,usersEdit.user);
        angular.copy(res,usersEdit.tempUser);
        return API.cui.getSecurityQuestionAccount({ personId: API.getUser(), useCuid:true });
    })
    .then(function(res) {
        usersEdit.userSecurityQuestions = res;
        usersEdit.tempUserSecurityQuestions = angular.copy(usersEdit.userSecurityQuestions.questions);
        return API.cui.getSecurityQuestions();
    })
    .then(function(res) {
        usersEdit.allSecurityQuestions = res;
        usersEdit.allSecurityQuestionsDup = angular.copy(res);
        usersEdit.allSecurityQuestions.splice(0,1);

        // Splits questions to use between both dropdowns
        var numberOfQuestions = usersEdit.allSecurityQuestions.length,
        numberOfQuestionsFloor = Math.floor(numberOfQuestions/3);
        //Allocating options to three questions
        usersEdit.allChallengeQuestions0 = usersEdit.allSecurityQuestions.splice(0,numberOfQuestionsFloor);
        usersEdit.allChallengeQuestions1 = usersEdit.allSecurityQuestions.splice(0,numberOfQuestionsFloor);
        usersEdit.allChallengeQuestions2 = usersEdit.allSecurityQuestions.splice(0,numberOfQuestionsFloor);

        selectTextsForQuestions();
        return API.cui.getOrganization({organizationId:usersEdit.user.organization.id})
    })
    .then(function(res){
        return API.cui.getPasswordPolicy({policyId: res.passwordPolicy.id});
    })
    .then(function(res) {
        CuiPasswordPolicies.set(res.rules);
        usersEdit.loading = false;
        $scope.$digest();
    })
    .fail(function(err) {
        console.log(err);
        usersEdit.loading = false;
        $scope.$digest();
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    usersEdit.toggleAllOff=function(){
        angular.forEach(usersEdit.toggleOffFunctions,function(toggleOff) {
            toggleOff();
        });
        resetTempUser();
    };

    usersEdit.resetTempObject = function(master, temp) {
        // Used to reset the temp object to the original when a user cancels their edit changes
        if (!angular.equals(master,temp)) angular.copy(master, temp);
    };

    usersEdit.resetPasswordFields = function() {
        // Used to set the password fields to empty when a user clicks cancel during password edit
        usersEdit.userPasswordAccount={
            currentPassword:'',
            password:''
        };
        usersEdit.passwordRe = '';
    };

    usersEdit.checkIfRepeatedSecurityAnswer = function(securityQuestions,formObject) {
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

    usersEdit.resetChallengeQuestion = function(index) {
        usersEdit.resetTempObject(usersEdit.userSecurityQuestions.questions[index], usersEdit.tempUserSecurityQuestions[index]);
    };

    usersEdit.pushToggleOff=function(toggleOffObject){
        usersEdit.toggleOffFunctions[toggleOffObject.name]=toggleOffObject.function;
    };

    // ON CLICK END ----------------------------------------------------------------------------------

    // UPDATE FUNCTIONS START ------------------------------------------------------------------------

    usersEdit.updatePerson = function(section,toggleOff) {
        if(angular.equals(usersEdit.tempUser, usersEdit.user)){
            if(toggleOff) toggleOff();
            return;
        }
        if(section) usersEdit[section]={
            submitting:true
        };
        if (!usersEdit.userCountry) {
            usersEdit.tempUser.addresses[0].country = usersEdit.user.addresses[0].country;
        }
        else {
            usersEdit.tempUser.addresses[0].country = usersEdit.userCountry.description.code;
        }

        API.cui.updatePerson({ personId: API.getUser(), useCuid:true , data:usersEdit.tempUser})
        .then(function() {
            angular.copy(usersEdit.tempUser, usersEdit.user);
            if(section) usersEdit[section].submitting=false;
            if(toggleOff) toggleOff();
            $scope.$digest();
        })
        .fail(function(error) {
            console.log(error);
            if(section) usersEdit[section].submitting=false;
            if(section) usersEdit[section].error=true;
            $scope.$digest();
        });
    };

    usersEdit.updatePassword = function(section,toggleOff) {
        if(section) usersEdit[section]={
            submitting:true
        };

        API.cui.updatePersonPassword({personId: API.getUser(), data: usersEdit.userPasswordAccount})
        .then(function(res) {
            if(section) usersEdit[section].submitting=false;
            if(toggleOff) toggleOff();
            usersEdit.resetPasswordFields();
            $scope.$digest();
        })
        .fail(function(err) {
            console.log(err);
            if(section) usersEdit[section].submitting=false;
            if(section) usersEdit[section].error=true;
            $scope.$digest();
        });
    };

   usersEdit.saveChallengeQuestions = function(section,toggleOff) {
        if(section) usersEdit[section]={
            submitting:true
        };
        usersEdit.userSecurityQuestions.questions = angular.copy(usersEdit.tempUserSecurityQuestions);
        selectTextsForQuestions();

        API.cui.updateSecurityQuestionAccount({
          personId: API.getUser(),
          data: {
            version: '1',
            id: API.getUser(),
            questions: usersEdit.userSecurityQuestions.questions
            }
        })
        .then(function(res) {
            if(section) usersEdit[section].submitting=false;
            if(toggleOff) toggleOff();
            $scope.$digest();
        })
        .fail(function(err) {
            console.log(err);
            if(section) usersEdit[section].submitting=false;
            if(section) usersEdit[section].error=true;
            $scope.$digest();
        });
    };

    // UPDATE FUNCTIONS END --------------------------------------------------------------------------

}]);
