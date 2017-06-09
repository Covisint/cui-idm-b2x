angular.module('user')
.controller('userHistoryCtrl', function(Loader, User, UserHistory, $scope) {

    const userHistory = this
    const scopeName = 'userHistory.'
    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */

    /* -------------------------------------------- HELPER FUNCTIONS END ----------------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */
    UserHistory.injectUI(userHistory, $scope, User.user.id)
    userHistory.user=User.user;  //give user info to userhistory
    userHistory.lastLogin=User.user.lastLoginDate
    userHistory.userName=User.user.name;
    Loader.onFor(scopeName + 'initHistory')
    UserHistory.initUserHistory(User.user.id)
    .then(res => {
        angular.merge(userHistory, res)
        Loader.offFor(scopeName + 'initHistory')
    })

    /* -------------------------------------------- ON LOAD END --------------------------------------------- */
    
})