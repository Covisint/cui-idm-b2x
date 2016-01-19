angular.module('app')
.controller('usersEditCtrl',['localStorageService','$scope','$stateParams','$timeout','API',
function(localStorageService,$scope,$stateParams,$timeout,API){
    var usersEdit=this;
    usersEdit.loading=true;

    API.doAuth()
    .then(function(){
        API.cui.getPerson({personId:$stateParams.id})
        .then(function(res){
            usersEdit.loading=false;
            usersEdit.user=res;
            $scope.$apply();
        })
        .fail(function(err){
            usersEdit.loading=false;
            console.log(err);
        });
    });


    usersEdit.save=function(){
        usersEdit.saving=true;
        usersEdit.fail=false;
        usersEdit.success=false;
        API.cui.updatePerson({personId:$stateParams.id,data:usersEdit.user}).
        then(function(res){
            $timeout(function(){
                usersEdit.saving=false;
                usersEdit.success=true;
            },300);
        })
        .fail(function(err){
            $timeout(function(){
                usersEdit.saving=false;
                usersEdit.fail=true;
            },300);
        });
    };

}]);