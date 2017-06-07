angular.module('organization')
.controller('orgDetailsProfileCtrl', function(Loader, UserProfile, $scope, $stateParams) {

	const orgDetailsProfile = this
    const scopeName = 'orgDetailsProfile.'

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    UserProfile.injectUI(orgDetailsProfile, $scope, $stateParams.userId)

    Loader.onFor(scopeName + 'initProfile')

    UserProfile.initUserProfile($stateParams.userId, $stateParams.orgId)
    .then(res => {
        angular.merge(orgDetailsProfile, res)
        Loader.offFor(scopeName + 'initProfile')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
