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
    orgDetails.suspend = (personId) => {

        orgDetails.suspend.begun = (orgDetails.suspend.begun)? false:true
        orgDetails.unsuspend.begun = (orgDetails.unsuspend.begun)? false:false
        orgDetails.specifyPassword.begun = (orgDetails.specifyPassword.begun)? false:false
        orgDetails.resetPassword.begun = (orgDetails.resetPassword.begun)? false:false

        const name = 'orgDetails.suspend'

        orgDetails.suspend.reset = () => {
            Loader.offFor(name)
            APIError.offFor(name)
            orgDetails.user.suspendReason = ''
            orgDetails.suspend.success && delete orgDetails.suspend.success
        }

        orgDetails.suspend.reset()

        orgDetails.suspend.confirm = () => {
            Loader.onFor(name)
            APIError.offFor(name)

            const reason = encodeURIComponent(orgDetails.user.suspendReason)

            API.cui.suspendPerson({
                qs: APIHelpers.getQs({
                    personId,
                    reason
                })
            })
            .then(
                res => {
                    APIError.offFor(name)
                    orgDetails.suspend.success = true
                    orgDetails.user.status = 'suspended'
                    $timeout(orgDetails.suspend.cancel, 1500)
                },
                err => {
                    APIError.onFor(name)
                }
            )
            .always(() => {
                Loader.offFor(name)
                $scope.$digest()
            })
        }

        orgDetails.suspend.cancel = () => {
            orgDetails.suspend.begun = false
            orgDetails.suspend.reset()
        }
    }

    orgDetails.unsuspend = (personId) => {
        orgDetails.unsuspend.begun = (orgDetails.unsuspend.begun)? false:true
        orgDetails.suspend.begun = (orgDetails.suspend.begun)? false:false
        orgDetails.specifyPassword.begun = (orgDetails.specifyPassword.begun)? false:false
        orgDetails.resetPassword.begun = (orgDetails.resetPassword.begun)? false:false

        const name = 'orgDetails.unsuspend'

        orgDetails.unsuspend.reset = () => {
            Loader.offFor(name)
            APIError.offFor(name)
            orgDetails.user.unsuspendReason = ''
            orgDetails.unsuspend.success && delete orgDetails.unsuspend.success
        }

        orgDetails.unsuspend.reset()

        orgDetails.unsuspend.confirm = () => {
            Loader.onFor(name)
            APIError.offFor(name)

            const reason = encodeURIComponent(orgDetails.user.unsuspendReason)

            API.cui.unsuspendPerson({
                qs: APIHelpers.getQs({
                    personId,
                    reason
                })
            })
            .then(
                res => {
                    APIError.offFor(name)
                    orgDetails.unsuspend.success = true
                    orgDetails.user.status = 'active'
                    $timeout(orgDetails.unsuspend.cancel, 1500)
                },
                err => {
                    APIError.onFor(name)
                }
            )
            .always(() => {
                Loader.offFor(name)
                $scope.$digest()
            })
        }

        orgDetails.unsuspend.cancel = () => {
            orgDetails.unsuspend.begun = false
            orgDetails.unsuspend.reset()
        }
    }

    /* --------------------------------------------- ON CLICK END ---------------------------------------------- */
})
