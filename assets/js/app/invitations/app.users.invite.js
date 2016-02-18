angular.module('app')
.controller('usersInviteCtrl',['localStorageService','$scope','$stateParams','API',
function(localStorageService,$scope,$stateParams,API){
    var usersInvite=this;
    usersInvite.user={};
    usersInvite.user.organization={ // organization is hardcoded
                                    // will be replaced once auth is in place
        "id": "OCOVSMKT-CVDEV204002",
        "type": "organization",
        "realm": "APPCLOUD"
    };

    var sendInvitationEmail=function(invitation){
        var message="You've received an invitation to join our organization.<p>" +
            "<a href='localhost:9001/#/users/register?id=" + invitation.id + "&code=" + invitation.invitationCode + "'>Click here" +
            " to register</a>.",
            text;
        console.log(message);
        usersInvite.sending=false;
        usersInvite.sent=true;
        $scope.$digest();
        // if(usersInvite.message && usersInvite.message!==''){
        //     text=usersInvite.message + '<br/><br/>' + message;
        // }
        // else text=message;
        // var emailOpts={
        //     to:invitation.email,
        //     from:'cuiInterface@thirdwave.com',
        //     fromName:'CUI INTERFACE',
        //     subject: 'Request to join our organization',
        //     text: text
        // };
        // Person.sendUserInvitationEmail(emailOpts)
        // .then(function(res){
        //     usersInvite.sending=false;
        //     usersInvite.sent=true;
        // })
        // .catch(function(err){
        //     usersInvite.sending=false;
        //     usersInvite.fail=true;
        // });
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
            usersInvite.user.timezone="EST5EDT";
            usersInvite.user.language=$scope.$parent.base.getLanguageCode();
            API.doAuth()
            .then(function(){
                return API.cui.createPerson({data:usersInvite.user});
            })
            .then(function(res){
                return API.cui.createPersonInvitation({data:build.personInvitation(res)});
            })
            .then(function(res){
                sendInvitationEmail(res);
            })
            .fail(function(err){
                usersInvite.sending=false;
                usersInvite.fail=true;
                $scope.$digest();
            });
        }
    };

    var build={
        personInvitation:function(invitee){
            return {
                email:invitee.email,
                invitor:{
                    id:'RN3BJI54',
                    type:'person'
                },
                invitee:{
                    id:invitee.id,
                    type:'person'
                },
                targetOrganization:{
                    "id":"OCOVSMKT-CVDEV204002",
                    "type":"organization"
                }
            };
        }
    };



}]);