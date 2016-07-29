angular.module('common')
.factory('UserProfile', function(API,$q,$timeout) {

        var self = {
            getProfile: function(userCredentials) {
                var defer = $q.defer(),
                    userProfile = {};

                API.cui.getPerson(userCredentials)
                .then(function(res) {
                    if (!res.addresses) {
                        // If the person has no addresses set we need to initialize it as an array
                        // to follow the object structure
                        res.addresses = [{}];
                    }
                    if (!res.addresses[0].streets) {
                        res.addresses[0].streets = [];
                    }
                    userProfile.user = {};
                    userProfile.tempUser = {};
                    angular.copy(res, userProfile.user);
                    angular.copy(res, userProfile.tempUser);
                    return API.cui.getSecurityQuestionAccount(userCredentials);
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
                        userProfile.passwordRules = res.rules;
                        defer.resolve( userProfile );
                    })
                    .fail(function(err) {
                        console.error('UserProfile.factory error: ', err);
                        defer.reject(err);
                    });

                return defer.promise;
            },

            selectTextsForQuestions: function(userProfile) {
                userProfile.challengeQuestionsTexts = [];
                angular.forEach(userProfile.userSecurityQuestions.questions, function(userQuestion) {
                    var question = _.find(userProfile.allSecurityQuestionsDup, function(question) {
                        return question.id === userQuestion.question.id;
                    });
                    this.push(question.question[0].text);
                }, userProfile.challengeQuestionsTexts);
            },

            resetTempUser: function(userProfile) {
                if (!angular.equals(userProfile.tempUser,userProfile.user)) {
                    angular.copy(userProfile.user,userProfile.tempUser);
                }
            },

            getPersonPasswordAccount: function(userProfile) {
                return {
                    version: '1',
                    username: userProfile.user.username,
                    currentPassword: userProfile.userPasswordAccount.currentPassword,
                    password: userProfile.userPasswordAccount.password,
                    passwordPolicy: userProfile.organization.passwordPolicy,
                    authenticationPolicy: userProfile.organization.authenticationPolicy
                };
            },

            injectUI: function(userProfile, $scope, personId) {
                let userId
                personId ? userId = personId : userId = API.getUser()

                userProfile.toggleAllOff = function() {
                    angular.forEach(userProfile.toggleOffFunctions, function(toggleOff) {
                        toggleOff();
                    });
                    self.resetTempUser(userProfile);
                };

                userProfile.resetTempObject = function(master, temp) {
                    // Used to reset the temp object to the original when a user cancels their edit changes
                    if (!angular.equals(master, temp)) {
                        angular.copy(master, temp);
                    }
                };

                userProfile.resetPasswordFields = function() {
                    // Used to set the password fields to empty when a user clicks cancel during password edit
                    userProfile.userPasswordAccount = {
                        currentPassword: '',
                        password: ''
                    };
                    userProfile.passwordRe = '';
                };

                userProfile.checkIfRepeatedSecurityAnswer = function(securityQuestions, formObject) {
                    securityQuestions.forEach(function(secQuestion, i) {
                        var securityAnswerRepeatedIndex = _.findIndex(securityQuestions, function(secQuestionToCompareTo,z) {
                            return z !== i && secQuestion.answer && secQuestionToCompareTo.answer && secQuestion.answer.toUpperCase() === secQuestionToCompareTo.answer.toUpperCase();
                        });
                        if (securityAnswerRepeatedIndex > -1) {
                            if (formObject['answer' + securityAnswerRepeatedIndex]) {
                                formObject['answer' + securityAnswerRepeatedIndex].$setValidity('securityAnswerRepeated', false);
                            }
                            if(formObject['answer' + i]) {
                                formObject['answer' + i].$setValidity('securityAnswerRepeated', false);
                            }
                        }
                        else {
                            if (formObject['answer' + i]) {
                                formObject['answer'+i].$setValidity('securityAnswerRepeated', true);
                            }
                        }
                    });
                };

                userProfile.resetChallengeQuestion = function(index) {
                    userProfile.resetTempObject(userProfile.userSecurityQuestions.questions[index], userProfile.tempUserSecurityQuestions[index]);
                };

                userProfile.pushToggleOff = function(toggleOffObject) {
                    if (!userProfile.toggleOffFunctions) {
                        userProfile.toggleOffFunctions = {};
                    }
                    userProfile.toggleOffFunctions[toggleOffObject.name] = toggleOffObject.function;
                };

                userProfile.updatePerson = function(section, toggleOff) {
                    if (section) {
                        userProfile[section] = {
                            submitting:true
                        };
                    }
                    if (!userProfile.userCountry) {
                        userProfile.tempUser.addresses[0].country = userProfile.user.addresses[0].country;
                    }
                    else {
                        userProfile.tempUser.addresses[0].country = userProfile.userCountry.originalObject.code;
                    }

                    // [7/20/2016] Note: Can't pass in 'activatedDate' anymore when updating a person
                    delete userProfile.tempUser['activatedDate']

                    API.cui.updatePerson({personId: userId, data:userProfile.tempUser})
                    .done(() => {
                        angular.copy(userProfile.tempUser, userProfile.user);
                        LocaleService.setLocaleByDisplayName(appConfig.languages[userProfile.user.language])
                        if (toggleOff) toggleOff()
                    })
                    .fail((err) => {
                        console.error('Failed to update user profile:', err)
                        if (section) userProfile[section].error = true
                    })
                    .always(() => {
                        if (section) userProfile[section].submitting = false
                        $scope.$digest()
                    })
                };

                userProfile.updatePassword = function(section, toggleOff) {
                    if (section) {
                        userProfile[section] = { submitting:true };
                    }

                    API.cui.updatePersonPassword({personId: userId, data: self.getPersonPasswordAccount(userProfile)})
                    .always(() => {
                        if (section) {
                            userProfile[section].submitting = false;
                        }
                    })
                    .done(() => {
                        if (toggleOff) {
                            toggleOff();
                        }
                        userProfile.passwordUpdateSuccess = true;
                        $timeout(() => {
                            userProfile.passwordUpdateSuccess = false;
                        }, 5000);
                        userProfile.resetPasswordFields();
                        $scope.$digest();
                    })
                    .fail((err) => {
                        console.error('Error updating password', err);
                        if (section) {
                            userProfile[section].error = true;
                        }
                        $scope.$digest();
                    })
                };

                userProfile.saveChallengeQuestions = function(section, toggleOff) {
                    if(section) {
                        userProfile[section] = {
                        submitting:true
                    };

                    userProfile.userSecurityQuestions.questions = angular.copy(userProfile.tempUserSecurityQuestions);
                    self.selectTextsForQuestions(userProfile);

                    API.cui.updateSecurityQuestionAccount({personId: userId,
                        data: {
                            version: '1',
                            id: API.getUser(),
                            questions: userProfile.userSecurityQuestions.questions
                        }
                    })
                    .then(function(res) {
                        if (section) {
                            userProfile[section].submitting = false;
                        }
                        if (toggleOff) {
                            toggleOff();
                        }
                        $scope.$digest();
                    })
                    .fail(function(err) {
                        console.log(err);
                        if(section) {
                            userProfile[section].submitting = false;
                        }
                        if(section) {
                            userProfile[section].error = true;
                        }
                        $scope.$digest();
                    });
                }
            };
        }
    };

    return self;

});
