angular.module('common')
.controller('baseCtrl', function(Base, $scope) {

    $scope.base = Base
})

.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
})
