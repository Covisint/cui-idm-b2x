angular.module('app')
.controller('tloCtrl',['$scope', function($scope) {
	var newTLO = this;

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
