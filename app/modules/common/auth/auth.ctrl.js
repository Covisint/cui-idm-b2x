angular.module('common')
.controller('authCtrl', ['$state',function($state) {
    $state.go('welcome');
}]);
