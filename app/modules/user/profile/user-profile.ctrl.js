angular.module('user')
.controller('userProfileCtrl', function(Loader, User, UserProfile, $scope) {

    const userProfile = this
    const scopeName = 'userProfile.'

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    UserProfile.injectUI(userProfile, $scope, User.user.id)

    Loader.onFor(scopeName + 'initProfile')

    UserProfile.initUserProfile(User.user.id, User.user.organization.id)
    .then(res => {
        angular.merge(userProfile, res)
        Loader.offFor(scopeName + 'initProfile')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
