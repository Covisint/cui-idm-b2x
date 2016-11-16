angular.module('organization')
.controller('userDetailsProfileCtrl', function(Loader, UserProfile, $scope, $stateParams) {

	const userDetailsProfile = this
    const scopeName = 'userDetailsProfile.'

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    UserProfile.injectUI(userDetailsProfile, $scope, $stateParams.userId)

    Loader.onFor(scopeName + 'initProfile')

    UserProfile.initUserProfile($stateParams.userId, $stateParams.orgId)
    .then(res => {
        angular.merge(userDetailsProfile, res)
        Loader.offFor(scopeName + 'initProfile')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
