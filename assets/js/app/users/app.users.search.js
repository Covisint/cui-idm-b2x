angular.module('app')
.controller('usersSearchCtrl',['localStorageService', '$scope','API', function(localStorageService, $scope, API){
    var usersSearch=this;

    usersSearch.listLoading=true;
    API.cui.getUsers()
    .then(function(res){
        usersSearch.listLoading=false;
        usersSearch.list=res;
        usersSearch.list.splice(0,4); // removes superusers, won't be needed after cui.js uses 3legged auth
        $scope.$apply();
    })
    .fail(function(err){
        usersSearch.listLoading=false;
        // console.log(err);
    });


    var search=function(){
        API.cui.getUser({data:usersSearch.search})
        .then(function(res){
            usersSearch.list=res;
            $scope.$apply();
        })
        .fail(function(err){
            // TBD : error handling
            // console.log(err);
        });
    };

    $scope.$watchCollection('usersSearch.search',search); 




}]);