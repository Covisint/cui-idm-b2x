angular.module('registration')
.controller('userWalkupCtrl', function(API,APIError,Base,localStorageService,$scope,$state,Registration) {

    const userWalkup = this

    userWalkup.applications = {}
    userWalkup.userLogin = {}
    userWalkup.applications.numberOfSelected = 0
    userWalkup.orgPaginationCurrentPage = 1
    userWalkup.submitError = false

    /* ---------------------------------------- HELPER FUNCTIONS START ---------------------------------------- */

    // Helper functions to build out the person and request objects needed for registration
    var build = {
        person: function() {
            userWalkup.user.addresses[0].country = userWalkup.userCountry.title // Get title of selected country object
            userWalkup.user.organization = { id: userWalkup.organization.id }
            userWalkup.user.timezone = 'EST5EDT'
            if (userWalkup.user.phones[0]) {
                userWalkup.user.phones[0].type = 'main';
            }
            userWalkup.user.language = Base.getLanguageCode() // Get current used language
            return userWalkup.user
        },
        passwordAccount: function() {
            return {
                version: '1',
                username: userWalkup.userLogin.username,
                password: userWalkup.userLogin.password,
                passwordPolicy: userWalkup.organization.passwordPolicy,
                authenticationPolicy: userWalkup.organization.authenticationPolicy
            }
        },
        securityQuestionAccount: function() {
            return {
                version: '1',
                questions: [{
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
                }]
            }
        }, 
        buildPerson: function() {
            return {
                person: this.person(),
                passwordAccount: this.passwordAccount(),
                securityQuestionAccount: this.securityQuestionAccount()
            }
        },
        buildRequest: function(personId, personRealm) {
            let request = {
                registrant: {
                    id: personId,
                    type: 'person',
                    realm: personRealm
                },
                justification: 'User Walkup Registration'
            }

            if (userWalkup.applications.selected) {
                request.packages = []
                angular.forEach(userWalkup.applications.selected,function(servicePackage) {
                    // userWalkup.applications.selected is an array of strings that looks like
                    // ['<appId>,<appName>','<app2Id>,<app2Name>',etc]
                    request.packages.push({
                        id: servicePackage.split(',')[0],
                        type: 'servicePackage'
                    })
                })    
            }
            return request
        }
    }

    /* ----------------------------------------- HELPER FUNCTIONS END ----------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    userWalkup.initializing = true

    if (!localStorageService.get('userWalkup.user')) {
        // If registration is not saved in localstorage we need to initialize 
        // these arrays so ng-model treats them as arrays rather than objects 
        userWalkup.user = { addresses: [] }
        userWalkup.user.addresses[0] = { streets: [] }
        userWalkup.user.phones = []
    } 
    else {
        userWalkup.user = localStorageService.get('userWalkup.user');
    }

    Registration.initWalkupRegistration()
    .then(res => {
        const questions = res.securityQuestions

        // Split questions to use between 2 dropdowns
        questions.splice(0, 1)
        const numberOfQuestionsFloor = Math.floor(questions.length / 2)

        userWalkup.userLogin.challengeQuestions1 = questions.slice(0, numberOfQuestionsFloor)
        userWalkup.userLogin.challengeQuestions2 = questions.slice(numberOfQuestionsFloor)

        // Preload questions into input
        userWalkup.userLogin.question1 = userWalkup.userLogin.challengeQuestions1[0]
        userWalkup.userLogin.question2 = userWalkup.userLogin.challengeQuestions2[0]

        // Populate organization list
        userWalkup.organizationList = res.organizations
        userWalkup.organizationCount = res.organizations.length

        userWalkup.initializing = false
    })
    .catch(error => {
        $state.go('misc.loadError')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    userWalkup.applications.updateNumberOfSelected = (checkboxValue) => {
        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        if (checkboxValue !== null) {
            userWalkup.applications.numberOfSelected += 1;
        } else {
            userWalkup.applications.numberOfSelected -= 1;
        }
    }

    userWalkup.applications.process = () => {
        // Process the selected apps when you click next after selecting the apps you need
        // returns number of apps selected
        let oldSelected

        if (userWalkup.applications.processedSelected) {
            oldSelected = userWalkup.applications.processedSelected
        }

        userWalkup.applications.processedSelected = []

        angular.forEach(userWalkup.applications.selected, function(app, i) {
            if (app !== null) {
                userWalkup.applications.processedSelected.push({
                    id: app.split(',')[0],
                    name: app.split(',')[1],
                    // this fixes an issue where removing an app from the selected list that the user 
                    //had accepted the terms for would carry over that acceptance to the next app on the list
                    acceptedTos: ((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false)
                })
            }
        })
        return userWalkup.applications.processedSelected.length
    }

    userWalkup.submit = () => {

        userWalkup.submitting = true
        userWalkup.submitError = false

        Registration.walkUpSubmit(build, userWalkup.applications)
        .always(() => {
            userWalkup.submitting = false
            $scope.$digest()
        })
        .done(() => {
            userWalkup.success = true
            userWalkup.submitting = false
            $state.go('misc.success')
        })
        .fail(error => {
            userWalkup.submitError = true
            console.error('Error submitting registration request', error)
            if (error.responseJSON) {
                userWalkup.errorMessage = error.responseJSON.apiMessage
            }
            else {
                userWalkup.errorMessage = 'Error submitting registration request'
            }
        })
    }

    userWalkup.selectOrganization = (organization) => {
        userWalkup.organization = organization
        userWalkup.applications.numberOfSelected = 0 // Restart applications count
        userWalkup.applications.processedSelected = undefined // Restart applications selected

        Registration.selectOrganization(organization)
        .then(res=>{
            const grants = res.grants;

            if (!grants.length) {
                userWalkup.applications.list = undefined;
            } else {
                userWalkup.applications.list = grants.map((grant) => {
                    grant = grant.servicePackageResource
                    return grant
                })
            }

            userWalkup.passwordRules = res.passwordRules
        })
        .always(() => {
            $scope.$digest()
        })
        .fail((error) => {
            console.error('Error getting organization information', error)
            APIError.onFor('userWalkup.orgInfo', error)
        })
    }

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

    /* -------------------------------------------- WATCHERS START -------------------------------------------- */

    $scope.$watch('userWalkup.user', (a) => {
        if (a && Object.keys(a).length !== 0) {
            localStorageService.set('userWalkup.user', a);
        }
    }, true)

    userWalkup.customErrors = {
        userName: {
            usernameTaken: Registration.isUsernameTaken
        },
        email: {
            emailTaken: Registration.isEmailTaken
        }
    }

    /* --------------------------------------------- WATCHERS END --------------------------------------------- */

})
