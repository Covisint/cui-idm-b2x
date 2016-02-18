angular.module('app')
.controller('usersRegisterCtrl',['localStorageService','$scope','Person','$stateParams', 'API',
    function(localStorageService,$scope,Person,$stateParams,API){
        var usersRegister=this;

        usersRegister.loading = true;
        usersRegister.userLogin = {};
        usersRegister.registering = false;
        usersRegister.registrationError = false;
        usersRegister.applications = {};
        usersRegister.applications.numberOfSelected = 0;
        usersRegister.showCovisintInfo = false;

        // Pre polulates the form with info the admin inserted when he first created the invitation
        var getUser = function(id) {
            API.cui.getPerson({personId:id})
            .then(function(res) {
                usersRegister.loading = false;
                usersRegister.user = res;
                $scope.$digest();
            })
            .fail(function(err){
                usersRegister.loading = false;
                console.log(err);
            });
        };

        usersRegister.passwordPolicies=[
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

        Person.getInvitationById($stateParams.id)
        .then(function(res) {
            if(res.data.invitationCode!==$stateParams.code){
                // Wrong code
                return;
            }
            getUser(res.data.invitee.id);
        })
        .catch(function(err){
            console.log(err);
        });

        // Load security questions for Login form
        API.doAuth()
        .then(function() {
            return API.cui.getSecurityQuestions();
        })
        .then(function(res) {
            // Removes first question as it is blank
            res.splice(0,1);

            // Splits questions to use between both dropdowns
            var numberOfQuestions = res.length,
            numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);

            usersRegister.userLogin.challengeQuestions1 = res.slice(0,numberOfQuestionsFloor);
            usersRegister.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);

            // Preload question into input
            usersRegister.userLogin.question1 = usersRegister.userLogin.challengeQuestions1[0];
            usersRegister.userLogin.question2 = usersRegister.userLogin.challengeQuestions2[0];
        })
        .fail(function(err) {
            console.log("Get Security Questions Error: ", err);
        });

        // Populate Applications List
        API.cui.getPackages()
        .then(function(res){
            usersRegister.applications.list = res;
            $scope.$digest();
        })
        .fail(function(err){
            console.log(err);
        });

        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        usersRegister.applications.updateNumberOfSelected=function(a){
            if(a!==null) usersRegister.applications.numberOfSelected++;
            else usersRegister.applications.numberOfSelected--;
        };

        // Process the selected apps when you click next after selecting the apps you need
        usersRegister.applications.process=function(){
            if(usersRegister.applications.processedSelected) var oldSelected=usersRegister.applications.processedSelected;
            usersRegister.applications.processedSelected=[];
            angular.forEach(usersRegister.applications.selected,function(app,i){
               if(app!==null) {
                   usersRegister.applications.processedSelected.push({
                       id:app.split(',')[0],
                       name:app.split(',')[1],
                       acceptedTos:((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false)
                   });
               }
           });
            return usersRegister.applications.processedSelected.length;
        };

        // Search apps by name
        usersRegister.applications.searchApplications = function() {
            API.cui.getPackages({'qs': [['name', usersRegister.applications.search]]})
            .then(function(res){
                usersRegister.applications.list = res;
                $scope.$digest();
            })
            .fail(function(err){
                console.log(err);
            });
        };

        usersRegister.applications.toggleCovisintInfo=function(){
            usersRegister.showCovisintInfo = !usersRegister.showCovisintInfo;
        };


<<<<<<< HEAD
=======

>>>>>>> 9e6021937338dfaf5e69bdc8c8d70bf86440f393

    // usersRegister.finish=function(form){
    //     if(form.$invalid){
    //         angular.forEach(form.$error, function (field) {
    //             angular.forEach(field, function(errorField){
    //                 errorField.$setTouched();
    //             });
    //         });
    //         return;
    //     }

    //     usersRegister.registering=true;

    //     var passwordAccount={
    //         username:usersRegister.userLogin.username,
    //         password:usersRegister.userLogin.password,
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
    //         id:usersRegister.user.id,
    //         questions:[{
    //             question:{
    //                 id:usersRegister.userLogin.question1.id,
    //                 type:'question',
    //                 realm:'COVSMKT-CVDEV'
    //             },
    //             answer:usersRegister.userLogin.challengeAnswer1,
    //             index:1
    //         },{
    //             question:{
    //                 id:usersRegister.userLogin.question2.id,
    //                 type:'question',
    //                 realm:'COVSMKT-CVDEV'
    //             },
    //             answer:usersRegister.userLogin.challengeAnswer2,
    //             index:2
    //         }],
    //         version:1
    //     };


    //     Person.createPasswordAccount(usersRegister.user.id,passwordAccount)
    //     .then(function(res){
    //         return Person.createSecurityQuestions(usersRegister.user.id,securityQuestions);
    //     })
    //     .then(function(res){
    //         return Person.update(usersRegister.user.id,usersRegister.user);
    //     })
    //     .then(function(res){
    //         console.log(res);
    //         usersRegister.registering=false;
    //     })
    //     .catch(function(err){
    //         console.log(err);
    //         usersRegister.registrationError=true;
    //         usersRegister.registering=false;
    //     });
    // };

}]);
