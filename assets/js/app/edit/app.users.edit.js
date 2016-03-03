angular.module('app')
.controller('usersEditCtrl',['localStorageService','$scope','$stateParams','$timeout','API',
function(localStorageService,$scope,$stateParams,$timeout,API){
    'use strict';

    var usersEdit = this;
    var currentCountry;
    
    usersEdit.tempUser = {};
    usersEdit.tempUserPasswordAccount = {};
    usersEdit.tempUserSecurityQuestions = {};
    usersEdit.loading = true;

    usersEdit.tempTimezones = ['CST6CDT', 'EST5EDT'];
    usersEdit.tempLanguages = ['en', 'zh'];

    usersEdit.updatePerson = function() {
        // Updates user's Person object in IDM
        usersEdit.loading = true;

        if (!usersEdit.tempUser.addresses[0].country) {
            // Set the person's country to what they selected
            usersEdit.tempUser.addresses[0].country = usersEdit.userCountry.description.code;    
        }
        else {
            usersEdit.tempUser.addresses[0].country = currentCountry;
        }

        usersEdit.user = usersEdit.tempUser;

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

    // var filterPhones = function(type) {
    //     var phones = usersEdit.user.phones;
    //     var filteredPhones = phones.filter(function (item) {
    //         return item.type === type;
    //     });
    //     if(filteredPhones.length > 0) {
    //         return filteredPhones[0].number;
    //     } else {
    //         return '';
    //     };
    // };

    API.doAuth()
    .then(function(res) {
        return  API.cui.getPerson({personId: $stateParams.id});
    })
    .then(function(res) {
        // If the person has no addresses set we need to initialize it as an array
        // to follow the data structure 
        if (!res.addresses) {
            res.addresses = [{}];
            res.addresses[0].streets = [[]];
        }
        usersEdit.user = res;
        usersEdit.tempUser = res;
        currentCountry = res.addresses[0].country;
        return API.cui.getSecurityQuestionAccount({personId: usersEdit.user.id})
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

    // usersEdit.save = function() {
    //     usersEdit.saving = true;
    //     usersEdit.fail = false;
    //     usersEdit.success = false;

    //     API.cui.updatePerson({personId:$stateParams.id,data:usersEdit.user})
    //     .then(function(res) {
    //         $timeout(function() {
    //             usersEdit.saving = false;
    //             usersEdit.success = true;
    //         }, 300);
    //     })
    //     .fail(function(err) {
    //         $timeout(function() {
    //             usersEdit.saving = false;
    //             usersEdit.fail = true;
    //         }, 300);
    //     });
    // };

    // usersEdit.saveFullName = function() {
    //     usersEdit.user.name.given = usersEdit.tempGiven; 
    //     usersEdit.user.name.surname = usersEdit.tempSurname; 
    //     usersEdit.save();
    // }

    // usersEdit.resetFullName = function() {
    //     usersEdit.tempGiven = usersEdit.user.name.given;
    //     usersEdit.tempSurname = usersEdit.user.name.surname;
    // }

    // usersEdit.resetTempAddress = function() {
    //     initializeTempAddressValues();
    // }

    // usersEdit.saveAddress = function(){
    //     usersEdit.user.addresses[0].streets[0] = usersEdit.tempStreetAddress;
    //     if (usersEdit.tempAddress2) {
    //         usersEdit.user.addresses[0].streets[1] = usersEdit.tempAddress2;
    //     } else if (usersEdit.user.addresses[0].streets[1]) {
    //         usersEdit.user.addresses[0].streets.splice(1, 1)
    //     }
    //     usersEdit.user.addresses[0].city = usersEdit.tempCity;
    //     usersEdit.user.addresses[0].postal = usersEdit.tempZIP;
    //     usersEdit.user.addresses[0].country = usersEdit.tempCountry;
    //     usersEdit.save();
    // }

    // usersEdit.updateTempCountry = function(results) {
    //     usersEdit.tempUser.addresses[0].country = results.description.name;
    // };

    // usersEdit.clearAdditionalPhone = function() {
    //     usersEdit.additionalPhoneType = '';
    //     usersEdit.additionalPhoneNumber = '';
    // }

    // usersEdit.savePhone = function() {
    //     usersEdit.user.phones = usersEdit.phones.slice();
    //     _.remove(usersEdit.user.phones, function(phone) {
    //       return phone.number == '';
    //     });
    //     usersEdit.save();
    // }

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
