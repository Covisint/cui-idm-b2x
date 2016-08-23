angular.module('organization')
.controller('userDetailsProfileCtrl', function(Loader, UserProfileV2, $scope, $stateParams) {

	const userDetailsProfile = this
    const scopeName = 'userDetailsProfile.'

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    UserProfileV2.injectUI(userDetailsProfile, $scope, $stateParams.userID)

    Loader.onFor(scopeName + 'initProfile')

    UserProfileV2.initUserProfile($stateParams.userID, $stateParams.orgID)
    .then(res => {
        angular.merge(userDetailsProfile, res)
        Loader.offFor(scopeName + 'initProfile')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
