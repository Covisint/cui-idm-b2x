angular.module('registration')
.controller('userWalkupCtrl', function($scope,$state,API,APIError,Base,localStorageService,Registration) {

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
    APIError.offFor('userWalkup.initializing')

    if (!localStorageService.get('userWalkup.user')) {
        // If registration is not saved in localstorage we need to initialize 
        // these arrays so ng-model treats them as arrays rather than objects 
        userWalkup.user = { addresses: [] }
        userWalkup.user.addresses[0] = { streets: [] }
        userWalkup.user.phones = []
    } else {
        userWalkup.user = localStorageService.get('userWalkup.user');
    }


    Registration.walkUpInit()
    .then(res=>{

        const questions = res.questions;
        const organizations = res.organizations

        questions.splice(0, 1) // Split questions to use between 2 dropdowns

        let numberOfQuestions = questions.length
        let numberOfQuestionsFloor = Math.floor(numberOfQuestions/2)

        userWalkup.userLogin.challengeQuestions1 = questions.slice(0, numberOfQuestionsFloor)
        userWalkup.userLogin.challengeQuestions2 = questions.slice(numberOfQuestionsFloor)

        // Preload questions into input
        userWalkup.userLogin.question1 = userWalkup.userLogin.challengeQuestions1[0]
        userWalkup.userLogin.question2 = userWalkup.userLogin.challengeQuestions2[0]

        // Populate organization list
        userWalkup.organizationList = organizations
        userWalkup.organizationCount = organizations.length
    })
    .catch(() => {
        $state.go('misc.loadError')
    })
    .finally(() => {
        userWalkup.initializing = false
        $scope.$digest()
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

    // Note [7/20/2016]: Commented out searching grants by name as Nonce API does not currently support this

    // userWalkup.applications.searchApplications = () => {
    //     const actionName = 'userWalkup.getApplications'

    //     Loader.onFor(actionName)
    //     APIError.offFor(actionName)

    //     API.cui.initiateNonce()
    //     .then(res => {
    //         return API.cui.getOrgPackageGrantsNonce({
    //             organizationId: userWalkup.organization.id, 
    //             qs: [['service.name', userWalkup.applications.search]]
    //         })
    //     })
    //     .then(res => {
    //         if (!res.length) userWalkup.applications.list = undefined
    //         else {
    //             userWalkup.applications.list = res.map((grant) => {
    //                 grant = grant.servicePackageResource
    //                 return grant
    //             })
    //         }
    //     },
    //         error => APIError.onFor(actionName, error.responseJSON.apiMessage)
    //     )
    //     .always(() => {
    //         Loader.offFor(actionName)
    //         $scope.$digest()
    //     })
    // }

    userWalkup.submit = () => {
        const user = build.buildPerson()
        userWalkup.submitting = true
        userWalkup.submitError = false

        API.cui.initiateNonce()
        .then(res => {
            return API.cui.postUserRegistrationNonce({data: user})
        })
        .then(res => {
            if (userWalkup.applications.numberOfSelected !== 0) {
                return API.cui.postPersonRequestNonce({data: build.buildRequest(res.person.id, res.person.realm)})    
            }
            else {
                return
            }
            return API.cui.postPersonRequestNonce({data: build.buildRequest(res.person.id, res.person.realm)})
        })
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

    // Note [7/20/2016]: Commented out pagination logic as nonce organizations call doesn't support pagination at this time

    // userWalkup.orgPaginationPageHandler = (page) => {
    //     API.cui.initiateNonce()
    //     .then(res => {
    //         return API.cui.getOrganizationsNonce({'qs': [['pageSize', userWalkup.orgPaginationSize],['page', page]]})
    //     })
    //     .then(res => {
    //         userWalkup.organizationList = res
    //         userWalkup.organizationCount = res.length
    //     })
    //     .always(() => {
    //         $scope.$digest()
    //     })
    // }

    userWalkup.selectOrganization = (organization) => {
        userWalkup.organization = organization
        userWalkup.applications.numberOfSelected = 0 // Restart applications count
        userWalkup.applications.processedSelected = undefined // Restart applications selected

        API.cui.initiateNonce()
        .then(res => {
            return API.cui.getOrgPackageGrantsNonce({organizationId: organization.id})
        })
        .then(res => {
            if (!res.length) {
                userWalkup.applications.list = undefined;
            } else {
                userWalkup.applications.list = res.map((grant) => {
                    grant = grant.servicePackageResource
                    return grant
                })
            }
            return API.cui.getPasswordPoliciesNonce({policyId: organization.passwordPolicy.id})
        })
        .then(res => {
            userWalkup.passwordRules = res.rules  
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

    /* --------------------------------------------- WATCHERS END --------------------------------------------- */

})
