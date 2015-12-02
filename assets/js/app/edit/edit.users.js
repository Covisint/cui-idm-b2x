angular.module('app')
.controller('userEditCtrl',['localStorageService', '$scope','Person','$stateParams', 
function(localStorageService, $scope,Person,$stateParams){
    var userEdit=this;

    Person.getById($stateParams.id)
    .then(function(res){
        userEdit.user=res.data;
    })
    .catch(function(err){
        console.log(err);
    });


    userEdit.save=function(){
        Person.update($stateParams.id,userEdit.user);
    };

}]);