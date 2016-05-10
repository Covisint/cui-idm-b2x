angular.module('organization')
.controller('userDetailsRolesCtrl',['API','$stateParams','$q',
function(API,$stateParams,$q) {

	const userDetailsRoles = this,
        userId = $stateParams.userID,
        organizationId = $stateParams.orgID;

    let apiPromises = [];

}]);
