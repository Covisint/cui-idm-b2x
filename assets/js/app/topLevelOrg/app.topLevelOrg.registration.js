angular.module('app')
.controller('tloCtrl',['$scope', function($scope) {
	var newTLO = this;
	$scope.popoverVisible = false;

	newTLO.tosError = [
		{
			test: "test",
			name: 'tosRequired',
			check: function() {
				return newTLO.tos;
			}
		}
	];
	
}]); 
