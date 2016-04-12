angular.module('app')
.controller('userProfileCtrl',['$scope','$timeout','API','$cuiI18n','Timezones','UserService',
function($scope,$timeout,API,$cuiI18n,Timezones,UserService){
    'use strict';
    var userProfile = this;

    userProfile.loading = true;
    userProfile.saving = true;
    userProfile.fail = false;
    userProfile.success = false;
    userProfile.timezoneById = Timezones.timezoneById;
    userProfile.toggleOffFunctions = {};
    UserService.injectUI( userProfile, $scope );

   // ON LOAD START ---------------------------------------------------------------------------------

    UserService.getProfile( {personId: API.getUser(), useCuid:true}).then(function(res){
        angular.copy( res, userProfile );
        userProfile.loading = false;
    },function(err){
        userProfile.loading = false;
    });
}]);
