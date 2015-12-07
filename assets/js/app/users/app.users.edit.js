angular.module('app')
.controller('usersEditCtrl',['localStorageService','$scope','Person','$stateParams','$timeout', 
function(localStorageService,$scope,Person,$stateParams,$timeout){
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
        usersEdit.saving=true;
        usersEdit.fail=false;
        usersEdit.success=false;
        Person.update($stateParams.id,usersEdit.user).
        then(function(res){
            $timeout(function(){
                usersEdit.saving=false;
                usersEdit.success=true;
            },300);
        })
        .catch(function(err){
            $timeout(function(){
                usersEdit.saving=false;
                usersEdit.fail=true;
            },300);
        });
    };

}]);