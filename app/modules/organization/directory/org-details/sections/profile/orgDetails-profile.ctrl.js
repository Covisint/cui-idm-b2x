angular.module('organization')
.controller('orgDetailsProfileCtrl', function(Loader, Organization,$stateParams,$q,APIError) {

	const orgDetailsProfile = this
    const scopeName = 'orgDetailsProfile.'

    orgDetailsProfile.stateParamsOrgId=$stateParams.orgId
    let orgPromise=[]    

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */
    Loader.onFor('orgDetailsProfile.init')
    orgPromise.push(Organization.getOrganization($stateParams.orgId))
    $q.all(orgPromise)
    .then(res => {
        if (orgPromise.length!==0) {
            orgDetailsProfile.organization=res[0]
        }
            Organization.initOrganizationProfile(orgDetailsProfile.organization.id, orgDetailsProfile.organization.passwordPolicy.id, orgDetailsProfile.organization.authenticationPolicy.id)
        .then(res => {
            orgDetailsProfile.securityAdmins = res.admins
            orgDetailsProfile.passwordPolicy = res.passwordPolicy
            orgDetailsProfile.authenticationPolicy=res.authenticationPolicy
            orgDetailsProfile.statusHistory=res.statusHistory
            Loader.offFor('orgDetailsProfile.init')
        })
        .catch(err => {
            console.error("there was an error fetching additional org details" +err)
            Loader.offFor('orgDetailsProfile.init')
            APIError.onFor('orgDetailsProfile.init')
        })
    })
    .catch(err => {
        console.error("there was an error fetching org details" +err)
        Loader.offFor('orgDetailsProfile.init')
        APIError.onFor('orgDetailsProfile.init')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */
    /* --------------------------------------------- ON CLICK START ---------------------------------------------- */

    orgDetailsProfile.updateSearch = (status) => {
        Loader.onFor('orgDetailsProfile.status')
        Organization.getOrganizationStatusHistory(orgDetailsProfile.organization.id,status)
        .then(res => {
            orgDetailsProfile.statusHistory=res
        })
        .catch(err => {
            APIError.onFor('orgDetailsProfile.status')
        })
        .finally(() =>{
            Loader.offFor('orgDetailsProfile.status')
        })
    }

    /* --------------------------------------------- ON CLICK END ---------------------------------------------- */

})
