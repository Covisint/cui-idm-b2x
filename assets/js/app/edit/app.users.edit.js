angular.module('app')
.controller('usersEditCtrl',['localStorageService','$scope','$stateParams','$timeout','API',
function(localStorageService,$scope,$stateParams,$timeout,API){
    var usersEdit = this;
    usersEdit.loading = true;
    usersEdit.tempTimezones = ['AKST1AKDT', 'PST2PDT', 'MST3MDT', 'CST4CDT', 'EST5EDT'];
    usersEdit.tempLanguages = ['en', 'pl', 'zh', 'pt'];

    var initializeFullNameTemp = function() {
        usersEdit.tempGiven = usersEdit.user.name.given;
        usersEdit.tempSurname = usersEdit.user.name.surname
    };

    var initializeTempAddressValues = function(){
        usersEdit.tempStreetAddress = usersEdit.user.addresses[0].streets[0];
        usersEdit.tempAddress2 = usersEdit.user.addresses[0].streets[1];
        usersEdit.tempCity = usersEdit.user.addresses[0].city;
        usersEdit.tempZIP = usersEdit.user.addresses[0].postal;
        usersEdit.tempCountry = usersEdit.user.addresses[0].country;
    };

    var selectQuestionsForUser = function(){
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

    var initializePhones = function() {
        usersEdit.phoneTypes = ['main', 'mobile', 'fax'];
        usersEdit.phones = []
        angular.forEach(usersEdit.phoneTypes, function(type) {
            var phoneObject = {type: type, number: filterPhones(type)}
            usersEdit.phones.push(phoneObject);
        });
    };

    var filterPhones = function(type) {
        var phones = usersEdit.user.phones;
        var filteredPhones = phones.filter(function (item) {
            return item.type === type;
        });
        if(filteredPhones.length > 0) {
            return filteredPhones[0].number;
        } else {
            return '';
        };
    }

    API.doAuth()
    .then(function(res) {
        return  API.cui.getPerson({personId: $stateParams.id});
    })
    .then(function(res) {
        usersEdit.user = res;
        initializeTempAddressValues();
        initializeFullNameTemp();
        initializePhones();
        return API.cui.getSecurityQuestionAccount({personId: usersEdit.user.id})
    })
    .then(function(res){
        usersEdit.userSecurityQuestions = res;
        $scope.$apply();
        return API.cui.getSecurityQuestions();
    })
    .then(function(res){
        usersEdit.allSecurityQuestions = res;
        selectQuestionsForUser();
        $scope.$apply();
        return API.cui.getPersonPassword({personId: usersEdit.user.id});
    })
    .then(function(res) {
        usersEdit.userPassword = res;
        $scope.$apply();
        usersEdit.loading = false;
    })
    .fail(function(err) {
        $scope.$apply();
        usersEdit.loading = false;
    });

    usersEdit.save = function() {
        usersEdit.saving = true;
        usersEdit.fail = false;
        usersEdit.success = false;

        API.cui.updatePerson({personId:$stateParams.id,data:usersEdit.user})
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

    usersEdit.saveFullName = function() {
        usersEdit.user.name.given = usersEdit.tempGiven; 
        usersEdit.user.name.surname = usersEdit.tempSurname; 
        usersEdit.save();
    }

    usersEdit.resetFullName = function() {
        usersEdit.tempGiven = usersEdit.user.name.given;
        usersEdit.tempSurname = usersEdit.user.name.surname;
    }

    usersEdit.resetTempAddress = function() {
        initializeTempAddressValues();
    }

    usersEdit.saveAddress = function(){
        usersEdit.user.addresses[0].streets[0] = usersEdit.tempStreetAddress;
        if (usersEdit.tempAddress2) {
            usersEdit.user.addresses[0].streets[1] = usersEdit.tempAddress2;
        } else if (usersEdit.user.addresses[0].streets[1]) {
            usersEdit.user.addresses[0].streets.splice(1, 1)
        }
        usersEdit.user.addresses[0].city = usersEdit.tempCity;
        usersEdit.user.addresses[0].postal = usersEdit.tempZIP;
        usersEdit.user.addresses[0].country = usersEdit.tempCountry;
        usersEdit.save();
    }

    usersEdit.updateTempCountry = function(results) {
        usersEdit.tempCountry = results.description.name;
    }

    usersEdit.clearAdditionalPhone = function() {
        usersEdit.additionalPhoneType = '';
        usersEdit.additionalPhoneNumber = '';
    }

    usersEdit.savePhone = function() {
        usersEdit.user.phones = usersEdit.phones.slice();
        _.remove(usersEdit.user.phones, function(phone) {
          return phone.number == '';
        });
        usersEdit.save();
    }

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
    }

    usersEdit.resetChallengeQuestion = function(question) {
        usersEdit['challengeAnswer' + question] = '';
        selectQuestionsForUser();
    }
}]);
