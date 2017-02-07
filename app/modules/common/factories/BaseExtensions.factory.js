angular.module('common')
	.factory('BaseExtensions', (User) => {

		// -------------------
		function permitted(options) {
			function hasAny(superset, subset) {
				return ! _.isEmpty( _.intersection(subset, superset) );
			}
			function hasAll(superset, subset) {
				return _.isEmpty( _.difference(subset, superset) );
			}
			function has(obj, superset) {
				if (obj) {
					if (obj.all) {
						return hasAll(superset, obj.all);
					} else if (obj.any) {
						return hasAny(superset, obj.any);
					} else {
						return false;
					}
				} else {
					return true;
				}
			}

			var rc = false;
			var hasRoles = false;
			var hasEntitlements = false;

			if (options) {
				if (options.all) {
					hasRoles = has(options.all.roles, User.getRoles());
					hasEntitlements = has(options.all.entitlements, User.getEntitlements());
					rc = hasRoles && hasEntitlements;
				} else if (options.any) {
					hasRoles = has(options.any.roles, User.getRoles());
					hasEntitlements = has(options.any.entitlements, User.getEntitlements());
					rc = hasRoles || hasEntitlements;
				} else {
					rc = false;
				}
			} else {
				rc = false;
			}

			cui.log('permitted', options, User.getRoles(), User.getEntitlements(), rc, hasRoles, hasEntitlements);
			return rc;
		};
		// -------------------


		function test() {
			cui.log('base extensions test');
			return true;
		}


		return {
			/**
		    Any method that you add here will be available in your base controller
		    which has a scope that is available throughout the app
			**/
			test: function() {
				return test();
			},
			permitted: function(options) {
				return permitted(options);
			}

		}
	})
