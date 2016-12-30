angular.module('registration')
.controller('userWalkupCtrl', function(APIError, localStorageService, Registration, $scope, $state,$q,LocaleService, $window) {

    const userWalkup = this

    userWalkup.applications = {}
    userWalkup.userLogin = {}
    userWalkup.applications.numberOfSelected = 0
    userWalkup.submitError = false
    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    //for detectig browser time
    var d = new Date();
    var tz = d.toTimeString();

    //for detectig browser language
    var lang = $window.navigator.language || $window.navigator.userLanguage;

    if (lang.indexOf('en-')>=0) { userWalkup.browserPreference='en'; }
    else if (lang.indexOf('zh')>=0) {userWalkup.browserPreference='zh'; }
    else if (lang.indexOf('pl')>=0) { userWalkup.browserPreference='pl'; }
    else if (lang.indexOf('pt')>=0) { userWalkup.browserPreference='pt'; }
    else if (lang.indexOf('tr')>=0) { userWalkup.browserPreference='tr'; }
    else if (lang.indexOf('fr')>=0) { userWalkup.browserPreference='fr'; }
    else if (lang.indexOf('ja')>=0) { userWalkup.browserPreference='ja'; }
    else if (lang.indexOf('es')>=0) { userWalkup.browserPreference='es'; }
    else if (lang.indexOf('de')>=0) { userWalkup.browserPreference='de'; }
    else if (lang.indexOf('ru')>=0) { userWalkup.browserPreference='ru'; }
    else if (lang.indexOf('it')>=0) { userWalkup.browserPreference='it'; }
    else { 
        console.log(lang+ "not supported")
        userWalkup.browserPreference='en'; 
    }
    LocaleService.setLocaleByDisplayName(appConfig.languages[userWalkup.browserPreference])
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
    userWalkup.user.language=userWalkup.browserPreference
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

        // Fixes issue where adding and removing selected apps would leave objects with null values
        angular.forEach(userWalkup.applications.selected, (app, i) => {
            if (app === null) delete userWalkup.applications.selected[i]
        })

        userWalkup.applications.processedSelected = []

        angular.forEach(userWalkup.applications.selected, function(app, i) {
            if (app !== null) {
                userWalkup.applications.processedSelected.push({
                    id: app.split(',')[0],
                    name: app.split(',')[1],
                    // this fixes an issue where removing an app from the selected list that the user 
                    // had accepted the terms for would carry over that acceptance to the next app on the list
                    acceptedTos: ((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false)
                })
            }
        })
        return userWalkup.applications.processedSelected.length
    }

    userWalkup.submit = () => {
        userWalkup.submitting = true
        userWalkup.submitError = false

        const registrationData = {
            profile: userWalkup.user,
            organization: userWalkup.organization,
            login: userWalkup.userLogin,
            applications: userWalkup.applications,
            userCountry: userWalkup.userCountry
        }

        Registration.walkupSubmit(registrationData)
        .then(() => {
            userWalkup.success = true
            userWalkup.submitting = false
            $state.go('misc.success')
        })
        .catch(error => {
            userWalkup.submitError = true
            userWalkup.submitting = false
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
        .then(res => {
            const grants = res.grants

            if (!grants.length) userWalkup.applications.list = undefined
            else {
                userWalkup.applications.list = grants.map((grant) => {
                    grant = grant.servicePackageResource
                    return grant
                })
            }

            userWalkup.passwordRules = res.passwordRules
        })
        .fail((error) => {
            console.error('Error getting organization information', error)
            APIError.onFor('userWalkup.orgInfo', error)
        })
        .always(() => {
            $scope.$digest()
        })
    }

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

    /* -------------------------------------------- WATCHERS START -------------------------------------------- */

    $scope.$watch('userWalkup.user', (a) => {
        if (a && Object.keys(a).length !== 0) {
            localStorageService.set('userWalkup.user', a);
        }
    }, true)

    userWalkup.checkDuplicateEmail = () => {
        $q.all([Registration.isEmailTaken(userWalkup.user.email).promise])
        .then(res => {
            userWalkup.isEmailTaken=res[0]
        })
    }
    
    userWalkup.checkDuplicateEmail(userWalkup.user.email)
    userWalkup.customErrors = {
        userName: {
            usernameTaken: Registration.isUsernameTaken
        },
        email: {
            email: function(){
                var EMAIL_REGEXP = /^[a-z0-9!#$%&*?_.-]+@[a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+[.][a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+/i;
                if (userWalkup.user.email) {
                    return EMAIL_REGEXP.test(userWalkup.user.email)
                }else{
                    return true;
                }
            }
        }
    }

    /* --------------------------------------------- WATCHERS END --------------------------------------------- */

})
