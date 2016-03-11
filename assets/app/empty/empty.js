angular.module('app')
.controller('emptyCtrl',['$scope','API','$window','$state', function($scope,API,$window,$state) {

    // This empty controller is used to prevent an authHandler loop in the JWT token process!
    console.log('IM IN EMPTY CTR');
    $state.go('applications.myApplications');

}]);
