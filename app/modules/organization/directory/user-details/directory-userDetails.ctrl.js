angular.module('organization')
.controller('userDetailsCtrl', function(API, Loader, CuiMobileNavFactory, $scope, $stateParams) {

    const userDetails = this
    const scopeName = 'userDetails.'
    userDetails.stateParamsOrgId=$stateParams.orgId
    userDetails.mobileHandler = 'profile'
    userDetails.profileRolesSwitch = 'profile'
    userDetails.appsHistorySwitch = 'apps'

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(scopeName + 'userInfo')

    API.cui.getPerson({ personId: $stateParams.userId })
    .then(res => {
        userDetails.user = res
        CuiMobileNavFactory.setTitle(res.name.given + '.' + res.name.surname)
    })
    .fail(error => {
        console.error('Failed getting user information')
    })
    .always(() => {
        Loader.offFor(scopeName + 'userInfo')
        $scope.$digest()
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
