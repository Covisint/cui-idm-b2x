angular.module('common')
.factory('UserProfile', function(API, APIError, LocaleService, Timezones, $filter, $q, $timeout) {

    const errorName = 'userProfileFactory.'

    const UserProfile = {

        setPhone:function(type,index){
            var phone={};
            phone.type=type;
            phone.number="";
            return phone;
        },

        getTodaysDate:function(){
            let today=new Date()
            let dd=today.getDate()
            let yyyy=today.getFullYear()
            let mmm=today.toString().substring(4,7);
            return dd+'-'+mmm+'-'+yyyy
        },

        initUser: function(userId) {
            let defer = $q.defer()
            let user = {}

            API.cui.getPerson({ personId: userId })
            .done(res => {
                // If the person object has no addresses we need to initialize it
                if (!res.addresses) {
                    res.addresses = [{streets: []}];
                }
                //If there is no streets in address we need to initialie it
                else if (!res.addresses[0].streets) {
                    res.addresses[0].streets=[];
                };
                user.user = Object.assign({}, res)
                user.tempUser = Object.assign({}, res)
                //When user doesnot have any phones(data issue)
                    if (!user.tempUser.phones) {
                        user.tempUser.phones=[];
                        user.tempUser.phones[0]=UserProfile.setPhone("main",0);
                        user.tempUser.phones[1]=UserProfile.setPhone("mobile",1);
                        user.tempUser.phones[2]=UserProfile.setPhone("fax",2);
                    }else{
                        //When user have fax/mobile but not mobile
                        if (user.tempUser.phones[0] && user.tempUser.phones[0].type!=="main") {
                            if (user.tempUser.phones[0].type==="fax") {
                                user.tempUser.phones[2]=angular.copy(user.tempUser.phones[0]);
                                user.tempUser.phones[0]=UserProfile.setPhone("main",0);
                                user.tempUser.phones[1]=UserProfile.setPhone("mobile",1);
                            }else if (user.tempUser.phones[0].type==="mobile" && user.tempUser.phones[1]) {
                                user.tempUser.phones[2]=angular.copy(user.tempUser.phones[1]);
                                user.tempUser.phones[1]=angular.copy(user.tempUser.phones[0]);
                                user.tempUser.phones[0]=UserProfile.setPhone("main",0);
                            }else
                            {
                                user.tempUser.phones[1]=angular.copy(user.tempUser.phones[0]);
                                user.tempUser.phones[0]=UserProfile.setPhone("main",0);
                                user.tempUser.phones[2]=UserProfile.setPhone("fax",2);
                            }
                        }
                        else if (user.tempUser.phones[1]) {
                            if (user.tempUser.phones[1].type==="fax") {
                                user.tempUser.phones[2]=angular.copy(user.tempUser.phones[1]);
                                user.tempUser.phones[1]=UserProfile.setPhone("mobile",1);
                            }else{
                                if (!user.tempUser.phones[2]) {
                                    user.tempUser.phones[2]=UserProfile.setPhone("fax",2);
                                };
                            }
                        }else{
                            user.tempUser.phones[1]=UserProfile.setPhone("mobile",1);
                            user.tempUser.phones[2]=UserProfile.setPhone("fax",2);
                        }
                    }
                    angular.copy(user.tempUser, user.user);
                defer.resolve(user)
            })
            .fail(err => {
                console.error('Failed getting user information', err)
                APIError.onFor(errorName + 'initUser')
                $timeout(() => {
                    APIError.offFor(errorName + 'initUser')
                }, 5000)
                defer.reject(err)
            })
            return defer.promise
        },

        initSecurityQuestions: function(userId) {
            let defer = $q.defer()
            let securityQuestions = {
                userSecurityQuestions: {},
                tempUserSecurityQuestions: {},
                allSecurityQuestions: [],
                allSecurityQuestionsDup: []
            }

            $q.all([
                API.cui.getSecurityQuestionAccount({ personId: userId }), 
                API.cui.getSecurityQuestions()
            ])
            .then(res => {
                angular.copy(res[0], securityQuestions.userSecurityQuestions)
                angular.copy(res[0], securityQuestions.tempUserSecurityQuestions)
                angular.copy(res[1], securityQuestions.allSecurityQuestions) 
                angular.copy(res[1], securityQuestions.allSecurityQuestionsDup)

                securityQuestions.allSecurityQuestions.splice(0, 1)

                let numberOfQuestions = securityQuestions.allSecurityQuestions.length
                let numberOfQuestionsFloor = Math.floor(numberOfQuestions/2)

                securityQuestions.allChallengeQuestions0 = securityQuestions.allSecurityQuestions.slice(0, numberOfQuestionsFloor)
                securityQuestions.allChallengeQuestions1 = securityQuestions.allSecurityQuestions.slice(numberOfQuestionsFloor)

                securityQuestions.challengeQuestionsTexts = UserProfile.selectTextsForQuestions(securityQuestions)

                defer.resolve(securityQuestions)
            })
            .catch(err => {
                console.error('Failed getting security question data', err)
                APIError.onFor(errorName + 'initSecurityQuestions')
                $timeout(() => {
                    APIError.offFor(errorName + 'initSecurityQuestions')
                }, 5000)
                defer.reject(err)
            })
            return defer.promise
        },

        selectTextsForQuestions: function(securityQuestions) {
            let challengeQuestionsTexts = []

            angular.forEach(securityQuestions.userSecurityQuestions.questions, (userQuestion) => {
                let question = _.find(securityQuestions.allSecurityQuestionsDup, (question) => {
                    return question.id === userQuestion.question.id
                })
                challengeQuestionsTexts.push($filter('cuiI18n')(question.question))
            })
            return challengeQuestionsTexts
        },

        initPasswordPolicy: function(organizationId) {
            let defer = $q.defer()
            let passwordPolicy = {}

            API.cui.getOrganization({ organizationId: organizationId })
            .then(res => {
                passwordPolicy.organization = res
                return API.cui.getPasswordPolicy({policyId: res.passwordPolicy.id})
            })
            .then(res => {
                passwordPolicy.passwordRules = res.rules
                res.rules.forEach(rule => {
                    if (rule.type === 'history') {
                        passwordPolicy.numberOfPasswords = rule.numberOfPasswords
                    }
                })
                defer.resolve(passwordPolicy)
            })
            .fail(err => {
                console.error('Failed getting password policy data', err)
                APIError.onFor(errorName + 'initPasswordPolicy')
                $timeout(() => {
                    APIError.offFor(errorName + 'initPasswordPolicy')
                }, 5000)
                defer.reject(err)
            })
            return defer.promise
        },

        initRegisteredDate: function(userId) {
            const defer = $q.defer()
            let lastDate=UserProfile.getTodaysDate();

            API.cui.getPersonDetailedStatusHistory({qs : [
                ['userId', userId], 
                ['startDate','01-Jan-2016'],
                ['lastDate',lastDate]
            ]})
            .then(res => {
                let activeStatusList=[];
                res.forEach((status, index) => {
                    if (status.status === 'ACTIVE') {
                        activeStatusList.push(status)
                    }
                    if (res.length-1===index) {
                        _.orderBy(activeStatusList, ['creation'], ['asc'])
                        defer.resolve(activeStatusList[0].creation) 
                    }          
                    
                })
            })
            .fail(error => {
                console.error('initRegisteredDate: There was an issue retrieving the registered date.')
                APIError.onFor(errorName + 'initRegisteredDate')
                $timeout(() => {
                    APIError.offFor(errorName + 'initRegisteredDate')
                }, 5000)
                defer.reject(error)
            })

            return defer.promise
        },

        initUserProfile: function(userId, organizationId) {
            let defer = $q.defer()
            let profile = {}
            let callsCompleted = 0
            const callsToComplete = 4

            UserProfile.initUser(userId)
            .then(res => {
                angular.merge(profile, res)
            })
            .finally(() => {
                callsCompleted += 1
                if (callsCompleted === callsToComplete) defer.resolve(profile)
            })

            UserProfile.initSecurityQuestions(userId)
            .then(res => {
                angular.merge(profile, res)
            })
            .finally(() => {
                callsCompleted += 1
                if (callsCompleted === callsToComplete) defer.resolve(profile)
            })

            UserProfile.initPasswordPolicy(organizationId)
            .then(res => {
                angular.merge(profile, res)
            })
            .finally(() => {
                callsCompleted += 1
                if (callsCompleted === callsToComplete) defer.resolve(profile)
            })

            UserProfile.initRegisteredDate(userId)
            .then(res => {
                profile['registeredDate'] = res
            })
            .finally(() => {
                callsCompleted += 1
                if (callsCompleted === callsToComplete) defer.resolve(profile)
            })

            return defer.promise
        },

        buildPersonPasswordAccount: function(user, passwordAccount, organization) {
            return {
                version: '1',
                username: user.username,
                currentPassword: passwordAccount.currentPassword,
                password: passwordAccount.password,
                passwordPolicy: organization.passwordPolicy,
                authenticationPolicy: organization.authenticationPolicy
            }
        },

        injectUI: function(profile, $scope, personId) {
            let userId

            personId
                ? userId = personId
                : userId = API.getUser()

            profile.saving = false
            profile.fail = false
            profile.success = false
            profile.timezoneById = Timezones.timezoneById
            profile.toggleOffFunctions = {}

            profile.resetAllData = () => {
                angular.copy(profile.userSecurityQuestions, profile.tempUserSecurityQuestions)
                angular.copy(profile.user, profile.tempUser)
            }

            profile.toggleAllOff = () => {
                angular.forEach(profile.toggleOffFunctions, function(toggleOff) {
                    toggleOff()
                })
                profile.resetAllData()
            }

            profile.pushToggleOff = (toggleOffObject) => {
                if (!profile.toggleOffFunctions) {
                    profile.toggleOffFunctions = {}
                }
                profile.toggleOffFunctions[toggleOffObject.name] = toggleOffObject.function
            }

            profile.resetPasswordFields = () => {
                profile.userPasswordAccount = {
                    currentPassword: '',
                    password: ''
                }
                profile.passwordRe = ''
            }

            profile.checkIfRepeatedSecurityAnswer = (securityQuestions, formObject) => {
                securityQuestions.forEach((secQuestion, i) => {
                    let securityAnswerRepeatedIndex = _.findIndex(securityQuestions, (secQuestionToCompareTo, z) => {
                        return z !== i && secQuestion.answer && secQuestionToCompareTo.answer && secQuestion.answer.toUpperCase() === secQuestionToCompareTo.answer.toUpperCase()
                    })
                    if (securityAnswerRepeatedIndex > -1) {
                        if (formObject['answer' + securityAnswerRepeatedIndex]) {
                            formObject['answer' + securityAnswerRepeatedIndex].$setValidity('securityAnswerRepeated', false)
                        }
                        if (formObject['answer' + i]) {
                            formObject['answer' + i].$setValidity('securityAnswerRepeated', false)
                        }
                    }
                    else {
                        if (formObject['answer' + i]) {
                            formObject['answer' + i].$setValidity('securityAnswerRepeated', true)
                        }
                    }
                })
            }

            profile.updatePerson = (section, toggleOff) => {
                let tempUserWithoutLastLogin;
                if (section) {
                    profile[section] = { submitting: true }
                }

                if (!profile.userCountry) {
                    profile.tempUser.addresses[0].country = profile.user.addresses[0].country;
                } else {
                    profile.tempUser.addresses[0].country = profile.userCountry.originalObject.code;
                }

                // [7/20/2016] Note: Can't pass in 'activatedDate' anymore when updating a person
                delete profile.tempUser.activatedDate
                // Can't pass lastLoginDate
                tempUserWithoutLastLogin= Object.assign({}, profile.tempUser)
                if (tempUserWithoutLastLogin.lastLoginDate) {
                    delete tempUserWithoutLastLogin.lastLoginDate
                };

                API.cui.updatePerson({personId: userId, data:tempUserWithoutLastLogin})
                .always(() => {
                    if (section) {
                        profile[section].submitting = false;
                    }
                    $scope.$digest()
                })
                .done(() => {
                    angular.copy(profile.tempUser, profile.user)
                    LocaleService.setLocaleByDisplayName(appConfig.languages[profile.user.language])
                    if (toggleOff) {
                        toggleOff();
                    }
                })
                .fail((err) => {
                    console.error('Failed to update user profile:', err)
                    if (section) {
                        profile[section].error = true;
                    }
                })
            }

            profile.updatePassword = function(section, toggleOff) {
                if (section) profile[section] = { submitting: true }
                profile.lifetimeError=false

                API.cui.updatePersonPassword({ 
                    personId: userId, 
                    data: UserProfile.buildPersonPasswordAccount(profile.user, profile.userPasswordAccount, profile.organization) 
                })
                .always(() => {
                    if (section) profile[section].submitting = false
                })
                .done(() => {
                    if (toggleOff) toggleOff()
                    profile.passwordUpdateSuccess = true
                    $timeout(() => profile.passwordUpdateSuccess = false, 5000)
                    profile.resetPasswordFields()
                    $scope.$digest()
                })
                .fail(err => {
                    console.error('Error updating password', err)
                    if (err.responseJSON.apiMessage.indexOf('does not conform to policy')>1) {
                        profile.lifetimeError=true
                    }
                    if (section) profile[section].error = true
                    $scope.$digest()
                })
            }

            profile.saveChallengeQuestions = (section, toggleOff) => {
                if (section) {
                    profile[section] = { submitting: true }
                }
                profile.userSecurityQuestions = angular.copy(profile.tempUserSecurityQuestions)

                API.cui.updateSecurityQuestionAccount({
                    personId: userId,
                    data: {
                        version: '1',
                        id: userId,
                        questions: profile.userSecurityQuestions.questions
                    }
                })
                .always(() => {
                    if (section) {
                        profile[section].submitting = false;
                    }
                })
                .done(() => {
                    if (toggleOff) {
                        toggleOff();
                    }
                    profile.challengeQuestionsTexts = UserProfile.selectTextsForQuestions(profile)
                    $scope.$digest()
                })
                .fail(err => {
                    console.error('Error updating security questions', err)
                    if (section) {
                        profile[section].error = true;
                    }
                    $scope.$digest()
                })
            }

            profile.validatePassword = (password, formObject, input) => {

                const validSwitch = (input, isValidBoolean, type) => {
                    switch (input) {
                        case 'newPassword':
                            if (type==='history') 
                                profile.validNewPasswordHistory = isValidBoolean
                            else
                                profile.validNewPasswordDisallowed = isValidBoolean
                        case 'newPasswordRe':
                            if (type==='history') 
                                profile.validNewPasswordReHistory = isValidBoolean
                            else
                                profile.validNewPasswordReDisallowed = isValidBoolean
                    }
                }

                const validateData = {
                    userId: userId,
                    organizationId: profile.user.organization.id,
                    password: password,
                    operations: ['PASSWORD_SPECIFY']
                }

                API.cui.validatePassword({data: validateData})
                .then(res => {
                    let validPasswordHistory = false
                    let validateDisallowed =false
                    // Sometimes disallowed words will not come in response, In that case need to set form object to true
                    let disallowedFlag=false
                    res.forEach(rule => {
                        if (rule.type === 'HISTORY' && rule.isPassed) {
                            validPasswordHistory = true
                        }
                        if (rule.type === 'DISALLOWED_WORDS'){
                            disallowedFlag =true
                            if(rule.isPassed) {
                                validateDisallowed = true
                            }
                        }
                    })
                    //History Validation
                    if (validPasswordHistory) {
                        validSwitch(input, true, 'history')
                    }
                    else {
                        validSwitch(input, false, 'history')
                    }
                    //Disallowed words Validation
                    if (disallowedFlag===false||validateDisallowed===true) {
                        validSwitch(input, true, 'disallowed')                        
                    }
                    else {
                        validSwitch(input, false, 'disallowed')                        
                    }
                    if (validPasswordHistory &&(disallowedFlag===false||validateDisallowed===true)) {
                        formObject[input].$setValidity(input, true)
                        $scope.$digest()
                    }
                    else{
                        formObject[input].$setValidity(input, false)
                        $scope.$digest()
                    }
                })
            }
        }
    }

    return UserProfile
})
