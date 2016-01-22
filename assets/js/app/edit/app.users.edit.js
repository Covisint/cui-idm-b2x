angular.module('app')
.controller('usersEditCtrl',['localStorageService','$scope','$stateParams','$timeout','API',
function(localStorageService,$scope,$stateParams,$timeout,API){
    var usersEdit = this;
    usersEdit.loading = true;

    API.doAuth()
    .then(function(res) {
        return  API.cui.getPerson({personId:$stateParams.id});
    })
    .then(function(res){
        usersEdit.user=res;
        return API.cui.getPersonPassword({personId: usersEdit.user.id})
    })
    .then(function(res){
        usersEdit.userPassword = res;
        $scope.$apply();
        usersEdit.loading = false;
    })
    .fail(function(err){
        $scope.$apply();
        usersEdit.loading = false;
    });

    usersEdit.save=function(){
        usersEdit.saving = true;
        usersEdit.fail = false;
        usersEdit.success = false;
        API.cui.updatePerson({personId:$stateParams.id,data:usersEdit.user}).
        then(function(res) {
            $timeout(function() {
                usersEdit.saving = false;
                usersEdit.success = true;
            },300);
        })
        .fail(function(err) {
            $timeout(function() {
                usersEdit.saving = false;
                usersEdit.fail = true;
            },300);
        });
    };

}]);