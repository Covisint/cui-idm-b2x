angular.module('app')
.controller('usersWalkupCtrl',['localStorageService','$scope','Person','$stateParams', 'API','LocaleService',
function(localStorageService,$scope,Person,$stateParams,API,LocaleService){
    var usersWalkup=this;

    // Variable initialization
    usersWalkup.userLogin={};
    usersWalkup.applications={};
    usersWalkup.registering=false;
    usersWalkup.registrationError=false;
    usersWalkup.applications.numberOfSelected=0;
    usersWalkup.user={ addresses:[] }; // We need to initialize these arrays so ng-model treats them as arrays
    usersWalkup.user.addresses[0]={ streets:[] }; //  rather than objects
    usersWalkup.user.phones=[];

    function handleError(err){
        console.log('Error!\n');
        console.log(err);
    };

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

    var searchOrganizations = function(newOrgNameToSearch) {
        if (usersWalkup.orgSearch) {
            API.cui.getOrganizations({'qs': [['name', newOrgNameToSearch]]})
            .then(function(res){
                usersWalkup.organizationList = res;
                $scope.$apply();
            })
            .fail(handleError);
        }
    };

    $scope.$watchCollection('usersWalkup.orgSearch', searchOrganizations);

    // Populate Applications List

    $scope.$watch('usersWalkup.organization',function(newOrgSelected){ // If the organization selected changes reset all the apps
        if(newOrgSelected){
            usersWalkup.applications.numberOfSelected=0; // restart the applications process when a new org
            usersWalkup.applications.processedSelected=undefined; // is selected.
            API.cui.getPackages({'qs': [['owningOrganization.id', newOrgSelected.id]]})
            .then(function(res){
                usersWalkup.applications.list=res;
                $scope.$apply();
            })
            .fail(handleError);
        }
    });

    // Update the number of selected apps everytime on of the boxes is checked/unchecked
    usersWalkup.applications.updateNumberOfSelected=function(checkboxValue){
        if(checkboxValue!==null) usersWalkup.applications.numberOfSelected++;
        else usersWalkup.applications.numberOfSelected--;
    };

    // Process the selected apps when you click next after selecting the apps you need
    // returns number of apps selected
    usersWalkup.applications.process=function(){
        if(usersWalkup.applications.processedSelected) var oldSelected=usersWalkup.applications.processedSelected;
        usersWalkup.applications.processedSelected=[];
        angular.forEach(usersWalkup.applications.selected,function(app,i){
            if(app!==null) {
                usersWalkup.applications.processedSelected.push({
                    id:app.split(',')[0],
                    name:app.split(',')[1],
                    acceptedTos:((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false) // this fixes an issue
                    // where removing an app from the selected list that the user had accepted the terms for
                    // would carry over that acceptance to the next app on the list
                });
            }
        });
        return usersWalkup.applications.processedSelected.length;
    };

    // Search apps by name
    usersWalkup.applications.searchApplications=function(){
        API.cui.getPackages({'qs': [['name', usersWalkup.applications.search]]})
        .then(function(res){
            usersWalkup.applications.list = res;
            $scope.$apply();
        })
        .fail(handleError);
    };

    // Prepare security question account to be posted to API
    var buildUserSecurityQuestionAccount=function(user){
        return [
            {
                question:{
                    id:usersWalkup.userLogin.question1.id,
                    type:'question',
                    realm:user.realm
                },
                answer:usersWalkup.userLogin.challengeAnswer1,
                index:1
            },
            {
                question:{
                    id:usersWalkup.userLogin.question2.id,
                    type:'question',
                    realm:user.realm
                },
                answer:usersWalkup.userLogin.challengeAnswer2,
                index:2
            }
        ];
    };

    // Removes unecessary properties from the user object.
    var buildUserObject=function(){
        // if (usersWalkup.user.addresses && usersWalkup.user.addresses[0].streets.length===0) usersWalkup.user.addresses[0].streets[0]=;
        // if (usersWalkup.user.addresses && usersWalkup.user.addresses.length===0) delete usersWalkup.user.addresses;
        // if (usersWalkup.user.phones && usersWalkup.user.phones.length===0) delete usersWalkup.user.phones;
    }

    usersWalkup.submit = function(){
        // get the title of the country object selected
        usersWalkup.user.addresses[0].country=usersWalkup.userCountry.title;
        usersWalkup.user.organization={id:usersWalkup.organization.id};
        buildUserObject();
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
                    id:res.id,
                    questions: buildUserSecurityQuestionAccount(res)
                }
            });
        })
        .then(function(res){
            console.log(res);
        })
        .fail(handleError);
    };

}]);
