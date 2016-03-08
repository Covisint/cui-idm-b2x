angular.module('app')
.controller('usersEditCtrl',['localStorageService','$scope','$stateParams','$timeout','API',
function(localStorageService,$scope,$stateParams,$timeout,API){
    'use strict';

    var usersEdit = this;
    var currentCountry;
    var userId='RN3BJI54';

    usersEdit.loading = true;
    usersEdit.tempTimezones = ['CST6CDT', 'EST5EDT'];
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

        API.doAuth()
        .then(function() {
            return API.cui.updatePerson({personId: usersEdit.user.id, data:usersEdit.user});
        })
        .then(function() {
            usersEdit.loading = false;
        })
        .fail(function(error) {
            console.log(error);
            usersEdit.loading = false;
        });
    };

    usersEdit.resetEdit = function(master, temp) {
        // Reset temporary variable to the master variable
        angular.copy(master, temp);
    };

    usersEdit.updatePersonSecurityAccount = function() {
        // Updates user's Security Account in IDM
        // Currently API has issue when updating
    };

    var selectQuestionsForUser = function() {
        var questions = [];
        angular.forEach(usersEdit.userSecurityQuestions.questions, function(userQuestion){
            var question = _.find(usersEdit.allSecurityQuestions, function(question){return question.id === userQuestion.question.id});
            this.push(question);
        }, questions);

        usersEdit.challengeQuestion1 = questions[0];
        usersEdit.challengeQuestion1.answer = '';
        usersEdit.challengeQuestion2 = questions[1];
        usersEdit.challengeQuestion2.answer = '';
        $scope.$apply();
    };

    API.doAuth()
    .then(function(res) {
        return  API.cui.getPerson({personId: userId});
    })
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
        return API.cui.getSecurityQuestionAccount({personId: usersEdit.user.id});
    })
    .then(function(res) {
        usersEdit.userSecurityQuestions = res;
        usersEdit.tempUserSecurityQuestions = res;
        return API.cui.getSecurityQuestions();
    })
    .then(function(res) {
        usersEdit.allSecurityQuestions = res;
        selectQuestionsForUser();
        return API.cui.getPersonPassword({personId: usersEdit.user.id});
    })
    .then(function(res) {
        usersEdit.userPassword = res;
        usersEdit.tempUserPasswordAccount = res;
        $scope.$digest();
        usersEdit.loading = false;
    })
    .fail(function(err) {
        console.log(err);
        $scope.$digest();
        usersEdit.loading = false;
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
          personId: $stateParams.id,
          data: {
            version: '1',
            id: usersEdit.user.id,
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

}]);
