angular.module('organization')
.controller('orgProfileCtrl', function(DataStorage, Loader, Organization, User,$stateParams,$q,APIError) {

    const orgProfile = this
    const storedData = DataStorage.getType('orgProfile')
    orgProfile.stateParamsOrgId=$stateParams.orgId
    let orgPromise=[]
    if (User.user.organization.id===$stateParams.orgId) {
        orgProfile.organization = User.user.organization
    }
    else{
        // Organization is different than user's org, need to get fresh
        Loader.onFor('orgProfile.init')
        orgPromise.push(Organization.getOrganization($stateParams.orgId))
    }
    

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    if (storedData !== undefined) {
        orgProfile.securityAdmins = storedData.admins
        orgProfile.passwordPolicy = storedData.passwordPolicy
        orgProfile.authenticationPolicy=storedData.authenticationPolicy
    }
    else Loader.onFor('orgProfile.init')
    $q.all(orgPromise)
    .then(res => {
        if (orgPromise.length!==0) {
            orgProfile.organization=res[0]
        }
            Organization.initOrganizationProfile(orgProfile.organization.id, orgProfile.organization.passwordPolicy.id, orgProfile.organization.authenticationPolicy.id)
        .then(res => {
            orgProfile.securityAdmins = res.admins
            orgProfile.passwordPolicy = res.passwordPolicy
            orgProfile.authenticationPolicy=res.authenticationPolicy
            DataStorage.setType('orgProfile', res)
            Loader.offFor('orgProfile.init')
        })
        .catch(err => {
            console.error("there was an error fetching additional org details" +err)
            Loader.offFor('orgProfile.init')
            APIError.onFor('orgProfile.init')
        })
    })
    .catch(err => {
        console.error("there was an error fetching org details" +err)
        Loader.offFor('orgProfile.init')
        APIError.onFor('orgProfile.init')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
