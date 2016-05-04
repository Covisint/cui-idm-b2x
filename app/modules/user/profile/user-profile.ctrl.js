angular.module('user')
.controller('userProfileCtrl',['$scope','$timeout','API','$cuiI18n','Timezones','UserProfile',
function($scope,$timeout,API,$cuiI18n,Timezones,UserProfile) {
    'use strict';
    const userProfile = this;

    userProfile.loading = true;
    userProfile.saving = true;
    userProfile.fail = false;
    userProfile.success = false;
    userProfile.timezoneById = Timezones.timezoneById;
    userProfile.toggleOffFunctions = {};
    UserProfile.injectUI(userProfile, $scope);

    // ON LOAD START ---------------------------------------------------------------------------------

    UserProfile.getProfile({personId: API.getUser(), useCuid:true})
    .then(function(res) {
        angular.merge(userProfile, res);
        userProfile.loading = false;
    }, function(err) {
        userProfile.loading = false;
    });

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
