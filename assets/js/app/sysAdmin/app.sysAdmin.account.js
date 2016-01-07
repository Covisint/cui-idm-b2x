angular.module('app')
.controller('sysAdminAccountCtrl',['$scope', 
	function($scope) {
		var sysAdminAccount = this;

		sysAdminAccount.tosError = [
			{
				test: "test",
				name: 'tosRequired',
				check: function() {
					return sysAdminAccount.tos;
				}
			}
		];
}]); 
