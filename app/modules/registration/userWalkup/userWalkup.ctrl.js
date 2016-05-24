angular.module('registration')
.controller('userWalkupCtrl',['localStorageService','$scope','$stateParams', 'API','LocaleService','$state','CuiPasswordPolicies',
function(localStorageService,$scope,$stateParams,API,LocaleService,$state,CuiPasswordPolicies) {
    'use strict';

    var userWalkup = this;

    userWalkup.userLogin = {};
    userWalkup.applications = {};
    userWalkup.errorMessage = '';
    userWalkup.registering = false;
    userWalkup.userNameExistsError = false;
    userWalkup.orgLoading = true;
    userWalkup.applications.numberOfSelected = 0;
    userWalkup.orgPaginationCurrentPage = 1;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    function handleError(err) {
        console.log('Error!\n');
        console.log(err);
        userWalkup.orgLoading = false;
        $scope.$digest();
    }

    // collection of helper functions to build necessary calls on this controller
    var build = {
        personRequest:function(user) {
            return {
                data: {
                    id: user.id,
                    registrant: {
                        id: user.id,
                        type: 'person',
                        realm: user.realm
                    },
                    justification: 'User walkup registration',
                    servicePackageRequest: this.packageRequests()
                }
            };
        },
        packageRequests:function() {
            var packages = [];
            angular.forEach(userWalkup.applications.selected,function(servicePackage) {
                // userWalkup.applications.selected is an array of strings that looks like
                // ['<appId>,<appName>','<app2Id>,<app2Name>',etc]
                packages.push({packageId:servicePackage.split(',')[0]});
            });
            return packages;
        },
        personPassword:function() {
            return {
                version: '1',
                username: userWalkup.userLogin.username,
                password: userWalkup.userLogin.password,
                passwordPolicy: userWalkup.organization.passwordPolicy,
                authenticationPolicy: userWalkup.organization.authenticationPolicy
            };
        },
        userSecurityQuestionAccount:function() {
            return {
                version: '1',
                questions: this.userSecurityQuestions()
            };
        },
        user:function() {
            // Get title of selected country object
            userWalkup.user.addresses[0].country = userWalkup.userCountry.title;
            userWalkup.user.organization = {id: userWalkup.organization.id};
            userWalkup.user.timezone = 'EST5EDT';
            if(userWalkup.user.phones[0]) userWalkup.user.phones[0].type = 'main';
            // Get current used language
            userWalkup.user.language = $scope.$parent.base.getLanguageCode();
            return userWalkup.user;
        },
        userSecurityQuestions:function() {
            return [
                {
                    question: {
                        id: userWalkup.userLogin.question1.id,
                        type: 'question',
                        realm: userWalkup.organization.realm
                    },
                    answer: userWalkup.userLogin.challengeAnswer1,
                    index: 1
                },
                {
                    question: {
                        id: userWalkup.userLogin.question2.id,
                        type: 'question',
                        realm: userWalkup.organization.realm
                    },
                    answer: userWalkup.userLogin.challengeAnswer2,
                    index: 2
                }
            ];
        },
        submitData:function() {
            var submitData = {};
            submitData.person = this.user();
            submitData.passwordAccount = this.personPassword();
            submitData.securityQuestionAccount = this.userSecurityQuestionAccount();
            return submitData;
        }
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if (!localStorageService.get('userWalkup.user')) {
        // If it's not in the localstorage already
        // We need to initialize these arrays so ng-model treats them as arrays
        // Rather than objects
        userWalkup.user = { addresses:[] };
        userWalkup.user.addresses[0] = { streets:[] };
        userWalkup.user.phones = [];
    }
    else userWalkup.user = localStorageService.get('userWalkup.user');

    // Get all security questions
    API.cui.getSecurityQuestions()
    .then(function(res) {
        res.splice(0,1);
        // Splits questions to use between both dropdowns
        var numberOfQuestions = res.length,
        numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);
        userWalkup.userLogin.challengeQuestions1 = res.slice(0, numberOfQuestionsFloor);
        userWalkup.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);

        // Preload question into input
        userWalkup.userLogin.question1 = userWalkup.userLogin.challengeQuestions1[0];
        userWalkup.userLogin.question2 = userWalkup.userLogin.challengeQuestions2[0];
        return API.cui.getOrganizations({'qs': [['pageSize', userWalkup.orgPaginationSize],['page',1]]});
    })
    .then(function(res){
        // Populate organization list
        userWalkup.organizationList = res;
        return API.cui.countOrganizations();
    })
    .then(function(res) {
        userWalkup.organizationCount = res;
        userWalkup.orgLoading = false;
        $scope.$digest();
    })
    .fail(handleError);

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    userWalkup.applications.updateNumberOfSelected = function(checkboxValue) {
        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        if (checkboxValue !== null) userWalkup.applications.numberOfSelected++;
        else userWalkup.applications.numberOfSelected--;
    };

    userWalkup.applications.process = function() {
        // Process the selected apps when you click next after selecting the apps you need
        // returns number of apps selected
        if (userWalkup.applications.processedSelected) {
            var oldSelected = userWalkup.applications.processedSelected;
        }
        userWalkup.applications.processedSelected = [];
        angular.forEach(userWalkup.applications.selected,function(app, i) {
            if (app !== null) {
                userWalkup.applications.processedSelected.push({
                    id: app.split(',')[0],
                    name: app.split(',')[1],
                    // this fixes an issue
                    // where removing an app from the selected list that the user had accepted the terms for
                    // would carry over that acceptance to the next app on the list
                    acceptedTos: ((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false)
                });
            }
        });
        return userWalkup.applications.processedSelected.length;
    };

    userWalkup.applications.searchApplications=function() {
        // Search apps by name
        API.cui.getPackages({'qs': [['name', userWalkup.applications.search],['owningOrganization.id', userWalkup.organization.id]]})
        .then(function(res) {
             userWalkup.applications.list = res;
            $scope.$apply();
        })
        .fail(handleError);
    };

    userWalkup.submit = function() {
        userWalkup.submitting = true;
        userWalkup.registrationError = false;
        var user = build.submitData();

        API.cui.registerPerson({data: user})
        .then(function(res) {
            if (userWalkup.applications.selected) {
                return API.cui.createPersonRequest(build.personRequest(res.person));
            }
            else {
                return;
            }
        })
        .then(function(res) {
            userWalkup.submitting = false;
            userWalkup.success = true;
            $state.go('misc.success');
        })
        .fail(function(err) {
            if (err.responseJSON.apiMessage === 'Username already exists') {
                userWalkup.registrationError = true;
                userWalkup.errorMessage = 'cui-error-username-exists';
            }
            userWalkup.success = false;
            userWalkup.submitting = false;
            $scope.$digest();
        });
    };

    userWalkup.orgPaginationPageHandler = function orgPaginationHandler(page) {
        API.cui.getOrganizations({'qs': [['pageSize', userWalkup.orgPaginationSize],['page', page]]})
        .then(function(res) {
            userWalkup.organizationList = res;
        })
        .fail(handleError);
    };

    // ON CLICK END ----------------------------------------------------------------------------------

    // WATCHERS START --------------------------------------------------------------------------------

    $scope.$watch('userWalkup.user',function(a) {
        if (a && Object.keys(a).length!==0) localStorageService.set('userWalkup.user',a);
    }, true);

    // Populate Applications List based on the current organization
    $scope.$watch('userWalkup.organization', function(newOrgSelected) {
        if (newOrgSelected) {
            // If the organization selected changes reset all the apps
            // userWalkup.applications.numberOfSelected = 0; // Restart applications count
            // userWalkup.applications.processedSelected = undefined; // Restart applications selected

            // API.cui.getPackages({qs: [['owningOrganization.id', newOrgSelected.id]]})
            // .then(function(res) {
            //     userWalkup.applications.list = [];
            //     if (res.length === 0) {
            //         userWalkup.applications.list = undefined;
            //         $scope.$digest();
            //     }
            //     else {
            //         userWalkup.applications.list = res;
            //     }
                
            // })
            API.cui.getPasswordPolicy({policyId: newOrgSelected.passwordPolicy.id})
            .then(function(res) {
                userWalkup.passwordRules = res.rules;
                $scope.$digest();
            })
            .fail(handleError);
        }
    });

    $scope.$watch('userWalkup.orgPaginationSize', function(newValue) {
        if (newValue) {
            API.cui.getOrganizations({'qs': [['pageSize', userWalkup.orgPaginationSize],['page', 1]]})
            .then(function(res) {
                userWalkup.organizationList = res;
                userWalkup.orgPaginationCurrentPage = 1;
            })
            .fail(handleError);
        }
    });

    // WATCHERS END ----------------------------------------------------------------------------------

}]);
