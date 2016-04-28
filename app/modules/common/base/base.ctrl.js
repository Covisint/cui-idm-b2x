angular
.module('common')
.controller('baseCtrl', ['Base','$scope', function(Base,$scope) {

	$scope.base = this;
	$scope.base = Base;

}]);
