angular.module('app')
.controller('usersEditCtrl',['$scope','$timeout','API',
function($scope,$timeout,API){
    'use strict';

    var usersEdit = this;
    var currentCountry;

    usersEdit.loading = true;
    usersEdit.timezones = $scope.$parent.base.timezones;
    usersEdit.tempLanguages = ['en', 'zh'];

    usersEdit.updatePerson = function() {
        // Updates user's Person object in IDM
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

    usersEdit.resetEdit = function(master, temp) {
        // Reset temporary variable to the master variable
        angular.copy(master, temp);
    };

    usersEdit.checkIfFieldsAreEmpty = function(field) {
        if (field === '') {
            usersEdit.emptyFieldError = true;
        }
        else {
            usersEdit.emptyFieldError = false;
        }
        return usersEdit.emptyFieldError;
    };

    usersEdit.updatePersonSecurityAccount = function() {
        // Updates user's Security Account in IDM
        // Currently API has issue when updating
    };

    var selectQuestionsForUser = function() {
        usersEdit.challengeQuestion1={};
        usersEdit.challengeQuestion1={}
        var questions = [];
        angular.forEach(usersEdit.userSecurityQuestions.questions, function(userQuestion){
            var question = _.find(usersEdit.allSecurityQuestions, function(question){return question.id === userQuestion.question.id});
            this.push(question);
        }, questions);

        console.log('questions',questions);
        usersEdit.challengeQuestion1 = questions[0];
        usersEdit.challengeQuestion1.answer = '';
        usersEdit.challengeQuestion2 = questions[1];
        usersEdit.challengeQuestion2.answer = '';
        $scope.$digest();
    };

    API.cui.getPerson({personId: API.getUser(), useCuid:true})
    .then(function(res) {
        // If the person has no addresses set we need to initialize it as an array
        // to follow the data structure
        if (!res.addresses) {
            res.addresses = [{}];
            res.addresses[0].streets = [[]];
        }
        usersEdit.user = angular.copy(res);
        usersEdit.tempUser = angular.copy(res);
        currentCountry = res.addresses[0].country;
        return API.cui.getSecurityQuestionAccount({ personId: API.getUser(), useCuid:true });
    })
    .then(function(res) {
        usersEdit.userSecurityQuestions = res;
        usersEdit.tempUserSecurityQuestions = res;
        return API.cui.getSecurityQuestions();
    })
    .then(function(res) {
        usersEdit.allSecurityQuestions = res;
        selectQuestionsForUser();
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

    usersEdit.saveChallengeQuestions = function() {
        var updatedChallengeQuestions = {};
        updatedChallengeQuestions = [{
            question: {
                text: usersEdit.challengeQuestion1.question[0].text,
                lang: usersEdit.challengeQuestion1.question[0].lang,
                answer:   usersEdit.challengeAnswer1,
                index: 1 },
            owner: {
                id: usersEdit.challengeQuestion1.owner.id }
            },{
            question: {
                text: usersEdit.challengeQuestion2.question[0].text,
                lang: usersEdit.challengeQuestion2.question[0].lang,
                answer:   usersEdit.challengeAnswer2,
                index: 2 },
            owner: {
                id: usersEdit.challengeQuestion1.owner.id }
            }
        ];

        usersEdit.saving = true;
        usersEdit.fail = false;
        usersEdit.success = false;

        API.cui.updateSecurityQuestions({
          personId: API.getUser(),
          data: {
            version: '1',
            id: API.getUser(),
            questions: updatedChallengeQuestions
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

    usersEdit.resetChallengeQuestion = function(question) {
        usersEdit['challengeAnswer' + question] = '';
        selectQuestionsForUser();
    };

    usersEdit.updatePassword = function() {
        usersEdit.loading = true;

        API.cui.updatePersonPassword({personId: usersEdit.user.id, data: usersEdit.userPasswordAccount})
        .then(function(res) {
            usersEdit.checkPasswordErrorFlag = 'Password Updated Successfully';
            usersEdit.loading = false;
            $scope.$digest();
        })
        .fail(function(err) {
            console.log(err);
            usersEdit.checkPasswordErrorFlag = err.responseJSON.api.message;
            usersEdit.loading = false;
            $scope.$digest();
        });
    };

    usersEdit.clearPasswords = function() {
        console.log(usersEdit.userPasswordAccount.password);
        usersEdit.userPasswordAccount.currentPassword = null;
        usersEdit.userPasswordAccount.password = null;
        usersEdit.passwordRe = null;
    };

}]);
