angular.module('common')
.controller('baseCtrl', ['Base','Theme','$scope', function(Base,Theme,$scope) {

	$scope.base = Base;
  $scope.base.theme = Theme;

}]);
