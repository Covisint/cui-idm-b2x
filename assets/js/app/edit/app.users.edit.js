angular.module('app')
.controller('usersEditCtrl',['localStorageService','$scope','$stateParams','$timeout','API',
function(localStorageService,$scope,$stateParams,$timeout,API){
    var usersEdit = this;
    usersEdit.loading = true;
    usersEdit.editName = false;
    usersEdit.editAddress = true;

    var initializeTempAddressValues = function(){
        usersEdit.tempStreetAddress = usersEdit.user.addresses[0].streets[0];
        usersEdit.tempAddress2 = usersEdit.user.addresses[0].streets[1];
        usersEdit.tempCity = usersEdit.user.addresses[0].city;
        usersEdit.tempZIP = usersEdit.user.addresses[0].postal;
        usersEdit.tempCountry = usersEdit.user.addresses[0].country;
    };

    var selectQuestionsForUser = function(questionsArray, allQuestions){
        var questionTexts = [];
        angular.forEach(questionsArray, function(value){
            var text = _.find(allQuestions, function(question){return question.id === value});
            this.push(text.question[0].text);
        }, questionTexts);

        usersEdit.user.challengeQuestion1 = questionTexts[0];
        usersEdit.user.challengeQuestion2 = questionTexts[1];
    };

    API.doAuth()
    .then(function(res) {
        return  API.cui.getPerson({personId: $stateParams.id});
    })
    .then(function(res) {
        usersEdit.user = res;
        initializeTempAddressValues();
        return API.cui.getSecurityQuestionAccount({personId: usersEdit.user.id})
    })
    .then(function(res){
        var codes = _.map(res.questions, function(n){return n.question.id});
        usersEdit.securityQuestionCodes = codes;
        $scope.$apply();
        return API.cui.getSecurityQuestions();
    })
    .then(function(res){
        var allSecurityQuestions = res;
        $scope.$apply();
        selectQuestionsForUser(usersEdit.securityQuestionCodes, allSecurityQuestions);
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

    usersEdit.saveFullName = function(){
        usersEdit.user.name.given = usersEdit.tempGiven; 
        usersEdit.user.name.surname = usersEdit.tempSurname; 
        usersEdit.editName = false;
    }

    usersEdit.resetTempAddress = function(){
        initializeTempAddressValues();
        usersEdit.editAddress = false;
    }

    usersEdit.saveAddress = function(){
        usersEdit.user.addresses[0].streets[0] = usersEdit.tempStreetAddress;
        usersEdit.user.addresses[0].streets[1] = usersEdit.tempAddress2;
        usersEdit.user.addresses[0].city = usersEdit.tempCity;
        usersEdit.user.addresses[0].postal = usersEdit.tempZIP;
        usersEdit.user.addresses[0].country = usersEdit.tempCountry;
        usersEdit.editAddress = false;
    }
}]);
