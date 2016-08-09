angular.module('user')
.controller('userProfileCtrl', function(Loader, User, UserProfileV2, $scope) {

    const userProfile = this
    const scopeName = 'userProfile.'

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    UserProfileV2.injectUI(userProfile, $scope, User.user.id)

    Loader.onFor(scopeName + 'initProfile')

    UserProfileV2.initUserProfile(User.user.id, User.user.organization.id)
    .then(res => {
        angular.merge(userProfile, res)
        Loader.offFor(scopeName + 'initProfile')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
