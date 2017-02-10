angular.module('registration')
.controller('userInvitedCtrl', function(APIError, localStorageService, Registration, $scope, $state,$q,LocaleService, $window,Base,$stateParams,$pagination,$filter) {

    const userInvited = this
    let encodedString = btoa($stateParams.inviteId+':'+$stateParams.pin)
    userInvited.applications = {}
    userInvited.userLogin = {}
    userInvited.applications.numberOfSelected = 0
    userInvited.submitError = false
    userInvited.languages=[];
    userInvited.showOrgInfo = false
    userInvited.pageSize = userInvited.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
    // need to initialize to avoid undefined error when preselecting apps based on invitation data
    userInvited.applications.selected={}
    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    //for detectig browser time
    var d = new Date();
    var tz = d.toTimeString();

    //for detectig browser language
    var lang = $window.navigator.language || $window.navigator.userLanguage;

    if (lang.indexOf('en-')>=0) { userInvited.browserPreference='en'; }
    else if (lang.indexOf('zh')>=0) {userInvited.browserPreference='zh'; }
    else if (lang.indexOf('pl')>=0) { userInvited.browserPreference='pl'; }
    else if (lang.indexOf('pt')>=0) { userInvited.browserPreference='pt'; }
    else if (lang.indexOf('tr')>=0) { userInvited.browserPreference='tr'; }
    else if (lang.indexOf('fr')>=0) { userInvited.browserPreference='fr'; }
    else if (lang.indexOf('ja')>=0) { userInvited.browserPreference='ja'; }
    else if (lang.indexOf('es')>=0) { userInvited.browserPreference='es'; }
    else if (lang.indexOf('de')>=0) { userInvited.browserPreference='de'; }
    else if (lang.indexOf('ru')>=0) { userInvited.browserPreference='ru'; }
    else if (lang.indexOf('it')>=0) { userInvited.browserPreference='it'; }
    else { 
        console.log(lang+ "not supported")
        userInvited.browserPreference='en'; 
    }
    //LocaleService.setLocaleByDisplayName(appConfig.languages[userInvited.browserPreference])
    userInvited.initializing = true

    if (!localStorageService.get('userInvited.user')) {
        // If registration is not saved in localstorage we need to initialize 
        // these arrays so ng-model treats them as arrays rather than objects 
        userInvited.user = { addresses: [] }
        userInvited.user.addresses[0] = { streets: [] }
        userInvited.user.phones = []
    } 
    else {
        userInvited.user = localStorageService.get('userInvited.user');
        
    }

    Object.keys(Base.languages).forEach(function(id,index){
        userInvited.languages[index]={
            id:id
        }
    })
    Object.values(Base.languages).forEach(function(language,index){
        userInvited.languages[index].name=language;
    })
    userInvited.user.language=_.find(userInvited.languages,{id:userInvited.browserPreference})
    Registration.initInvitedRegistration(encodedString)
    .then(res => {
        const questions = res.securityQuestions

        // Split questions to use between 2 dropdowns
        questions.splice(0, 1)
        const numberOfQuestionsFloor = Math.floor(questions.length / 2)

        userInvited.userLogin.challengeQuestions1 = questions.slice(0, numberOfQuestionsFloor)
        userInvited.userLogin.challengeQuestions2 = questions.slice(numberOfQuestionsFloor)

        // Preload questions into input
        userInvited.userLogin.question1 = userInvited.userLogin.challengeQuestions1[0]
        userInvited.userLogin.question2 = userInvited.userLogin.challengeQuestions2[0]

        // Populate organization Data
        userInvited.organization = res.organization
        userInvited.invitationData=res.invitationData

        //Check restrict Email flag
        userInvited.user.email=""
        if (userInvited.invitationData.restrictEmail) {
            userInvited.user.email=userInvited.invitationData.email
            userInvited.emailRe=userInvited.user.email
        }
        userInvited.initializing = false
    })
    .catch(error => {
        console.error(error)
        if (error.responseJSON && error.responseJSON.apiMessage.indexOf(encodedString)>0) {
                userInvited.initializing=false
                APIError.onFor('RegistrationFactory.inValidInvite')
        }else{
            $state.go('misc.loadError')
        }
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    userInvited.applications.updateNumberOfSelected = (checkboxValue) => {
        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        if (checkboxValue !== null) {
            userInvited.applications.numberOfSelected += 1;
        } else {
            userInvited.applications.numberOfSelected -= 1;
        }
        userInvited.applications.process()
    }

    userInvited.applications.updateSelected = (application, checkboxValue, index) => {
        if (checkboxValue === true) {
            userInvited.applications.selected[index]=application.id+','+application.packageId+','+application.name+','+application.showTac
            userInvited.applications.numberOfSelected += 1;
        } else {
            delete userInvited.applications.selected[index]          
            userInvited.applications.numberOfSelected -= 1;
        }
    }

    userInvited.getAppicationTaC = () => {
        angular.forEach(userInvited.applications.processedSelected, app =>{
            //need to change later to ===
            if (app.showTac=='true' && app.tac===undefined) {
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
    userInvited.checkTacFlag = (selectedApplications) => {
        let TacCount=0;
        angular.forEach(selectedApplications,app =>{
            //need to change later to ===
            if (app.showTac=='true') {
                TacCount++;
            };
        })
        return TacCount
    }

    userInvited.showTac= (index) => {
        if (userInvited.applications.processedSelected[index].tac) {
            userInvited.tacContent=userInvited.applications.processedSelected[index].tac.tacText
            userInvited.applications.step=3
        }
    } 

    userInvited.applications.process = () => {
        // Process the selected apps when you click next after selecting the apps you need
        // returns number of apps selected
        let oldSelected
        let index=0;
        if (userInvited.applications.processedSelected) {
            oldSelected = userInvited.applications.processedSelected
        }

        // Fixes issue where adding and removing selected apps would leave objects with null values
        angular.forEach(userInvited.applications.selected, (app, i) => {
            if (app === null) delete userInvited.applications.selected[i]
        })

        userInvited.applications.processedSelected = []

        angular.forEach(userInvited.applications.selected, function(app, i) {
            if (app !== null) {
                userInvited.applications.processedSelected.push({
                    id: app.split(',')[0],
                    packageId: app.split(',')[1],
                    name: app.split(',')[2],
                    // this fixes an issue where removing an app from the selected list that the user 
                    // had accepted the terms for would carry over that acceptance to the next app on the list
                    acceptedTos: ((oldSelected && oldSelected[index]&&oldSelected[index].id==i)? oldSelected[index].acceptedTos : false),
                    showTac:app.split(',')[3],
                    tac:((oldSelected && oldSelected[index]&&oldSelected[index].id==i)? oldSelected[index].tac :undefined)
                })
            }
            index++;
        })
        return userInvited.checkTacFlag(userInvited.applications.processedSelected)
        
    }

    userInvited.submit = () => {
        userInvited.submitting = true
        userInvited.submitError = false

        const registrationData = {
            profile: userInvited.user,
            organization: userInvited.organization,
            login: userInvited.userLogin,
            applications: userInvited.applications,
            userCountry: userInvited.userCountry,
            requestReason:userInvited.reason
        }

        Registration.invitedSubmit(registrationData,encodedString,$stateParams.inviteId)
        .then(() => {
            userInvited.success = true
            userInvited.submitting = false
            $state.go('misc.success')
        })
        .catch(error => {
            userInvited.submitError = true
            userInvited.submitting = false
            if (error.responseJSON) {
                userInvited.errorMessage = error.responseJSON.apiMessage
            }
            else {
                userInvited.errorMessage = 'Error submitting registration request'
            }
        })
    }

    userInvited.selectOrganization = () => {
        userInvited.applications.numberOfSelected = 0 // Restart applications count
        userInvited.applications.processedSelected = undefined // Restart applications selected

        Registration.selectOrganization(userInvited.organization, userInvited.pageSize)
        .then(res => {
            const grants = res.grants
            userInvited.appCount=res.appCount
            if (!grants.length) userInvited.applications.list = undefined
            else {
                userInvited.applications.list = grants
                //Preselect the applications selected by admin
                if (userInvited.invitationData.servicePackage) {
                    let flagObject=userInvited.preSelectApps(userInvited.applications.list,false,false)
                    // Check whether we found main apps and sub apps in the current pagination
                    if(flagObject.appsFoundFlag&&flagObject.subappsFoundFlag){
                        userInvited.applications.process()
                    }
                    // application or subapplication was not retrieved in current set of pagination
                    // need to retrieve all apps and pre selects them
                    else{
                        userInvited.getAllOrgApps(flagObject)
                        .then(() =>{
                            userInvited.applications.process()
                        })
                    }
                }
            }
            // userInvited.reRenderPaginate && userInvited.reRenderPaginate()
            userInvited.passwordRules = res.passwordRules
        })
        .fail((error) => {
            console.error('Error getting organization information', error)
            APIError.onFor('userInvited.orgInfo', error)
        })
        .always(() => {
            $scope.$digest()
        })
    }

    //Updates the selected apps and count and set the found flags
    userInvited.selectAndUpdateFlags = (application, flags) => {
        userInvited.applications.selected[application.id]=application.id+','+application.servicePackage.id+','+$filter('cuiI18n')(application.name)+','+application.servicePackage.personTacEnabled
        flags[application.id]=true
        if (application.bundledApps&&Object.keys(flags).length===1) {
            application.bundledApps.forEach(app=>{
                flags[app.id]=false
            })
        }
        return flags;
    }
    
    userInvited.preSelectApps= (appList,appsFoundFlag,subappsFoundFlag) => {
        let bundledAppFlags={}
        let subappFlags={}
        appList.forEach(application => {
            if(appsFoundFlag!==true&&userInvited.invitationData.servicePackage.id===application.servicePackage.id){
                bundledAppFlags=userInvited.selectAndUpdateFlags(application,bundledAppFlags)
            }
            if(subappsFoundFlag!==true&&userInvited.invitationData.subPackage){
                // If subpackages
                if (userInvited.invitationData.subPackage.id.indexOf(',')>0) {
                    // If multiple subpackages Then subPackage.id will be string like "id1,id2,...idn"
                    let subPackages=userInvited.invitationData.subPackage.id.split(',')
                    subPackages.forEach(subPackage=>{
                        subappFlags[subPackage]=subappFlags[subPackage]||{}
                        if (application.servicePackage.id.indexOf(subPackage)>0) {
                            subappFlags[subPackage]=userInvited.selectAndUpdateFlags(application,subappFlags[subPackage])
                        }
                    })                    
                }
                else{
                    // Single Subpackage
                    if (application.servicePackage.id.indexOf(userInvited.invitationData.subPackage.id)>0) {
                        subappFlags[userInvited.invitationData.subPackage.id]={}
                        subappFlags[userInvited.invitationData.subPackage.id]=userInvited.selectAndUpdateFlags(application,subappFlags[userInvited.invitationData.subPackage.id])
                    }
                }
            }
        })
        //Check whether we found all the main apps,
        let count=0
        let iteration=0
        angular.forEach(bundledAppFlags,function(flag){
            iteration++
            if (flag===false) {
                count++
            }
            if (iteration===Object.keys(bundledAppFlags).length) {
                if (count===0) {
                    appsFoundFlag=true
                }
            }
        })
        //Check wether we found all the subapps,
        count=0
        iteration=0
        let iterationOut=0
        let countOut=0
        angular.forEach(subappFlags,function(subpackage){
            iterationOut++
            if (Object.keys(subpackage).length!==0) {
                angular.forEach(subpackage,function(flag){
                    iteration++
                    if (flag===false) {
                        count++
                    }
                    if (iteration===Object.keys(subpackage).length) {
                        if (count===0) {
                            subappsFoundFlag=true
                        }
                    }
                })
            }
            else{
                countOut++
            }
            if (iterationOut===Object.keys(subappFlags).length) {
                if (countOut===0) {
                    subappsFoundFlag=true
                }
                else{
                    subappsFoundFlag=false
                }

            }
        })
        userInvited.applications.numberOfSelected=Object.keys(userInvited.applications.selected).length
        return {
            appsFoundFlag:appsFoundFlag,
            subappsFoundFlag:subappsFoundFlag
        }
    }

    userInvited.getAllOrgApps=(flagObject) => {
        let deferred=$q.defer()
        let tempAllApps=[]
        let tempAppsCount=userInvited.appCount
        let page=0
        let apiPromises=[]
        do{
            page++
            apiPromises.push(Registration.getOrgAppsByPage(page,200,userInvited.organization.id))
            tempAppsCount=tempAppsCount-200
        }while(tempAppsCount>200)
        $q.all(apiPromises)
        .then(res=>{
            res.forEach(appList=>{
                userInvited.preSelectApps(appList,flagObject.appsFoundFlag,flagObject.subappsFoundFlag)
            })
            deferred.resolve()
        })
        return deferred.promise
    }

    userInvited.pageChange = (newpage) => {
        userInvited.updatingApps = true
        Registration.getOrgAppsByPage(newpage,userInvited.pageSize,userInvited.organization.id)
        .then((res) => {
            userInvited.page=newpage
            if (!res.length) userInvited.applications.list = undefined
            else {
                userInvited.applications.list = res
                userInvited.updatingApps = false
            }
        })
    }
    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

    /* -------------------------------------------- WATCHERS START -------------------------------------------- */

    $scope.$watch('userInvited.user', (a) => {
        if (a && Object.keys(a).length !== 0) {
            localStorageService.set('userInvited.user', a);
        }
    }, true)

    userInvited.checkDuplicateEmail = (value) => {
        if (value &&value!=="") {
            $q.all([Registration.isEmailTaken(value).promise])
            .then(res => {
                userInvited.isEmailTaken=res[0]
            })
        }
        else{
            userInvited.isEmailTaken=true;
        }        
    }
    
    userInvited.checkDuplicateEmail(userInvited.user.email)
    userInvited.customErrors = {
        userName: {
            usernameTaken: Registration.isUsernameTaken
        },
        email: {
            email: function(){
                var EMAIL_REGEXP = /^[a-z0-9!#$%&*?_.-]+@[a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+[.][a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+/i;
                if (userInvited.user.email) {
                    return EMAIL_REGEXP.test(userInvited.user.email)
                }else{
                    return true;
                }
            }
        },
        answersMatch: {
            answersMatch:function(){
                if (userInvited.userLogin && userInvited.userLogin.challengeAnswer2) {
                    return userInvited.userLogin.challengeAnswer2!==userInvited.userLogin.challengeAnswer1;
                }else{
                    return true
                }
            }
        }
    }

    //Error handlers for Inline Edits in review page
    userInvited.inlineEdit = {
        firstName:function(value){
            if (!angular.isDefined(value)) {
                userInvited.inlineEdit.firstNameError={}
            }
            else{
                userInvited.inlineEdit.firstNameError={
                    required: value==="" || !value
                }   
            }
            userInvited.inlineEdit.noSaveFirstName=value==="" || !value
        },
        lastName:function(value){
            if (!angular.isDefined(value)) {
                userInvited.inlineEdit.lastNameError={}
            }
            else{
                userInvited.inlineEdit.lastNameError={
                    required: value==="" || !value
                }   
            }
            userInvited.inlineEdit.noSaveLastName=value==="" || !value
        },
        email:function(value){
            var EMAIL_REGXP = /^[a-z0-9!#$%&*?_.-]+@[a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+[.][a-z0-9!#$%&*?_.-][a-z0-9!#$%&*?_.-]+/i
            if (!angular.isDefined(value)) {
                userInvited.inlineEdit.emailError={}
            }
            else{
                userInvited.inlineEdit.emailError={
                    required: value==="" || !value,
                    email:!EMAIL_REGXP.test(value)
                }
                //emailTaken:
                if (!userInvited.inlineEdit.emailError.required && !userInvited.inlineEdit.emailError.email) {
                    userInvited.checkDuplicateEmail(value)
                }
                  
            }
            userInvited.inlineEdit.noSaveEmail=value==="" || !value || !EMAIL_REGXP.test(value)
        },
        //For autocomplete need to handle differently
        country:function(value){
            console.log(value)
            if (!angular.isDefined(value)) {
                userInvited.inlineEdit.countryError={
                    required:true
                }
            }else{
                userInvited.inlineEdit.countryError={
                    required:false
                }
            }
            userInvited.inlineEdit.noSaveCountry=value===undefined 
        },
        address1:function(value){
            if (!angular.isDefined(value)) {
                userInvited.inlineEdit.address1Error={}
            }
            else{
                userInvited.inlineEdit.address1Error={
                    required: value==="" || !value
                }   
            }
            userInvited.inlineEdit.noSaveAddress1=value==="" || !value
        },
        telephone:function(value){
            if (!angular.isDefined(value)) {
                userInvited.inlineEdit.telephoneError={}
            }
            else{
                userInvited.inlineEdit.telephoneError={
                    required: value==="" || !value
                }   
            }
            userInvited.inlineEdit.noSaveTelephone=value==="" || !value
        },
        userId:function(value){
            if (!angular.isDefined(value)) {
                userInvited.inlineEdit.userIdError={}
            }
            else{
                userInvited.inlineEdit.userIdError={
                    required: value==="" || !value,
                } 
                //usernameTaken: 
                if (!userInvited.inlineEdit.userIdError.required) {
                    $q.all([Registration.isUsernameTaken(value).promise])
                    .then(res => {
                        userInvited.inlineEdit.userIdError.usernameTaken=!res[0]
                        userInvited.inlineEdit.noSaveUserId=value==="" || !value ||userInvited.inlineEdit.userIdError.usernameTaken
                    })
                }
                 
            }
             userInvited.inlineEdit.noSaveUserId=value==="" || !value
        },
        challengeAnswer1:function(value){
            if (!angular.isDefined(value)) {
                userInvited.inlineEdit.challengeAnswer1Error={}
            }
            else{
                userInvited.inlineEdit.challengeAnswer1Error={
                    required: value==="" || !value,
                    answersMatch:value===userInvited.userLogin.challengeAnswer2
                }   
            }
            userInvited.inlineEdit.noSaveChallengeAnswer1=value==="" || !value||value===userInvited.userLogin.challengeAnswer2
        },
        challengeAnswer2:function(value){
            if (!angular.isDefined(value)) {
                userInvited.inlineEdit.challengeAnswer2Error={}
            }
            else{
                userInvited.inlineEdit.challengeAnswer2Error={
                    required: value==="" || !value,
                    answersMatch:value===userInvited.userLogin.challengeAnswer1
                }   
            }
            userInvited.inlineEdit.noSaveChallengeAnswer2=value==="" || !value || value===userInvited.userLogin.challengeAnswer1
        },
        //on save functions needed to show error when pressed enter
        updateFirstNameError:function(){
            userInvited.inlineEdit.firstName(userInvited.user.name.given)
        },
        updateLastNameError:function(){
            userInvited.inlineEdit.lastName(userInvited.user.name.surname)
        },
        updateEmailError: function() {
            userInvited.emailRe=userInvited.user.email;
            userInvited.inlineEdit.email(userInvited.user.email)
        },
        updateCountryError: function() {
            if (userInvited.userCountry) {
                userInvited.inlineEdit.countryError={
                    required:false
                }
            }
        },
        updateAddress1Error:function(){
            userInvited.inlineEdit.address1(userInvited.user.addresses[0].streets[0])
        },
        updateTelephoneError:function(){
            userInvited.inlineEdit.telephone(userInvited.user.phones[0].number)
        },
        updateUserIdError:function(){
            userInvited.inlineEdit.userId(userInvited.userLogin.username)
        },
        updateChallengeAnswer1Error:function(){
            userInvited.inlineEdit.challengeAnswer1(userInvited.userLogin.challengeAnswer1)
        },
        updateChallengeAnswer2Error:function(){
            userInvited.inlineEdit.challengeAnswer2(userInvited.userLogin.challengeAnswer2)
        },

    }

    /* --------------------------------------------- WATCHERS END --------------------------------------------- */

})
