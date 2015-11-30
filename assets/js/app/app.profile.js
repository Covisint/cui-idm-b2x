angular.module('app')
.controller('profileManagementCtrl',['localStorageService', '$scope', function(localStorageService, $scope){
    var profile=this;

    profile.save=function(){
        // Currently the save function just saves to local storage
        // However, once the API library is in place this will be easily
        // replacable with a function to send a PUT to the API.
        localStorageService.set('profile.user',$scope.profile.user);
    };

     var profileInStorage = localStorageService.get('profile.user');
        profile.user = profileInStorage || {};
        // This watch function saves the user form to local storage every time there's a change
        $scope.$watch('profile.user',function(){
            localStorageService.set('profile.user',$scope.profile.user);
        }, true);
}]);