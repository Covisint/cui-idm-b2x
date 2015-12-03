angular.module('app')
.controller('usersEditCtrl',['localStorageService','$scope','Person','$stateParams', 
function(localStorageService,$scope,Person,$stateParams){
    var usersEdit=this;
    usersEdit.loading=true;

    Person.getById($stateParams.id)
    .then(function(res){
        usersEdit.loading=false;
        usersEdit.user=res.data;
    })
    .catch(function(err){
        usersEdit.loading=false
        console.log(err);
    });


    usersEdit.save=function(){
        Person.update($stateParams.id,usersEdit.user);
    };

}]);