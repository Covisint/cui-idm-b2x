angular.module('app')
.controller('usersWalkupCtrl',['localStorageService','$scope','$stateParams', 'API','LocaleService','$state','CuiPasswordPolicies',
function(localStorageService,$scope,$stateParams,API,LocaleService,$state,CuiPasswordPolicies) {
    'use strict';

    var usersWalkup = this;

    usersWalkup.userLogin = {};
    usersWalkup.applications = {};
    usersWalkup.errorMessage = '';
    usersWalkup.registering = false;
    usersWalkup.userNameExistsError = false;
    usersWalkup.orgLoading = true;
    usersWalkup.applications.numberOfSelected = 0;
    usersWalkup.orgPaginationCurrentPage = 1;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    function handleError(err) {
        console.log('Error!\n');
        console.log(err);
        usersWalkup.orgLoading = false;
        $scope.$digest();
    }

    var searchOrganizations = function(newOrgToSearch) {
        if (newOrgToSearch) {
            API.cui.getOrganizations({'qs': [['name', newOrgToSearch.name]]})
            .then(function(res){
                usersWalkup.organizationList = res;
                $scope.$digest();
            })
            .fail(handleError);
        }
    };

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
            angular.forEach(usersWalkup.applications.selected,function(servicePackage) {
                // usersWalkup.applications.selected is an array of strings that looks like
                // ['<appId>,<appName>','<app2Id>,<app2Name>',etc]
                packages.push({packageId:servicePackage.split(',')[0]});
            });
            return packages;
        },
        personPassword:function() {
            return {
                version: '1',
                username: usersWalkup.userLogin.username,
                password: usersWalkup.userLogin.password,
                passwordPolicy: usersWalkup.organization.passwordPolicy,
                authenticationPolicy: usersWalkup.organization.authenticationPolicy
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
            usersWalkup.user.addresses[0].country = usersWalkup.userCountry.title;
            usersWalkup.user.organization = {id: usersWalkup.organization.id};
            usersWalkup.user.timezone = 'EST5EDT';
            if(usersWalkup.user.phones[0]) usersWalkup.user.phones[0].type = 'main';
            // Get current used language
            usersWalkup.user.language = $scope.$parent.base.getLanguageCode();
            return usersWalkup.user;
        },
        userSecurityQuestions:function() {
            return [
                {
                    question: {
                        id: usersWalkup.userLogin.question1.id,
                        type: 'question',
                        realm: usersWalkup.organization.realm
                    },
                    answer: usersWalkup.userLogin.challengeAnswer1,
                    index: 1
                },
                {
                    question: {
                        id: usersWalkup.userLogin.question2.id,
                        type: 'question',
                        realm: usersWalkup.organization.realm
                    },
                    answer: usersWalkup.userLogin.challengeAnswer2,
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

    if (!localStorageService.get('usersWalkup.user')) {
        // If it's not in the localstorage already
        // We need to initialize these arrays so ng-model treats them as arrays
        // Rather than objects
        usersWalkup.user = { addresses:[] };
        usersWalkup.user.addresses[0] = { streets:[] };
        usersWalkup.user.phones = [];
    }
    else usersWalkup.user = localStorageService.get('usersWalkup.user');

    // Get all security questions
    API.cui.getSecurityQuestions()
    .then(function(res) {
        res.splice(0,1);
        // Splits questions to use between both dropdowns
        var numberOfQuestions = res.length,
        numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);
        usersWalkup.userLogin.challengeQuestions1 = res.slice(0, numberOfQuestionsFloor);
        usersWalkup.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);

        // Preload question into input
        usersWalkup.userLogin.question1 = usersWalkup.userLogin.challengeQuestions1[0];
        usersWalkup.userLogin.question2 = usersWalkup.userLogin.challengeQuestions2[0];
        return API.cui.getOrganizations({'qs': [['pageSize', usersWalkup.orgPaginationSize],['page',1]]});
    })
    .then(function(res){
        // Populate organization list
        usersWalkup.organizationList = res;
        return API.cui.countOrganizations();
    })
    .then(function(res) {
        usersWalkup.organizationCount = res;
        usersWalkup.orgLoading = false;
        $scope.$digest();
    })
    .fail(handleError);

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    usersWalkup.applications.updateNumberOfSelected = function(checkboxValue) {
        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        if (checkboxValue !== null) usersWalkup.applications.numberOfSelected++;
        else usersWalkup.applications.numberOfSelected--;
    };

    usersWalkup.applications.process = function() {
        // Process the selected apps when you click next after selecting the apps you need
        // returns number of apps selected
        if (usersWalkup.applications.processedSelected) {
            var oldSelected = usersWalkup.applications.processedSelected;
        }
        usersWalkup.applications.processedSelected = [];
        angular.forEach(usersWalkup.applications.selected,function(app, i) {
            if (app !== null) {
                usersWalkup.applications.processedSelected.push({
                    id: app.split(',')[0],
                    name: app.split(',')[1],
                    // this fixes an issue
                    // where removing an app from the selected list that the user had accepted the terms for
                    // would carry over that acceptance to the next app on the list
                    acceptedTos: ((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false)
                });
            }
        });
        return usersWalkup.applications.processedSelected.length;
    };

    usersWalkup.applications.searchApplications=function() {
        // Search apps by name
        API.cui.getPackages({'qs': [['name', usersWalkup.applications.search],['owningOrganization.id', usersWalkup.organization.id]]})
        .then(function(res) {
             usersWalkup.applications.list = res;
            $scope.$apply();
        })
        .fail(handleError);
    };

    usersWalkup.submit = function() {
        usersWalkup.submitting = true;
        usersWalkup.registrationError = false;
        var user = build.submitData();

        API.cui.registerPerson({data: user})
        .then(function(res) {
            if (usersWalkup.applications.selected) {
                return API.cui.createPersonRequest(build.personRequest(res.person));
            }
            else {
                return;
            }
        })
        .then(function(res) {
            usersWalkup.submitting = false;
            usersWalkup.success = true;
            $state.go('misc.success');
        })
        .fail(function(err) {
            if (err.responseJSON.apiMessage === 'Username already exists') {
                usersWalkup.registrationError = true;
                usersWalkup.errorMessage = 'cui-error-username-exists';
            }
            usersWalkup.success = false;
            usersWalkup.submitting = false;
            $scope.$digest();
        });
    };

    usersWalkup.orgPaginationPageHandler = function orgPaginationHandler(page) {
        API.cui.getOrganizations({'qs': [['pageSize', usersWalkup.orgPaginationSize],['page', page]]})
        .then(function(res) {
            usersWalkup.organizationList = res;
            usersWalkup.orgPaginationCurrentPage = page;
        })
        .fail(handleError);
    };

    // ON CLICK END ----------------------------------------------------------------------------------

    // WATCHERS START --------------------------------------------------------------------------------

    $scope.$watch('usersWalkup.user',function(a) {
        if (a && Object.keys(a).length!==0) localStorageService.set('usersWalkup.user',a);
    }, true);

    $scope.$watchCollection('usersWalkup.orgSearch', searchOrganizations);

    // Populate Applications List based on the current organization
    $scope.$watch('usersWalkup.organization', function(newOrgSelected) {
        if (newOrgSelected) {
            // If the organization selected changes reset all the apps
            usersWalkup.applications.numberOfSelected = 0; // Restart applications count
            usersWalkup.applications.processedSelected = undefined; // Restart applications selected

            API.cui.getOrganizationPackages({organizationId : newOrgSelected.id})
            .then(function(grants) {
                usersWalkup.applications.list = [];
                if (grants.length === 0) {
                    usersWalkup.applications.list = undefined;
                    $scope.$digest();
                }
                var i = 0;
                grants.forEach(function(grant) {
                    API.cui.getPackageServices({'packageId':grant.servicePackage.id})
                    .then(function(res) {
                        usersWalkup.applications.list.push(res[0]);
                        i++;
                        if (i === grants.length) {
                            $scope.$digest();
                        }
                    });
                });
                return API.cui.getPasswordPolicy({policyId: newOrgSelected.passwordPolicy.id});
            })
            .then(function(res) {
                CuiPasswordPolicies.set(res.rules);
                $scope.$digest();
            })
            .fail(handleError);
        }
    });

    $scope.$watch('usersWalkup.orgPaginationSize', function(newValue) {
        if (newValue) {
            API.cui.getOrganizations({'qs': [['pageSize', usersWalkup.orgPaginationSize],['page', 1]]})
            .then(function(res) {
                usersWalkup.organizationList = res;
                usersWalkup.orgPaginationCurrentPage = 1;
            })
            .fail(handleError);
        }
    });

    // WATCHERS END ----------------------------------------------------------------------------------

}]);
