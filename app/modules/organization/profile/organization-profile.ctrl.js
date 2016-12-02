angular.module('organization')
.controller('orgProfileCtrl', function(DataStorage, Loader, Organization, User) {

    const orgProfile = this
    const storedData = DataStorage.getType('orgProfile')

    orgProfile.organization = User.user.organization

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    if (storedData !== undefined) {
        orgProfile.securityAdmins = storedData.admins
        orgProfile.passwordPolicy = storedData.passwordPolicy
        orgProfile.authenticationPolicy=storedData.authenticationPolicy
    }
    else Loader.onFor('orgProfile.init')

    Organization.initOrganizationProfile(orgProfile.organization.id, orgProfile.organization.passwordPolicy.id, orgProfile.organization.authenticationPolicy.id)
    .then(res => {
        orgProfile.securityAdmins = res.admins
        orgProfile.passwordPolicy = res.passwordPolicy
        orgProfile.authenticationPolicy=res.authenticationPolicy
        DataStorage.setType('orgProfile', res)
        Loader.offFor('orgProfile.init')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
