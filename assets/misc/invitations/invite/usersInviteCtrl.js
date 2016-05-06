angular.module('app')
.controller('usersInviteCtrl',['localStorageService','$scope','$stateParams','API',
function(localStorageService,$scope,$stateParams,API){
    'use strict';

    var usersInvite = this;
    usersInvite.userToInvite = {};

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var sendInvitationEmail = function(invitation) {
        var message = "You've received an invitation to join our organization.<p>" +
            "<a href='localhost:9001/#/users/register?id=" + invitation.id + "&code=" + invitation.invitationCode + "'>Click here" +
            " to register</a>.", text;

        console.log(message);

        usersInvite.sending = false;
        usersInvite.sent = true;
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

    var build = {
        personInvitation:function(user, invitee) {
            return {
                email: invitee.email,
                invitor: {
                    id: user.id,
                    type: 'person'
                },
                invitee: {
                    id: invitee.id,
                    type: 'person'
                },
                targetOrganization: {
                    'id': user.organization.id,
                    'type': 'organization'
                }
            };
        }
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    API.cui.getPerson({personId: API.getUser(), useCuid:true})
    .then(function(res) {
        usersInvite.user = res;
        usersInvite.userToInvite.organization = res.organization;
    })
    .fail(function(error) {
        console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    usersInvite.saveUser = function(form) {
        // Sets every field to $touched, so that when the user
        // clicks on 'sent invitation' he gets the warnings
        // for each field that has an error.
        angular.forEach(form.$error, function (field) {
            angular.forEach(field, function(errorField) {
                errorField.$setTouched();
            });
        });

        if (form.$valid) {
            usersInvite.sending = true;
            usersInvite.sent = false;
            usersInvite.fail = false;

            usersInvite.userToInvite.timezone = 'EST5EDT';
            usersInvite.userToInvite.language = $scope.$parent.base.getLanguageCode();
            API.cui.createPerson({data:usersInvite.userToInvite})
            .then(function(res){
                return API.cui.createPersonInvitation({data:build.personInvitation(usersInvite.user, res)});
            })
            .then(function(res){
                sendInvitationEmail(res);
            })
            .fail(function(err) {
                usersInvite.sending = false;
                usersInvite.fail = true;
                $scope.$digest();
            });
        }
    };

    // ON CLICK END ----------------------------------------------------------------------------------

}]);
