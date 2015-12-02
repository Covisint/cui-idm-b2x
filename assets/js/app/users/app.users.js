angular.module('app')
.controller('usersCtrl',['localStorageService', '$scope','API', function(localStorageService, $scope, API){
    var users=this;

    API.cui.getUsers()
    .then(function(res){
        users.list=res;
        $scope.$apply();
    })
    .fail(function(err){
        // console.log(err);
    });


    // $scope.$watchCollection('users.search',search); once Mitchs library supports search params

}]);