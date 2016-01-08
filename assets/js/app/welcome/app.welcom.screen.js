angular.module('app')
.controller('welcomeCtrl',['$scope', 
	function($scope) {
		var welcome = this;
		$scope.modalVisible = false;

		$scope.modalDisplay = function() {
			$scope.modalVisible = !$scope.modalVisible;
		};
}]); 
