angular.module('app')
.controller('usersWalkupCtrl',['localStorageService','$scope','Person','$stateParams', 'API','LocaleService','$state',
function(localStorageService,$scope,Person,$stateParams,API,LocaleService,$state) {
    'use strict';

    var usersWalkup = this;

    usersWalkup.userLogin = {};
    usersWalkup.applications = {};

    usersWalkup.registering = false;
    usersWalkup.registrationError = false;

    usersWalkup.applications.numberOfSelected = 0;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    function handleError(err) {
        console.log('Error!\n');
        console.log(err);
    }

    var searchOrganizations = function(newOrgToSearch) {
        if (newOrgToSearch) {
            API.cui.getOrganizations({'qs': [['name', newOrgToSearch.name]]})
            .then(function(res){
                usersWalkup.organizationList = res;
                $scope.$apply();
            })
            .fail(handleError);
        }
    };

    // collection of helper functions to build necessary calls on this controller
    var build = {
        personRequest:function(user, org) {
            return {
                data: {
                    id: user.id,
                    registrant: {
                        id: user.id,
                        type: 'person',
                        realm: org.realm
                    },
                    justification: 'User walkup registration',
                    servicePackageRequest: this.packageRequests()
                }
            };
        },
        packageRequests:function() {
            // var packages = [];
            // angular.forEach(usersWalkup.applications.selected,function(servicePackage) {
            //     packages.push({packageId:servicePackage.split(',')[0]}); // usersWalkup.applications.selected is an array of strings that looks like
            // });                                                          // ['<appId>,<appName>','<app2Id>,<app2Name>',etc]
            // WORKAROUND CASE #4
            var packages = {
                'packageId': usersWalkup.applications.selected[0].split(',')[0]
            };
            return packages;
        },
        personPassword:function(user, org) {
            return {
                personId: user.id,
                data: {
                    version: '1',
                    username: usersWalkup.userLogin.username,
                    password: usersWalkup.userLogin.password,
                    passwordPolicy: org.passwordPolicy,
                    authenticationPolicy: org.authenticationPolicy
                }
            };
        },
        userSecurityQuestionAccount:function(user) {
            return {
                personId: user.id,
                data: {
                    version: '1',
                    id: user.id,
                    questions: this.userSecurityQuestions(user)
                }
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
        userSecurityQuestions:function(user) {
            return [
                {
                    question: {
                        id: usersWalkup.userLogin.question1.id,
                        type: 'question',
                        realm: user.realm
                    },
                    answer: usersWalkup.userLogin.challengeAnswer1,
                    index: 1
                },
                {
                    question: {
                        id: usersWalkup.userLogin.question2.id,
                        type: 'question',
                        realm: user.realm
                    },
                    answer: usersWalkup.userLogin.challengeAnswer2,
                    index: 2
                }
            ];
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
        return API.cui.getOrganizations();
    })
    .then(function(res){
        // Populate organization list
        usersWalkup.organizationList = res;
    })
    .fail(handleError);

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    usersWalkup.applications.updateNumberOfSelected = function(checkboxValue) {
        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        if (checkboxValue !== null) usersWalkup.applications.numberOfSelected++;
        else usersWalkup.applications.numberOfSelected--;
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
            API.cui.getOrganizationPackages({organizationId : newOrgSelected.id}) // TODO: GET SERVICES INSTEAD
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
                        usersWalkup.applications.list.push(res);
                        i++;
                        if (i === grants.length) {
                            $scope.$digest();
                        }
                    });
                });
            })
            .fail(handleError);
        }
    });

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
                    acceptedTos: ((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false) // this fixes an issue
                    // where removing an app from the selected list that the user had accepted the terms for
                    // would carry over that acceptance to the next app on the list
                });
            }
        });
        return usersWalkup.applications.processedSelected.length;
    };

    usersWalkup.applications.searchApplications=function() {
        // Search apps by name
        // TODO : GET SERVICES INSTEAD
        API.cui.getPackages({'qs': [['name', usersWalkup.applications.search],['owningOrganization.id', usersWalkup.organization.id]]})
        .then(function(res) {
             usersWalkup.applications.list = res;
            $scope.$apply();
        })
        .fail(handleError);
    };

    usersWalkup.submit = function() {
        usersWalkup.submitting = true;
        var user,org;

        API.cui.createPerson({data: build.user()})
        .then(function(res){
            user = res;
            return API.cui.getOrganization({organizationId:user.organization.id});
        })
        .then(function(res){
            org = res;
            return API.cui.createSecurityQuestionAccount(build.userSecurityQuestionAccount(user));
        })
        .then(function() {
            return API.cui.createPersonPassword(build.personPassword(user,org));
        })
        .then(function(){
            return API.cui.createPersonRequest(build.personRequest(user,org));
        })
        .then(function() {
            usersWalkup.submitting = false;
            usersWalkup.success = true;
            console.log('userCreated.');
            $state.go('misc.success');
        })
        .fail(function(err){
            usersWalkup.success=false;
            handleError(err);
        });
    };

    // WATCHERS END ----------------------------------------------------------------------------------

}]);
