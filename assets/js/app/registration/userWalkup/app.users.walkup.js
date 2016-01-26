angular.module('app')
.controller('usersWalkupCtrl',['localStorageService','$scope','Person','$stateParams', 'API',
function(localStorageService,$scope,Person,$stateParams,API){
    var usersWalkup=this;
    usersWalkup.userLogin={};
    usersWalkup.applications={};
    usersWalkup.registering=false;
    usersWalkup.registrationError=false;
    usersWalkup.applications.numberOfSelected=0;

    usersWalkup.applications.updateNumberOfSelected=function(a){
        if(a!==null) usersWalkup.applications.numberOfSelected++;
        else usersWalkup.applications.numberOfSelected--;
    };

    usersWalkup.applications.process=function(){
        usersWalkup.applications.processedSelected=[];
        angular.forEach(usersWalkup.applications.selected,function(app){
            if(app!==null) {
                var id=app.split(',')[0];
                var name=app.split(',')[1];
                usersWalkup.applications.processedSelected.push({
                    id:id,
                    name:name
                });
            }
        });
    };

    usersWalkup.passwordPolicies=[
        {
            'allowUpperChars':true,
            'allowLowerChars':true,
            'allowNumChars':true,
            'allowSpecialChars':true,
            'requiredNumberOfCharClasses':3
        },
        {
            'disallowedChars':'^&*)(#$'
        },
        {
            'min':8,
            'max':18
        },
        {
            'disallowedWords':['password','admin']
        }
    ];

    API.cui.getSecurityQuestions()
    .then(function(res) {
        // Removes first question as it is blank
        res.splice(0,1);

        // Splits questions to use between both dropdowns
        var numberOfQuestions = res.length,
        numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);

        usersWalkup.userLogin.challengeQuestions1 = res.slice(0,numberOfQuestionsFloor);
        usersWalkup.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);

        // Preload question into input
        usersWalkup.userLogin.question1 = usersWalkup.userLogin.challengeQuestions1[0];
        usersWalkup.userLogin.question2 = usersWalkup.userLogin.challengeQuestions2[0];
    })
    .fail(function(err) {
        console.log(err);
    });

    // Populate Applications List

    API.cui.getPackages()
    .then(function(res){
        console.log(res);
        usersWalkup.applications.list=res;
    })
    .fail(function(err){
        console.log(err);
    })

    // usersWalkup.finish=function(form){
    //     if(form.$invalid){
    //         angular.forEach(form.$error, function (field) {
    //             angular.forEach(field, function(errorField){
    //                 errorField.$setTouched();
    //             });
    //         });
    //         return;
    //     }

    //     usersWalkup.registering=true;

    //     var passwordAccount={
    //         username:usersWalkup.userLogin.username,
    //         password:usersWalkup.userLogin.password,
    //         passwordPolicy:{
    //             "id":"20308ebc-292a-4a64-8b08-17e92cec8d59",
    //             "type":"passwordPolicy",
    //             "realm":"COVSMKT-CVDEV"
    //         },
    //         authenticationPolicy:{
    //             "id":"3359e4d2-576f-46ae-93e9-3a5d9d161ce7",
    //             "type":"authenticationPolicy",
    //             "realm":"COVSMKT-CVDEV"
    //         },
    //         version:1
    //     };

    //     var securityQuestions={
    //         id:usersWalkup.user.id,
    //         questions:[{
    //             question:{
    //                 id:usersWalkup.userLogin.question1.id,
    //                 type:'question',
    //                 realm:'COVSMKT-CVDEV'
    //             },
    //             answer:usersWalkup.userLogin.challengeAnswer1,
    //             index:1
    //         },{
    //             question:{
    //                 id:usersWalkup.userLogin.question2.id,
    //                 type:'question',
    //                 realm:'COVSMKT-CVDEV'
    //             },
    //             answer:usersWalkup.userLogin.challengeAnswer2,
    //             index:2
    //         }],
    //         version:1
    //     };


    //     Person.createPasswordAccount(usersWalkup.user.id,passwordAccount)
    //     .then(function(res){
    //         return Person.createSecurityQuestions(usersWalkup.user.id,securityQuestions)
    //     })
    //     .then(function(res){
    //         return Person.update(usersWalkup.user.id,usersWalkup.user)
    //     })
    //     .then(function(res){
    //         console.log(res);
    //         usersWalkup.registering=false;
    //     })
    //     .catch(function(err){
    //         console.log(err);
    //         usersWalkup.registrationError=true;
    //         usersWalkup.registering=false;
    //     });
    // };

}]);
