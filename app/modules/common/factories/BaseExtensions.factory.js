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
			},
			canGrantAppToUser: function(){
				return permitted(appConfig.grantAppToUserLogic, User.getRoles(), User.getEntitlements());
			},
			canGrantAppToOrg: function(){
				return permitted(appConfig.grantAppToOrgLogic, User.getRoles(), User.getEntitlements());
			},
			accessByAnyAdmin: function(){
				return permitted(appConfig.accessByAnyAdmin, User.getRoles(), User.getEntitlements());
			},
			globalSearch: function(){
				return permitted(appConfig.globalSearch, User.getRoles(), User.getEntitlements());
			},
			accessToSecurityAndExchangeAdmins:function(){
				return permitted(appConfig.accessToSecurityAndExchangeAdmins, User.getRoles(), User.getEntitlements());
			}
		}
	}])
