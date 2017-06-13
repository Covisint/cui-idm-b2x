angular.module('organization')
.controller('orgDetailsCtrl', function(API, Loader, $scope, $stateParams,APIError,APIHelpers,$timeout,$q) {

    const orgDetails = this
    const scopeName = 'orgDetails.'
    orgDetails.prevState={
        params:{
            orgId:$stateParams.orgId
        },
        name:"organization.directory.userList"
    }
    orgDetails.mobileHandler = 'profile'
    orgDetails.profileUsersSwitch = 'profile'
    orgDetails.appsHierarchySwitch = 'apps'

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(scopeName + 'orgInfo')
/*
    API.cui.getPerson({ personId: $stateParams.userId })
    .then(res => {
        orgDetails.user = res
        CuiMobileNavFactory.setTitle(res.name.given + '.' + res.name.surname)
    })
    .fail(error => {
        console.error('Failed getting user information')
    })
    .always(() => {
        Loader.offFor(scopeName + 'userInfo')
        $scope.$digest()
    })*/


    const apiPromises = [
        API.cui.getOrganization({ organizationId: $stateParams.orgId  })
    ]

    $q.all(apiPromises)
    .then(([organization]) => {
        // CuiMobileNavFactory.setTitle(user.name.given + '.' + user.name.surname)
        orgDetails.organization = Object.assign({}, organization);
        Loader.offFor(scopeName + 'orgInfo')
    })
    .catch(() => {
        Loader.offFor(scopeName + 'orgInfo')
        APIError.onFor('orgDetails.org')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------------- ON CLICK START ---------------------------------------------- */

    /* --------------------------------------------- ON CLICK END ---------------------------------------------- */
})
