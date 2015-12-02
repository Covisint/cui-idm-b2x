angular.module('app')
.controller('profileManagementCtrl',['localStorageService', '$scope','Person', function(localStorageService, $scope,Person){
    var profile=this;

    Person.getById("OGEXKB93")
    .then(function(res){
        profile.user=res.data;
    })
    .catch(function(err){
        console.log(err);
    });


    profile.save=function(){
        Person.update("OGEXKB93",profile.user);
    };

}]);