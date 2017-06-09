angular.module('common')
.controller('baseCtrl', function(Base, $scope) {

    $scope.base = Base
    $scope.base.pendingNotificationFlag=false
})

.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
})

.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
})
