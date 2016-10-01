angular.module('organization')
.controller('orgProfileCtrl', function(API,APIError,DataStorage,Loader,User,$scope,$state,$timeout) {

    const orgProfile = this
    const eventName = 'orgProfile.init'

    orgProfile.organization = User.user.organization
    orgProfile.organization ? APIError.offFor(eventName) : APIError.onFor(eventName)

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    const storedData = DataStorage.getType('orgProfile')

    if (storedData) {
        orgProfile.securityAdmins = storedData
    }

    if (storedData || orgProfile.organization) {
        if (!storedData) Loader.onFor(eventName)

        API.cui.getPersonsAdmins({qs: [['organization.id', orgProfile.organization.id], ['securityadmin', true]]})
        .done(res => {
            orgProfile.securityAdmins = res
            DataStorage.setType('orgProfile', res)
        })
        .fail(err => {
            console.error('Error getting organization admin information', err)
            APIError.onFor(eventName)
            $timeout(() => {
                APIError.offFor(eventName)
            }, 5000)
        })
        .always(() => {
            Loader.offFor(eventName)
            $scope.$digest()
        })
    }

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
