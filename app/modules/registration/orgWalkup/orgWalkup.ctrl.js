angular.module('registration')
.controller('orgWalkupCtrl', function(APIError, localStorageService, Registration, $scope, $state,$q,LocaleService, $window,Base,$pagination,$filter) {

    const orgWalkup = this

    orgWalkup.applications = {}
    orgWalkup.userLogin = {}
    orgWalkup.applications.numberOfSelected = 0
    orgWalkup.submitError = false
    orgWalkup.languages=[];
    orgWalkup.orgPaginationSize = orgWalkup.orgPaginationSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    orgWalkup.appPaginationSize = orgWalkup.appPaginationSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    //for detectig browser time
    var d = new Date();
    var tz = d.toTimeString();

    //for detectig browser language
    var lang = $window.navigator.language || $window.navigator.userLanguage;

    if (lang.indexOf('en-')>=0) { orgWalkup.browserPreference='en'; }
    else if (lang.indexOf('zh')>=0) {orgWalkup.browserPreference='zh'; }
    else if (lang.indexOf('pl')>=0) { orgWalkup.browserPreference='pl'; }
    else if (lang.indexOf('pt')>=0) { orgWalkup.browserPreference='pt'; }
    else if (lang.indexOf('tr')>=0) { orgWalkup.browserPreference='tr'; }
    else if (lang.indexOf('fr')>=0) { orgWalkup.browserPreference='fr'; }
    else if (lang.indexOf('ja')>=0) { orgWalkup.browserPreference='ja'; }
    else if (lang.indexOf('es')>=0) { orgWalkup.browserPreference='es'; }
    else if (lang.indexOf('de')>=0) { orgWalkup.browserPreference='de'; }
    else if (lang.indexOf('ru')>=0) { orgWalkup.browserPreference='ru'; }
    else if (lang.indexOf('it')>=0) { orgWalkup.browserPreference='it'; }
    else { 
        console.log(lang+ "not supported")
        orgWalkup.browserPreference='en'; 
    }
    //LocaleService.setLocaleByDisplayName(appConfig.languages[orgWalkup.browserPreference])
    orgWalkup.initializing = true

    if (!localStorageService.get('orgWalkup.user')) {
        // If registration is not saved in localstorage we need to initialize 
        // these arrays so ng-model treats them as arrays rather than objects 
        orgWalkup.user = { addresses: [] }
        orgWalkup.user.addresses[0] = { streets: [] }
        orgWalkup.user.phones = []
    } 
    else {
        orgWalkup.user = localStorageService.get('orgWalkup.user');
        
    }

    Object.keys(Base.languages).forEach(function(id,index){
        orgWalkup.languages[index]={
            id:id
        }
    })
    Object.values(Base.languages).forEach(function(language,index){
        orgWalkup.languages[index].name=language;
    })
    orgWalkup.user.language=_.find(orgWalkup.languages,{id:orgWalkup.browserPreference})
    Registration.initWalkupRegistration(orgWalkup.orgPaginationSize)
    .then(res => {
        const questions = res.securityQuestions

        // Split questions to use between 2 dropdowns
        questions.splice(0, 1)
        const numberOfQuestionsFloor = Math.floor(questions.length / 2)

        orgWalkup.userLogin.challengeQuestions1 = questions.slice(0, numberOfQuestionsFloor)
        orgWalkup.userLogin.challengeQuestions2 = questions.slice(numberOfQuestionsFloor)

        // Preload questions into input
        orgWalkup.userLogin.question1 = orgWalkup.userLogin.challengeQuestions1[0]
        orgWalkup.userLogin.question2 = orgWalkup.userLogin.challengeQuestions2[0]

        // Populate organization list
        orgWalkup.organizationList = res.organizations
        orgWalkup.organizationCount = res.organizationCount
        orgWalkup.orgReRenderPaginate && orgWalkup.orgReRenderPaginate()

        orgWalkup.initializing = false
    })
    .catch(error => {
        $state.go('misc.loadError')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */
    
    orgWalkup.prefillFields = () => {}

    orgWalkup.applications.checkOrUncheckBundledApps = (checkboxValue,application) => {
        if (application.bundledApps) {
            application.bundledApps.forEach(bundledApp => {
                if (checkboxValue !== null) {
                    bundledApp=_.find(orgWalkup.applications.list,{id:bundledApp.id})
                    orgWalkup.applications.selected[bundledApp.id]=bundledApp.id+','+bundledApp.servicePackage.id+','+$filter('cuiI18n')(bundledApp.name)+','+application.servicePackage.personTacEnabled
                    orgWalkup.applications.numberOfSelected += 1;

                } else {
                    orgWalkup.applications.selected[bundledApp.id]=null
                    orgWalkup.applications.numberOfSelected -= 1;
                } 
            })
        }

    }

    orgWalkup.applications.updateNumberOfSelected = (checkboxValue,application) => {
        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        if (checkboxValue !== null) {
            orgWalkup.applications.numberOfSelected += 1;
        } else {
            orgWalkup.applications.numberOfSelected -= 1;
        }
        orgWalkup.applications.checkOrUncheckBundledApps(checkboxValue,application)
        orgWalkup.applications.process()
    }

    orgWalkup.applications.updateSelected = (application, checkboxValue, index) => {
        let bundledApps=_.filter(orgWalkup.applications.processedSelected,{packageId:application.packageId})
        bundledApps.forEach(bundledApp => {
            if (checkboxValue !== null) {
                orgWalkup.applications.selected[bundledApp.id]=bundledApp.id+','+bundledApp.packageId+','+bundledApp.name+','+bundledApp.showTac
                orgWalkup.applications.numberOfSelected += 1;
            } else {
                delete orgWalkup.applications.selected[bundledApp.id]          
                orgWalkup.applications.numberOfSelected -= 1;
            }
        })
    }

    orgWalkup.getAppicationTaC = () => {
        angular.forEach(orgWalkup.applications.processedSelected, app =>{
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
    orgWalkup.checkTacFlag = (selectedApplications) => {
        let TacCount=0;
        angular.forEach(selectedApplications,app =>{
            //need to change later to ===
            if (app.showTac=='true') {
                TacCount++;
            };
        })
        return TacCount
    }

    orgWalkup.showTac= (index) => {
        if (orgWalkup.applications.processedSelected[index].tac) {
            orgWalkup.tacContent=orgWalkup.applications.processedSelected[index].tac.tacText
            orgWalkup.applications.step=3
        }
    } 

    orgWalkup.applications.process = () => {
        // Process the selected apps when you click next after selecting the apps you need
        // returns number of apps selected
        let oldSelected
        let index=0;
        if (orgWalkup.applications.processedSelected) {
            oldSelected = orgWalkup.applications.processedSelected
        }

        // Fixes issue where adding and removing selected apps would leave objects with null values
        angular.forEach(orgWalkup.applications.selected, (app, i) => {
            if (app === null) delete orgWalkup.applications.selected[i]
        })

        orgWalkup.applications.processedSelected = []

        angular.forEach(orgWalkup.applications.selected, function(app, i) {
            if (app !== null) {
                orgWalkup.applications.processedSelected.push({
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
        return orgWalkup.checkTacFlag(orgWalkup.applications.processedSelected)
        
    }

    orgWalkup.submit = () => {
        orgWalkup.submitting = true
        orgWalkup.submitError = false

        const registrationData = {
            profile: orgWalkup.user,
            organization: orgWalkup.organization,
            login: orgWalkup.userLogin,
            applications: orgWalkup.applications,
            userCountry: orgWalkup.userCountry,
            requestReason:orgWalkup.reason
        }

        Registration.walkupSubmit(registrationData)
        .then(() => {
            orgWalkup.success = true
            orgWalkup.submitting = false
            $state.go('misc.success')
        })
        .catch(error => {
            orgWalkup.submitError = true
            orgWalkup.submitting = false
            if (error.responseJSON) {
                orgWalkup.errorMessage = error.responseJSON.apiMessage
            }
            else {
                orgWalkup.errorMessage = 'Error submitting registration request'
            }
        })
    }

    orgWalkup.selectOrganization = (organization) => {
        orgWalkup.organization = organization
        orgWalkup.applications.numberOfSelected = 0 // Restart applications count
        orgWalkup.applications.processedSelected = undefined // Restart applications selected

        Registration.selectOrganization(organization,orgWalkup.appPaginationSize)
        .then(res => {
            const grants = res.grants
            orgWalkup.appCount=res.appCount
            orgWalkup.appReRenderPaginate && orgWalkup.appReRenderPaginate()
            if (!grants.length) orgWalkup.applications.list = undefined
            else {
                orgWalkup.applications.list = grants
            }

            orgWalkup.passwordRules = res.passwordRules
        })
        .fail((error) => {
            console.error('Error getting organization information', error)
            APIError.onFor('orgWalkup.orgInfo', error)
        })
        .always(() => {
            $scope.$digest()
        })
    }

    orgWalkup.orgPaginationPageHandler = (newPage) => {
        orgWalkup.updatingOrgs = true
        Registration.getOrgsByPageAndName(newPage,orgWalkup.orgPaginationSize)
        .then((res) => {
            orgWalkup.orgPaginationCurrentPage=newPage
            orgWalkup.organizationList = res
            orgWalkup.updatingOrgs = false
            $scope.$digest()
        })
        .fail((err) => {
            console.error("There was an error in fetching organization list for page "+newPage +err)
            orgWalkup.updatingOrgs = false
            $scope.$digest()
        })
    }

    orgWalkup.appPaginationPageHandler = (newPage) => {
        orgWalkup.updatingApps = true
        Registration.getOrgAppsByPage(newPage,orgWalkup.appPaginationSize,orgWalkup.organization.id)
        .then((res) => {
            orgWalkup.appPaginationCurrentPage=newPage
            if (!res.length) {
                orgWalkup.updatingApps=false
                orgWalkup.applications.list = undefined
            }
            else {
                orgWalkup.applications.list = res
                orgWalkup.updatingApps = false
            }
            $scope.$digest()
        })
        .fail((err) =>{
            orgWalkup.updatingApps =false
            $scope.$digest()
            console.error("There was an error in fetching app list for page "+newPage +err)
        })
    }
    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

    /* -------------------------------------------- WATCHERS START -------------------------------------------- */

    $scope.$watch('orgWalkup.user', (a) => {
        if (a && Object.keys(a).length !== 0) {
            localStorageService.set('orgWalkup.user', a);
        }
    }, true)

    $scope.$watch('orgWalkup.orgFilterByname', (a) => {
        if (a!==undefined) {
            orgWalkup.updatingOrgs=true
            Registration.getOrgsByPageAndName(1,orgWalkup.orgPaginationSize,a)
            .then((res)=> {
                orgWalkup.organizationList = res
                orgWalkup.updatingOrgs=false
                $scope.$digest()
            })
            .fail((err) => {
                orgWalkup.updatingOrgs=false
                $scope.$digest()
                 console.error("There was an error in filtering orgs by name "+err)
            })  
        }
              
    })

    orgWalkup.checkDuplicateEmail = (value) => {
        if (value &&value!=="") {
            $q.all([Registration.isEmailTaken(value).promise])
            .then(res => {
                orgWalkup.isEmailTaken=res[0]
            })
        }
        else{
            orgWalkup.isEmailTaken=true;
        }        
    }
    
    orgWalkup.checkDuplicateEmail(orgWalkup.user.email)
    orgWalkup.customErrors = {
        userName: {
            usernameTaken: Registration.isUsernameTaken
        },
        email: {
            email: function(){
                var EMAIL_REGEXP = /^[a-z0-9!#$%&*?_.-]+@[a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+[.][a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+/i;
                if (orgWalkup.user.email) {
                    return EMAIL_REGEXP.test(orgWalkup.user.email)
                }else{
                    return true;
                }
            }
        },
        answersMatch: {
            answersMatch:function(){
                if (orgWalkup.userLogin && orgWalkup.userLogin.challengeAnswer2) {
                    return orgWalkup.userLogin.challengeAnswer2!==orgWalkup.userLogin.challengeAnswer1;
                }else{
                    return true
                }
            }
        }
    }

    //Error handlers for Inline Edits in review page
    orgWalkup.inlineEdit = {
        firstName:function(value){
            if (!angular.isDefined(value)) {
                orgWalkup.inlineEdit.firstNameError={}
            }
            else{
                orgWalkup.inlineEdit.firstNameError={
                    required: value==="" || !value
                }   
            }
            orgWalkup.inlineEdit.noSaveFirstName=value==="" || !value
        },
        lastName:function(value){
            if (!angular.isDefined(value)) {
                orgWalkup.inlineEdit.lastNameError={}
            }
            else{
                orgWalkup.inlineEdit.lastNameError={
                    required: value==="" || !value
                }   
            }
            orgWalkup.inlineEdit.noSaveLastName=value==="" || !value
        },
        email:function(value){
            var EMAIL_REGXP = /^[a-z0-9!#$%&*?_.-]+@[a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+[.][a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+/i
            if (!angular.isDefined(value)) {
                orgWalkup.inlineEdit.emailError={}
            }
            else{
                orgWalkup.inlineEdit.emailError={
                    required: value==="" || !value,
                    email:!EMAIL_REGXP.test(value)
                }
                //emailTaken:
                if (!orgWalkup.inlineEdit.emailError.required && !orgWalkup.inlineEdit.emailError.email) {
                    orgWalkup.checkDuplicateEmail(value)
                }
                  
            }
            orgWalkup.inlineEdit.noSaveEmail=value==="" || !value || !EMAIL_REGXP.test(value)
        },
        //For autocomplete need to handle differently
        country:function(value){
            console.log(value)
            if (!angular.isDefined(value)) {
                orgWalkup.inlineEdit.countryError={
                    required:true
                }
            }else{
                orgWalkup.inlineEdit.countryError={
                    required:false
                }
            }
            orgWalkup.inlineEdit.noSaveCountry=value===undefined 
        },
        address1:function(value){
            if (!angular.isDefined(value)) {
                orgWalkup.inlineEdit.address1Error={}
            }
            else{
                orgWalkup.inlineEdit.address1Error={
                    required: value==="" || !value
                }   
            }
            orgWalkup.inlineEdit.noSaveAddress1=value==="" || !value
        },
        telephone:function(value){
            if (!angular.isDefined(value)) {
                orgWalkup.inlineEdit.telephoneError={}
            }
            else{
                orgWalkup.inlineEdit.telephoneError={
                    required: value==="" || !value
                }   
            }
            orgWalkup.inlineEdit.noSaveTelephone=value==="" || !value
        },
        userId:function(value){
            if (!angular.isDefined(value)) {
                orgWalkup.inlineEdit.userIdError={}
            }
            else{
                orgWalkup.inlineEdit.userIdError={
                    required: value==="" || !value,
                } 
                //usernameTaken: 
                if (!orgWalkup.inlineEdit.userIdError.required) {
                    $q.all([Registration.isUsernameTaken(value).promise])
                    .then(res => {
                        orgWalkup.inlineEdit.userIdError.usernameTaken=!res[0]
                        orgWalkup.inlineEdit.noSaveUserId=value==="" || !value ||orgWalkup.inlineEdit.userIdError.usernameTaken
                    })
                }
                 
            }
             orgWalkup.inlineEdit.noSaveUserId=value==="" || !value
        },
        challengeAnswer1:function(value){
            if (!angular.isDefined(value)) {
                orgWalkup.inlineEdit.challengeAnswer1Error={}
            }
            else{
                orgWalkup.inlineEdit.challengeAnswer1Error={
                    required: value==="" || !value,
                    answersMatch:value===orgWalkup.userLogin.challengeAnswer2
                }   
            }
            orgWalkup.inlineEdit.noSaveChallengeAnswer1=value==="" || !value||value===orgWalkup.userLogin.challengeAnswer2
        },
        challengeAnswer2:function(value){
            if (!angular.isDefined(value)) {
                orgWalkup.inlineEdit.challengeAnswer2Error={}
            }
            else{
                orgWalkup.inlineEdit.challengeAnswer2Error={
                    required: value==="" || !value,
                    answersMatch:value===orgWalkup.userLogin.challengeAnswer1
                }   
            }
            orgWalkup.inlineEdit.noSaveChallengeAnswer2=value==="" || !value || value===orgWalkup.userLogin.challengeAnswer1
        },
        //on save functions needed to show error when pressed enter
        updateFirstNameError:function(){
            orgWalkup.inlineEdit.firstName(orgWalkup.user.name.given)
        },
        updateLastNameError:function(){
            orgWalkup.inlineEdit.lastName(orgWalkup.user.name.surname)
        },
        updateEmailError: function() {
            orgWalkup.emailRe=orgWalkup.user.email;
            orgWalkup.inlineEdit.email(orgWalkup.user.email)
        },
        updateCountryError: function() {
            if (orgWalkup.userCountry) {
                orgWalkup.inlineEdit.countryError={
                    required:false
                }
            }
        },
        updateAddress1Error:function(){
            orgWalkup.inlineEdit.address1(orgWalkup.user.addresses[0].streets[0])
        },
        updateTelephoneError:function(){
            orgWalkup.inlineEdit.telephone(orgWalkup.user.phones[0].number)
        },
        updateUserIdError:function(){
            orgWalkup.inlineEdit.userId(orgWalkup.userLogin.username)
        },
        updateChallengeAnswer1Error:function(){
            orgWalkup.inlineEdit.challengeAnswer1(orgWalkup.userLogin.challengeAnswer1)
        },
        updateChallengeAnswer2Error:function(){
            orgWalkup.inlineEdit.challengeAnswer2(orgWalkup.userLogin.challengeAnswer2)
        },

    }

    /* --------------------------------------------- WATCHERS END --------------------------------------------- */

})
