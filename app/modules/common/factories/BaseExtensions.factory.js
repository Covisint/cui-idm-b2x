angular.module('common')
	.factory('BaseExtensions', ['cui.authorization.permitted', 'User', (permitted, User) => {

		function test() {
			cui.log('base extensions test');
			return true;
		}

		return {
			test: function() {
				return test();
			},
			isPermitted: function(logic) {
				//cui.log('isPermitted', logic, User.getRoles(), User.getEntitlements());
				return permitted(logic, User.getRoles(), User.getEntitlements());
			},
			isOrgAdmin: function() {
				//cui.log('isOrgAdmin', appConfig.orgAdminLogic, User.getRoles(), User.getEntitlements());
				return permitted(appConfig.orgAdminLogic, User.getRoles(), User.getEntitlements());
			}
		}
	}])
