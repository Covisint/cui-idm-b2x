angular.module('app')
.controller('usersInviteCtrl',['localStorageService','$scope','Person','$stateParams','API',
function(localStorageService,$scope,Person,$stateParams,API){
    var usersInvite=this;
    usersInvite.user={};
    usersInvite.user.organization={ // organization is hardcoded
                                    // will be replaced once auth is in place
        "id": "OCOVSMKT-CVDEV204002",
        "type": "organization",
        "realm": "APPCLOUD"
    };

    var createInvitation=function(invitee){
        Person.createInvitation(invitee,{id:'RN3BJI54'})
        .then(function(res){
            console.log(res.data);
            console.log('sending email to ' + res.data.email);
            sendInvitationEmail(res.data);
        })
        .catch(function(err){
            console.log(err);
        });
    };

    var sendInvitationEmail=function(invitation){
        var emailOpts={
            to:invitation.email,
            from:'cuiInterface@test.com',
            fromName:'CUI INTERFACE',
            subject: 'Request to join our organization',
            text: "You've received an invitation to join our organization.<p>" + 
            "<a href='localhost:9001/#/users/register?id=" + invitation.id + "&code=" + invitation.invitationCode +
            "'>Click here to register.</a>"
        };
        Person.sendUserInvitationEmail(emailOpts)
        .then(function(res){
            console.log(res);
        })
        .catch(function(err){
            console.log(err);
        });
    };

    usersInvite.saveUser=function(form){

        // Sets every field to $touched, so that when the user
        // clicks on 'sent invitation' he gets the warnings
        // for each field that has an error.
        angular.forEach(form.$error, function (field) {
            angular.forEach(field, function(errorField){
                errorField.$setTouched();
            });
        });

        if(form.$valid){

            API.doAuth()
            .then(function(){
                Person.create(usersInvite.user)
                .then(function(res){
                    console.log(res.data);
                    createInvitation(res.data);
                })
                .catch(function(err){
                    console.log(err);
                });

            });

        }
    }



}]);