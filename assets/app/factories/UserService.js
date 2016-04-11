angular.module('app')
    .factory('UserService',['$rootScope','$q','API','CuiPasswordPolicies', function($rootScope,$q,API,CuiPasswordPolicies) {
    'use strict';

        var self = {
            getProfile : function(userCredentials){

                var defer = $q.defer();
                var userProfile = {};

                API.cui.getPerson(userCredentials)
                    .then(function(res) {
                        if (!res.addresses) {
                            // If the person has no addresses set we need to initialize it as an array
                            // to follow the object structure
                            res.addresses = [{}];
                            res.addresses[0].streets = [[]];
                        }
                        userProfile.user = {};
                        userProfile.tempUser = {};
                        angular.copy(res, userProfile.user);
                        angular.copy(res, userProfile.tempUser);
                        return API.cui.getSecurityQuestionAccount({ personId: API.getUser(), useCuid:true });
                    })
                    .then(function(res) {
                        userProfile.userSecurityQuestions = res;
                        userProfile.tempUserSecurityQuestions = angular.copy(userProfile.userSecurityQuestions.questions);
                        return API.cui.getSecurityQuestions();
                    })
                    .then(function(res) {
                        userProfile.allSecurityQuestions = res;
                        userProfile.allSecurityQuestionsDup = angular.copy(res);
                        userProfile.allSecurityQuestions.splice(0,1);

                        // Splits questions to use between both dropdowns
                        var numberOfQuestions = userProfile.allSecurityQuestions.length,
                            numberOfQuestionsFloor = Math.floor(numberOfQuestions/3);
                        //Allocating options to three questions
                        userProfile.allChallengeQuestions0 = userProfile.allSecurityQuestions.splice(0,numberOfQuestionsFloor);
                        userProfile.allChallengeQuestions1 = userProfile.allSecurityQuestions.splice(0,numberOfQuestionsFloor);
                        userProfile.allChallengeQuestions2 = userProfile.allSecurityQuestions.splice(0,numberOfQuestionsFloor);

                        self.selectTextsForQuestions(userProfile);

                        return API.cui.getOrganization({organizationId:userProfile.user.organization.id});
                    })
                    .then(function(res) {

                        userProfile.organization = res;
                        return API.cui.getPasswordPolicy({policyId: res.passwordPolicy.id});
                    })
                    .then(function(res) {
                        CuiPasswordPolicies.set(res.rules);
                        defer.resolve( userProfile );
                    })
                    .fail(function(err) {
                        console.error("UserService.getProfile",err);
                        defer.reject( err );
                    });

                return defer.promise;
            },
            // HELPER FUNCTIONS START ------------------------------------------------------------------------
            selectTextsForQuestions : function(userProfile) {
                userProfile.challengeQuestionsTexts = [];
                angular.forEach(userProfile.userSecurityQuestions.questions, function(userQuestion) {
                    var question = _.find(userProfile.allSecurityQuestionsDup, function(question){return question.id === userQuestion.question.id});
                    this.push(question.question[0].text);
                }, userProfile.challengeQuestionsTexts);
            }
        };

        return self;
    }]);