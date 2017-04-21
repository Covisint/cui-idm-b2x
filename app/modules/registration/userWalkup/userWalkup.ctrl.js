angular.module('registration')
.controller('userWalkupCtrl', function(APIError, localStorageService, Registration, $scope, $state,$q,LocaleService, $window,Base,$pagination,$filter) {

    const userWalkup = this

    userWalkup.applications = {}
    userWalkup.userLogin = {}
    userWalkup.applications.numberOfSelected = 0
    userWalkup.submitError = false
    userWalkup.languages=[];
    userWalkup.orgPaginationSize = userWalkup.orgPaginationSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    userWalkup.appPaginationSize = userWalkup.appPaginationSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
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
    //LocaleService.setLocaleByDisplayName(appConfig.languages[userWalkup.browserPreference])
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

    Object.keys(Base.languages).forEach(function(id,index){
        userWalkup.languages[index]={
            id:id
        }
    })
    Object.values(Base.languages).forEach(function(language,index){
        userWalkup.languages[index].name=language;
    })
    userWalkup.user.language=_.find(userWalkup.languages,{id:userWalkup.browserPreference})
    Registration.initWalkupRegistration(userWalkup.orgPaginationSize)
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
        userWalkup.organizationCount = res.organizationCount
        userWalkup.orgReRenderPaginate && userWalkup.orgReRenderPaginate()

        userWalkup.initializing = false
    })
    .catch(error => {
        $state.go('misc.loadError')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */
    userWalkup.applications.checkOrUncheckBundledApps = (checkboxValue,application) => {
        if (application.bundledApps) {
            application.bundledApps.forEach(bundledApp => {
                if (checkboxValue !== null) {
                    bundledApp=_.find(userWalkup.applications.list,{id:bundledApp.id})
                    userWalkup.applications.selected[bundledApp.id]=bundledApp.id+','+bundledApp.servicePackage.id+','+$filter('cuiI18n')(bundledApp.name)+','+application.servicePackage.personTacEnabled
                    userWalkup.applications.numberOfSelected += 1;

                } else {
                    userWalkup.applications.selected[bundledApp.id]=null
                    userWalkup.applications.numberOfSelected -= 1;
                } 
            })
        }

    }

    userWalkup.applications.updateNumberOfSelected = (checkboxValue,application) => {
        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        if (checkboxValue !== null) {
            userWalkup.applications.numberOfSelected += 1;
        } else {
            userWalkup.applications.numberOfSelected -= 1;
        }
        userWalkup.applications.checkOrUncheckBundledApps(checkboxValue,application)
        userWalkup.applications.process()
    }

    userWalkup.applications.updateSelected = (application, checkboxValue, index) => {
        let bundledApps=_.filter(userWalkup.applications.processedSelected,{packageId:application.packageId})
        bundledApps.forEach(bundledApp => {
            if (checkboxValue !== null) {
                userWalkup.applications.selected[bundledApp.id]=bundledApp.id+','+bundledApp.packageId+','+bundledApp.name+','+bundledApp.showTac
                userWalkup.applications.numberOfSelected += 1;
            } else {
                delete userWalkup.applications.selected[bundledApp.id]          
                userWalkup.applications.numberOfSelected -= 1;
            }
        })
    }

    userWalkup.getAppicationTaC = () => {
        angular.forEach(userWalkup.applications.processedSelected, app =>{
            //need to change later to ===
            if (app.showTac=='true') {
                Registration.getTac(app.packageId)
                .then(res =>{
                    app.tac=res;
                })
                .catch(err=> {
                    console.log(err);
                })
            };
        })
    }

    //Check TAC flag for selected applications
    userWalkup.checkTacFlag = (selectedApplications) => {
        let TacCount=0;
        angular.forEach(selectedApplications,app =>{
            //need to change later to ===
            if (app.showTac=='true') {
                TacCount++;
            };
        })
        return TacCount
    }

    userWalkup.showTac= (index) => {
        if (userWalkup.applications.processedSelected[index].tac) {
            userWalkup.tacContent=userWalkup.applications.processedSelected[index].tac.tacText
            userWalkup.applications.step=3
        }
    } 

    userWalkup.applications.process = () => {
        // Process the selected apps when you click next after selecting the apps you need
        // returns number of apps selected
        let oldSelected
        let index=0;
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
                    packageId:app.split(',')[1],
                    name: app.split(',')[2],
                    // this fixes an issue where removing an app from the selected list that the user 
                    // had accepted the terms for would carry over that acceptance to the next app on the list
                    acceptedTos: ((oldSelected && oldSelected[index]&&oldSelected[index].id==i)? oldSelected[index].acceptedTos : false),
                    showTac:app.split(',')[3]
                })
            }
            index++;
        })
        return userWalkup.checkTacFlag(userWalkup.applications.processedSelected)
        
    }

    userWalkup.submit = () => {
        userWalkup.submitting = true
        userWalkup.submitError = false

        const registrationData = {
            profile: userWalkup.user,
            organization: userWalkup.organization,
            login: userWalkup.userLogin,
            applications: userWalkup.applications,
            userCountry: userWalkup.userCountry,
            requestReason:userWalkup.reason
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

        Registration.selectOrganization(organization,userWalkup.appPaginationSize)
        .then(res => {
            const grants = res.grants
            userWalkup.appCount=res.appCount
            userWalkup.appReRenderPaginate && userWalkup.appReRenderPaginate()
            if (!grants.length) userWalkup.applications.list = undefined
            else {
                userWalkup.applications.list = grants
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

    userWalkup.orgPaginationPageHandler = (newPage) => {
        userWalkup.updatingOrgs = true
        Registration.getOrgsByPageAndName(newPage,userWalkup.orgPaginationSize)
        .then((res) => {
            userWalkup.orgPaginationCurrentPage=newPage
            userWalkup.organizationList = res
            userWalkup.updatingOrgs = false
            $scope.$digest()
        })
        .fail((err) => {
            console.error("There was an error in fetching organization list for page "+newPage +err)
            userWalkup.updatingOrgs = false
            $scope.$digest()
        })
    }

    userWalkup.appPaginationPageHandler = (newPage) => {
        userWalkup.updatingApps = true
        Registration.getOrgAppsByPage(newPage,userWalkup.appPaginationSize,userWalkup.organization.id)
        .then((res) => {
            userWalkup.appPaginationCurrentPage=newPage
            if (!res.length) {
                userWalkup.updatingApps=false
                userWalkup.applications.list = undefined
            }
            else {
                userWalkup.applications.list = res
                userWalkup.updatingApps = false
            }
            $scope.$digest()
        })
        .fail((err) =>{
            userWalkup.updatingApps =false
            $scope.$digest()
            console.error("There was an error in fetching app list for page "+newPage +err)
        })
    }
    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

    /* -------------------------------------------- WATCHERS START -------------------------------------------- */

    $scope.$watch('userWalkup.user', (a) => {
        if (a && Object.keys(a).length !== 0) {
            localStorageService.set('userWalkup.user', a);
        }
    }, true)

    $scope.$watch('userWalkup.orgFilterByname', (a) => {
        if (a!==undefined) {
            userWalkup.updatingOrgs=true
            Registration.getOrgsByPageAndName(1,userWalkup.orgPaginationSize,a)
            .then((res)=> {
                userWalkup.organizationList = res
                userWalkup.updatingOrgs=false
                $scope.$digest()
            })
            .fail((err) => {
                userWalkup.updatingOrgs=false
                $scope.$digest()
                 console.error("There was an error in filtering orgs by name "+err)
            })  
        }
              
    })

    userWalkup.checkDuplicateEmail = (value) => {
        if (value &&value!=="") {
            $q.all([Registration.isEmailTaken(value).promise])
            .then(res => {
                userWalkup.isEmailTaken=res[0]
            })
        }
        else{
            userWalkup.isEmailTaken=true;
        }        
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
        },
        answersMatch: {
            answersMatch:function(){
                if (userWalkup.userLogin && userWalkup.userLogin.challengeAnswer2) {
                    return userWalkup.userLogin.challengeAnswer2!==userWalkup.userLogin.challengeAnswer1;
                }else{
                    return true
                }
            }
        }
    }

    //Error handlers for Inline Edits in review page
    userWalkup.inlineEdit = {
        firstName:function(value){
            if (!angular.isDefined(value)) {
                userWalkup.inlineEdit.firstNameError={}
            }
            else{
                userWalkup.inlineEdit.firstNameError={
                    required: value==="" || !value
                }   
            }
            userWalkup.inlineEdit.noSaveFirstName=value==="" || !value
        },
        lastName:function(value){
            if (!angular.isDefined(value)) {
                userWalkup.inlineEdit.lastNameError={}
            }
            else{
                userWalkup.inlineEdit.lastNameError={
                    required: value==="" || !value
                }   
            }
            userWalkup.inlineEdit.noSaveLastName=value==="" || !value
        },
        email:function(value){
            var EMAIL_REGXP = /^[a-z0-9!#$%&*?_.-]+@[a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+[.][a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+/i
            if (!angular.isDefined(value)) {
                userWalkup.inlineEdit.emailError={}
            }
            else{
                userWalkup.inlineEdit.emailError={
                    required: value==="" || !value,
                    email:!EMAIL_REGXP.test(value)
                }
                //emailTaken:
                if (!userWalkup.inlineEdit.emailError.required && !userWalkup.inlineEdit.emailError.email) {
                    userWalkup.checkDuplicateEmail(value)
                }
                  
            }
            userWalkup.inlineEdit.noSaveEmail=value==="" || !value || !EMAIL_REGXP.test(value)
        },
        //For autocomplete need to handle differently
        country:function(value){
            console.log(value)
            if (!angular.isDefined(value)) {
                userWalkup.inlineEdit.countryError={
                    required:true
                }
            }else{
                userWalkup.inlineEdit.countryError={
                    required:false
                }
            }
            userWalkup.inlineEdit.noSaveCountry=value===undefined 
        },
        address1:function(value){
            if (!angular.isDefined(value)) {
                userWalkup.inlineEdit.address1Error={}
            }
            else{
                userWalkup.inlineEdit.address1Error={
                    required: value==="" || !value
                }   
            }
            userWalkup.inlineEdit.noSaveAddress1=value==="" || !value
        },
        telephone:function(value){
            if (!angular.isDefined(value)) {
                userWalkup.inlineEdit.telephoneError={}
            }
            else{
                userWalkup.inlineEdit.telephoneError={
                    required: value==="" || !value
                }   
            }
            userWalkup.inlineEdit.noSaveTelephone=value==="" || !value
        },
        userId:function(value){
            if (!angular.isDefined(value)) {
                userWalkup.inlineEdit.userIdError={}
            }
            else{
                userWalkup.inlineEdit.userIdError={
                    required: value==="" || !value,
                } 
                //usernameTaken: 
                if (!userWalkup.inlineEdit.userIdError.required) {
                    $q.all([Registration.isUsernameTaken(value).promise])
                    .then(res => {
                        userWalkup.inlineEdit.userIdError.usernameTaken=!res[0]
                        userWalkup.inlineEdit.noSaveUserId=value==="" || !value ||userWalkup.inlineEdit.userIdError.usernameTaken
                    })
                }
                 
            }
             userWalkup.inlineEdit.noSaveUserId=value==="" || !value
        },
        challengeAnswer1:function(value){
            if (!angular.isDefined(value)) {
                userWalkup.inlineEdit.challengeAnswer1Error={}
            }
            else{
                userWalkup.inlineEdit.challengeAnswer1Error={
                    required: value==="" || !value,
                    answersMatch:value===userWalkup.userLogin.challengeAnswer2
                }   
            }
            userWalkup.inlineEdit.noSaveChallengeAnswer1=value==="" || !value||value===userWalkup.userLogin.challengeAnswer2
        },
        challengeAnswer2:function(value){
            if (!angular.isDefined(value)) {
                userWalkup.inlineEdit.challengeAnswer2Error={}
            }
            else{
                userWalkup.inlineEdit.challengeAnswer2Error={
                    required: value==="" || !value,
                    answersMatch:value===userWalkup.userLogin.challengeAnswer1
                }   
            }
            userWalkup.inlineEdit.noSaveChallengeAnswer2=value==="" || !value || value===userWalkup.userLogin.challengeAnswer1
        },
        //on save functions needed to show error when pressed enter
        updateFirstNameError:function(){
            userWalkup.inlineEdit.firstName(userWalkup.user.name.given)
        },
        updateLastNameError:function(){
            userWalkup.inlineEdit.lastName(userWalkup.user.name.surname)
        },
        updateEmailError: function() {
            userWalkup.emailRe=userWalkup.user.email;
            userWalkup.inlineEdit.email(userWalkup.user.email)
        },
        updateCountryError: function() {
            if (userWalkup.userCountry) {
                userWalkup.inlineEdit.countryError={
                    required:false
                }
            }
        },
        updateAddress1Error:function(){
            userWalkup.inlineEdit.address1(userWalkup.user.addresses[0].streets[0])
        },
        updateTelephoneError:function(){
            userWalkup.inlineEdit.telephone(userWalkup.user.phones[0].number)
        },
        updateUserIdError:function(){
            userWalkup.inlineEdit.userId(userWalkup.userLogin.username)
        },
        updateChallengeAnswer1Error:function(){
            userWalkup.inlineEdit.challengeAnswer1(userWalkup.userLogin.challengeAnswer1)
        },
        updateChallengeAnswer2Error:function(){
            userWalkup.inlineEdit.challengeAnswer2(userWalkup.userLogin.challengeAnswer2)
        },

    }

    /* --------------------------------------------- WATCHERS END --------------------------------------------- */

})
