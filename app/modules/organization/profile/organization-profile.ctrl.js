angular.module('organization')
.controller('orgProfileCtrl', function(DataStorage, Loader, Organization, User) {

    const orgProfile = this
    const storedData = DataStorage.getType('orgProfile')

    orgProfile.organization = User.user.organization

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    if (storedData !== undefined) {
        orgProfile.securityAdmins = storedData.admins
        orgProfile.passwordPolicy = storedData.passwordPolicy
    }
    else Loader.onFor('orgProfile.init')

    Organization.initOrganizationProfile(orgProfile.organization.id, orgProfile.organization.passwordPolicy.id)
    .then(res => {
        orgProfile.securityAdmins = res.admins
        orgProfile.passwordPolicy = res.passwordPolicy
        DataStorage.setType('orgProfile', res)
        Loader.offFor('orgProfile.init')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
