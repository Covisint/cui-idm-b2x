angular.module('app')
.controller('usersWalkupCtrl',['localStorageService','$scope','Person','$stateParams', 'API','LocaleService',
function(localStorageService,$scope,Person,$stateParams,API,LocaleService){
    var usersWalkup=this;
    usersWalkup.userLogin={};
    usersWalkup.applications={};
    usersWalkup.registering=false;
    usersWalkup.registrationError=false;
    usersWalkup.applications.numberOfSelected=0;
    usersWalkup.user={ addresses:[] };
    usersWalkup.user.addresses[0]={};

    function handleError(err){
        console.log(err);
    }

    API.doAuth()
    .then(function(){
        return API.cui.getSecurityQuestions()
    })
    .then(function(res){ // get all the security questions
        res.splice(0,1);

        // Splits questions to use between both dropdowns
        var numberOfQuestions = res.length,
        numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);

        usersWalkup.userLogin.challengeQuestions1 = res.slice(0,numberOfQuestionsFloor);
        usersWalkup.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);

        // Preload question into input
        usersWalkup.userLogin.question1 = usersWalkup.userLogin.challengeQuestions1[0];
        usersWalkup.userLogin.question2 = usersWalkup.userLogin.challengeQuestions2[0];

        return API.cui.getOrganizations();
    })
    .then(function(res){
        usersWalkup.organizationList=res; // populate organization list
    })
    .fail(handleError);

    var searchOrganizations = function() {
        if (usersWalkup.orgSearch) {
            API.cui.getOrganizations({'qs': [['name', usersWalkup.orgSearch.name]]})
            .then(function(res){
                usersWalkup.organizationList = res;
                $scope.$apply();
            })
            .fail(handleError);
        }
    };

    $scope.$watchCollection('usersWalkup.orgSearch', searchOrganizations);

    // Populate Applications List

    $scope.$watch('usersWalkup.organization',function(newOrg){ // If the organization selected changes reset all the apps
        if(newOrg){
            usersWalkup.applications.numberOfSelected=0; // restart the applications process when a new org
            usersWalkup.applications.processedSelected=undefined; // is selected.
            API.cui.getPackages({'qs': [['owningOrganization.id', newOrg.id]]})
            .then(function(res){
                usersWalkup.applications.list=res;
                $scope.$apply();
            })
            .fail(handleError);
        }
    });

    // Update the number of selected apps everytime on of the boxes is checked/unchecked
    usersWalkup.applications.updateNumberOfSelected=function(a){
        if(a!==null) usersWalkup.applications.numberOfSelected++;
        else usersWalkup.applications.numberOfSelected--;
    };

    // Process the selected apps when you click next after selecting the apps you need
    usersWalkup.applications.process=function(){
        if(usersWalkup.applications.processedSelected) var oldSelected=usersWalkup.applications.processedSelected;
        usersWalkup.applications.processedSelected=[];
        angular.forEach(usersWalkup.applications.selected,function(app,i){
            if(app!==null) {
                usersWalkup.applications.processedSelected.push({
                    id:app.split(',')[0],
                    name:app.split(',')[1],
                    acceptedTos:((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false)
                });
            }
        });
        return usersWalkup.applications.processedSelected.length;
    };

    // Search apps by name
    usersWalkup.applications.searchApplications=function(){
        API.cui.getPackages({'qs': [['name', usersWalkup.applications.search]]})
        .then(function(res){
            console.log(typeof usersWalkup.applications.search);
            console.log(res);
            usersWalkup.applications.list = res;
            $scope.$apply();
        })
        .fail(handleError);
    };

    // Prepare security question account to be posted to API
    var buildUserSecurityQuestionAccount=function(){
        return [
            {
                question:{
                    id:usersWalkup.userLogin.question1.id,
                    type:'question',
                    realm:res.realm
                },
                answer:usersWalkup.userLogin.challengeAnswer1,
                index:1
            },
            {
                question:{
                    id:usersWalkup.userLogin.question2.id,
                    type:'question',
                    realm:res.realm
                },
                answer:usersWalkup.userLogin.challengeAnswer2,
                index:2
            }
        ];
    };


    usersWalkup.submit = function(){
        // get the title of the country object selected
        usersWalkup.user.addresses[0].country=usersWalkup.userCountry.title;
        usersWalkup.user.organization={id:usersWalkup.organization.id};
        usersWalkup.user.timezone='EST5EDT';
        // get the current language being used
        if(LocaleService.getLocaleCode().indexOf('_')>-1) usersWalkup.user.language=LocaleService.getLocaleCode().split('_')[0];
        else usersWalkup.user.language=LocaleService.getLocaleCode();
        API.cui.createPerson({data: usersWalkup.user}) // Create Person
        .then(function(res){
            console.log(res);
            return API.cui.createSecurityQuestionAccount({ // Create person's security question account
                personId:res.id,
                data: {
                    version:1,
                    questions:buildUserSecurityQuestionAccount()
                }
            });
        })
        .then(function(res){
            console.log(res);
        })
        .fail(handleError);
    };

}]);
