angular.module('registration')
.controller('usersRegisterCtrl',['localStorageService','$scope','Person','$stateParams','API','$state','CuiPasswordPolicies','Base',
function(localStorageService,$scope,Person,$stateParams,API,$state,CuiPasswordPolicies,Base){
    'use strict';
    var usersRegister = this;

    usersRegister.loading = true;
    usersRegister.registrationError = false;
    usersRegister.showCovisintInfo = false;
    usersRegister.submitting = false;
    usersRegister.userLogin = {};        
    usersRegister.applications = {};
    usersRegister.targetOrganization = {};
    usersRegister.applications.numberOfSelected = 0;
            
    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var getUser = function(id) {
        return API.cui.getPerson({personId:id});
    };

    var getOrganization = function(id) {
        return API.cui.getOrganization({organizationId: id});
    };

    var build = {
        // Collection of helper functions to build necessaru calls on this controller
        user: function() {
            usersRegister.user.addresses[0].country = usersRegister.userCountry.title;
            usersRegister.user.organization = { id: usersRegister.targetOrganization.id,
                                                realm: usersRegister.targetOrganization.realm,
                                                type: 'organization' };
            usersRegister.user.timezone = 'EST5EDT';
            if (usersRegister.user.phones[0]) { usersRegister.user.phones[0].type = 'main'; }
            // Get the current selected language
            usersRegister.user.language = Base.getLanguageCode();
            return usersRegister.user;
        },
        personPassword: function(user, org) {
            return {
                personId: user.id,
                data: {
                    id: user.id,
                    version: '1',
                    username: usersRegister.userLogin.username,
                    password: usersRegister.userLogin.password,
                    passwordPolicy: org.passwordPolicy,
                    authenticationPolicy: org.authenticationPolicy
                }
            };
        },
        userSecurityQuestions: function(user) {
            return [
                {
                    question: {
                        id: usersRegister.userLogin.question1.id,
                        type: 'question',
                        realm: user.realm
                    },
                    answer: usersRegister.userLogin.challengeAnswer1,
                    index: 1
                },
                {
                    question: {
                        id: usersRegister.userLogin.question2.id,
                        type: 'question',
                        realm: user.realm
                    },
                    answer: usersRegister.userLogin.challengeAnswer2,
                    index: 2
                }
            ];
        },
        userSecurityQuestionAccount: function(user) {
            return {
                personId: user.id,
                data: {
                    version: '1',
                    id: user.id,
                    questions: this.userSecurityQuestions(user)
                }
            };
        },
        packagesSelected: function() {
            var packages = [];
            angular.forEach(usersRegister.applications.selected,function(servicePackage){
                packages.push({packageId:servicePackage.split(',')[0]});
            });
            return packages;
        },
        packageRequest: function(packageId) {
            return {
                data: {
                    requestor: {
                        id: usersRegister.user.id,
                        type: 'person'
                    },
                    servicePackage: {
                        id: packageId.packageId,
                        type: 'servicePackage'
                    },
                    reason: 'Invited User Registration'
                }
            };
        }
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if(!$stateParams.id || !$stateParams.code) {
        console.log('Invited user reg requires 2 url params: id (invitationId) and code (invitatioCode)');
            // TODO : ADD MESSAGE IF USER HAS TAMPERED WITH THE URL
    }
    else {
        API.cui.getPersonInvitation({invitationId: $stateParams.id})
        .then(function(res){
            if (res.invitationCode !== $stateParams.code) {
                // TODO : ADD MESSAGE IF USER HAS TAMPERED WITH THE
                console.log('Wrong invitation code.');
                return;
            }
            return getUser(res.invitee.id);
        })
        .then(function(res){
            usersRegister.invitedUser = res;
            usersRegister.user = res;
            usersRegister.user.addresses = []; // We need to initialize these arrays so ng-model treats them as arrays
            usersRegister.user.addresses[0] = { streets:[] }; // rather than objects
            usersRegister.user.phones = [];
            return getOrganization(res.organization.id);
        })
        .then(function(res){
            usersRegister.targetOrganization = res;
            return API.cui.getSecurityQuestions(); // Load security questions for login form
        })
        .then(function(res) {
            res.splice(0,1); // Removes first question as it is blank

            // Splits questions to use between both dropdowns
            var numberOfQuestions = res.length,
            numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);
            usersRegister.userLogin.challengeQuestions1 = res.slice(0,numberOfQuestionsFloor);
            usersRegister.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);

            // Preload question into input
            usersRegister.userLogin.question1 = usersRegister.userLogin.challengeQuestions1[0];
            usersRegister.userLogin.question2 = usersRegister.userLogin.challengeQuestions2[0];
        })
        .then(function() {
            // Populate Applications List
            return API.cui.getOrganizationPackages({'organizationId':usersRegister.targetOrganization.id});
        })
        .then(function(res) {
            var listOfApps = [];

            res.forEach(function(packageGrant) {
                var i = 0;
                API.cui.getPackageServices({'packageId':packageGrant.servicePackage.id})
                .then(function(res){
                    i += 1;

                    res.forEach(function(service) {
                        service.packageId=packageGrant.servicePackage.id;
                        listOfApps.push(service);
                    });

                    if(i === res.length) {
                        usersRegister.applications.list = listOfApps;
                        API.cui.getPasswordPolicy({policyId: usersRegister.targetOrganization.passwordPolicy.id})
                        .then(function(res) {
                            CuiPasswordPolicies.set(res.rules);
                            $scope.$digest();
                        });
                    }
                });
            });
        })
        .fail(function(err) {
            console.log(err);
        });
    }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    usersRegister.applications.updateNumberOfSelected = function(a) {
        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        if (a !== null) { usersRegister.applications.numberOfSelected += 1; }
        else { usersRegister.applications.numberOfSelected -= 1; }
    };

    usersRegister.applications.process = function() {
        // Process the selected apps when you click next after selecting the apps you need
        if (usersRegister.applications.processedSelected) {
            var oldSelected = usersRegister.applications.processedSelected;
        }
        usersRegister.applications.processedSelected = [];

        angular.forEach(usersRegister.applications.selected,function(app, i) {
            if (app !== null) {
                usersRegister.applications.processedSelected.push({
                    packageId:app.split(',')[0],
                    name:app.split(',')[1],
                    acceptedTos:((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false)
                });
            }
        });
        return usersRegister.applications.processedSelected.length;
    };

    usersRegister.applications.searchApplications = function() {
        // Search apps by name
        API.cui.getPackages({'qs': [['name', usersRegister.applications.search]]})
        .then(function(res){
            usersRegister.applications.list = res;
            $scope.$digest();
        })
        .fail(function(err){
            console.log(err);
        });
    };

    usersRegister.applications.toggleCovisintInfo = function() {
        usersRegister.showCovisintInfo = !usersRegister.showCovisintInfo;
    };

    usersRegister.submit = function() {
        usersRegister.submitting = true;
        var user;

        API.cui.updatePerson({personId: usersRegister.invitedUser.id, data: build.user()})
        .then(function(res) {
            user = res;
            return API.cui.createPersonPassword(build.personPassword(user, usersRegister.targetOrganization));
        })
        .then(function() {
            // Create Security Account
            return API.cui.createSecurityQuestionAccount(build.userSecurityQuestionAccount(user));
        })
        .then(function() {
            // Activate Person
            return API.cui.activatePerson({qs: [['personId', user.id]] });
        })
        .then(function() {
            // Get Selected Packages
            return build.packagesSelected();
        })
        .then(function(res) {
            // Create Package Requests
            if (res.length === 0) {
                // No Packages Selected
                return;
            }
            angular.forEach(res, function(servicePackage) {
                var i = 0;
                API.cui.createPackageRequest(build.packageRequest(servicePackage))
                .then(function(res) {
                    i += 1;
                    if (i === res.length) {
                        usersRegister.submitting = false;
                        usersRegister.success = true;
                        console.log('User Created');
                        $state.go('misc.success');
                    }
                })
                .fail(function(err) {
                    console.log(err);
                });
            });
        })
        .fail(function(err) {
            console.log(err);
        });
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
