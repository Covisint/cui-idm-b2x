angular.module('user')
.controller('userProfileCtrl', (API,Timezones,User,UserProfile,$cuiI18n,$scope,$timeout) => {

    const userProfile = this;
    const userId = User.user.id

    userProfile.loading = true;
    userProfile.saving = true;
    userProfile.fail = false;
    userProfile.success = false;
    userProfile.timezoneById = Timezones.timezoneById;
    userProfile.toggleOffFunctions = {};
    UserProfile.injectUI(userProfile, $scope, userId);

    // ON LOAD START ---------------------------------------------------------------------------------

    UserProfile.getProfile({personId: userId})
    .then(function(res) {
        angular.merge(userProfile, res);
        userProfile.loading = false;
    }, function(err) {
        userProfile.loading = false;
    });

    // ON LOAD END -----------------------------------------------------------------------------------

});
