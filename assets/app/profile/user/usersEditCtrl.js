angular.module('app')
.controller('usersEditCtrl',['$scope','$timeout','API','$cuiI18n',
function($scope,$timeout,API,$cuiI18n){
    'use strict';

    var usersEdit = this;

    usersEdit.loading = true;
    usersEdit.saving = true;
    usersEdit.fail = false;
    usersEdit.success = false;

    usersEdit.timezones = $scope.$parent.base.timezones;
    usersEdit.languagePreference = $cuiI18n.getLocaleCodesAndNames();
    usersEdit.passwordPolicies = [
        {
            'allowUpperChars':true,
            'allowLowerChars':true,
            'allowNumChars':true,
            'allowSpecialChars':true,
            'requiredNumberOfCharClasses':3
        },
        {
            'disallowedChars':'^&*)(#$'
        },
        {
            'min':8,
            'max':18
        },
        {
            'disallowedWords':['password','admin']
        }
    ];

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var selectTextsForQuestions = function() {
        usersEdit.challengeQuestionsTexts=[];
        angular.forEach(usersEdit.userSecurityQuestions.questions, function(userQuestion){
            var question = _.find(usersEdit.allSecurityQuestionsDup, function(question){return question.id === userQuestion.question.id});
            this.push(question.question[0].text);
        }, usersEdit.challengeQuestionsTexts);
    };

    usersEdit.resetTempObject = function(master, temp) {
        // Used to reset the temp object to the original when a user cancels their edit changes
        angular.copy(master, temp);
    };

    usersEdit.resetChallengeQuestion = function(question) {
        usersEdit['challengeAnswer' + question] = '';
        selectQuestionsForUser();
    };

    usersEdit.resetPasswordFields = function() {
        // Used to set the password fields to empty when a user clicks cancel during password edit
        usersEdit.userPasswordAccount.currentPassword = '';
        usersEdit.userPasswordAccount.password = '';
        usersEdit.passwordRe = '';
    };

    usersEdit.checkIfFieldsAreEmpty = function(field) {
        if (field === undefined) {
            usersEdit.emptyFieldError = true;
        }
        else {
            usersEdit.emptyFieldError = false;
        }
        return usersEdit.emptyFieldError;
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
        usersEdit.user = angular.copy(res);
        usersEdit.tempUser = angular.copy(res);
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
        return API.cui.getPersonPassword({ personId: API.getUser(), useCuid:true });
    })
    .then(function(res) {
        usersEdit.userPasswordAccount = res;
        usersEdit.loading = false;
        $scope.$digest();
    })
    .fail(function(err) {
        console.log(err);
        usersEdit.loading = false;
        $scope.$digest();
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // UPDATE FUNCTIONS START ------------------------------------------------------------------------

    usersEdit.updatePerson = function() {
        usersEdit.loading = true;

        if (!usersEdit.userCountry) {
            usersEdit.tempUser.addresses[0].country = usersEdit.user.addresses[0].country;
        }
        else {
            usersEdit.tempUser.addresses[0].country = usersEdit.userCountry.description.code;
        }

        angular.copy(usersEdit.tempUser, usersEdit.user);

        API.cui.updatePerson({ personId: API.getUser(), useCuid:true , data:usersEdit.user})
        .then(function() {
            usersEdit.loading = false;
            $scope.$digest();
        })
        .fail(function(error) {
            usersEdit.loading = false;
            console.log(error);
            $scope.$digest();
        });
    };

    usersEdit.updatePassword = function() {
        usersEdit.loading = true;

        API.cui.updatePersonPassword({personId: API.getUser(), data: usersEdit.userPasswordAccount})
        .then(function(res) {
            usersEdit.checkPasswordErrorFlag = 'Password Updated Successfully';
            usersEdit.loading = false;
            usersEdit.resetPasswordFields();
            $scope.$digest();
        })
        .fail(function(err) {
            console.log(err);
            usersEdit.checkPasswordErrorFlag = err.responseJSON.apiStatusCode;
            usersEdit.resetPasswordFields();
            usersEdit.loading = false;
            $scope.$digest();
        });
    };

    usersEdit.updatePersonSecurityAccount = function() {
        // Updates user's Security Account in IDM
        // Currently API has issue when updating
    };

   usersEdit.saveChallengeQuestions = function() {
        usersEdit.userSecurityQuestions.questions = angular.copy(usersEdit.tempUserSecurityQuestions);
        selectTextsForQuestions();

        usersEdit.saving = true;
        usersEdit.fail = false;
        usersEdit.success = false;

        API.cui.updateSecurityQuestionAccount({
          personId: API.getUser(),
          data: {
            version: '1',
            id: API.getUser(),
            questions: usersEdit.userSecurityQuestions.questions
            }
        })
        .then(function(res) {
            $timeout(function() {
                usersEdit.saving = false;
                usersEdit.success = true;
            }, 300);
        })
        .fail(function(err) {
            $timeout(function() {
                usersEdit.saving = false;
                usersEdit.fail = true;
            }, 300);
        });
    };

    usersEdit.resetChallengeQuestion = function() {
        usersEdit.tempUserSecurityQuestions = angular.copy(usersEdit.userSecurityQuestions.questions);
    };
    // UPDATE FUNCTIONS END --------------------------------------------------------------------------

}]);
