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
            sendInvitationEmail(res.data);
        })
        .catch(function(err){
            usersInvite.sending=false;
            usersInvite.fail=true;
        });
    };

    var sendInvitationEmail=function(invitation){
        var emailOpts={
            to:invitation.email,
            from:'cuiInterface@thirdwave.com',
            fromName:'CUI INTERFACE',
            subject: 'Request to join our organization',
            text: "You've received an invitation to join our organization.<p>" + 
            "localhost:9001/#/users/register?id=" + invitation.id + "&code=" + invitation.invitationCode
        };
        Person.sendUserInvitationEmail(emailOpts)
        .then(function(res){   
            usersInvite.sending=false;
            usersInvite.sent=true;
        })
        .catch(function(err){
            usersInvite.sending=false;
            usersInvite.fail=true;
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
            usersInvite.sending=true;
            usersInvite.sent=false;
            usersInvite.fail=false;
            API.doAuth()
            .then(function(){
                Person.create(usersInvite.user)
                .then(function(res){   
                    createInvitation(res.data);
                })
                .catch(function(err){
                    usersInvite.sending=false;
                    usersInvite.fail=true;
                });

            });

        }
    }



}]);