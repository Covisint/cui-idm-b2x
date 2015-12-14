angular.module('app')
.controller('usersRegisterCtrl',['localStorageService','$scope','Person','$stateParams', 'API',
function(localStorageService,$scope,Person,$stateParams,API){
    var usersRegister=this;
    usersRegister.loading=true;


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