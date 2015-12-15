angular.module('app')
.controller('usersRegisterCtrl',['localStorageService','$scope','Person','$stateParams', 'API',
function(localStorageService,$scope,Person,$stateParams,API){
    var usersRegister=this;
    usersRegister.loading=true;
    usersRegister.userLogin={};
    usersRegister.userLogin.password='';

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
    .then(function(res){
        getUser(res.data.invitee.id);
    })
    .catch(function(err){
        console.log(err);
    });

    var getUser=function(id){
        API.cui.getPerson({personId:id})
        .then(function(res){
            usersRegister.loading=false;
            usersRegister.user=res;
            $scope.$apply();
        })
        .fail(function(err){
            usersRegister.loading=false;
            console.log(err);
        })
    }

    usersRegister.save=function(){
        Person.update(usersRegister.user.id,usersRegister.user);
    };

}]);