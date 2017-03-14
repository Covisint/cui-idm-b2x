angular.module('common')
.factory('CustomAPI', (CustomAPIExtension) => {

    const calls = [
        {
            cmd: 'getPackageClaims',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.package.claim.v1+json',
            call: '/service/v3/claims',
            type: 'GET'
        },
        {
            cmd: 'getPersonPackageClaims',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.package.grant.claim.v1+json',
            call: `/service/v3/persons/${ '{grantee}' }/packages/${ '{packageId}' }/claims`,
            type: 'GET' 
        },
        {
            cmd: 'getCategories',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.category.v1+json',
            call: `/service/v3/categories`,
            type: 'GET' 
        },
        {
            cmd: 'getPersonRequestableApps',            
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',
            call: `/service/v3/applications/persons/${ '{personId}' }/requestable`,
            type: 'GET'
        },
        {
            cmd: 'getPersonRequestableCount',
            accepts: 'text/plain',
            call: `/service/v3/applications/persons/${ '{personId}' }/requestable/count`,
            type: 'GET'
        },
        {
            cmd: 'getPersonGrantedApps',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',
            call: `/service/v3/applications/persons/${ '{personId}' }`,
            type: 'GET'
        },
        {
            cmd: 'getPersonGrantedAppCount',
            cmdType: 'secured',
            accepts: 'text/plain',
            call: `/service/v3/applications/persons/${ '{personId}' }/count`,
            type: 'GET'
        },
        {
            cmd: 'getOrganizationRequestableApps',
            accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',
            call: `/service/v3/applications/organizations/${ '{organizationId}' }`,
            type: 'GET'
        },
        {
            cmd: 'getOrganizationRequestableCount',
            accepts: 'text/plain',
            call: `/service/v3/applications/organizations/${ '{organizationId}' }/requestable/count`,
            type: 'GET'
        },
        {
            cmd: 'getOrganizationGrantedApps',            
            accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',
            call: `/service/v3/applications/organizations/${ '{organizationId}' }`,
            type: 'GET'
        },
        {
            cmd: 'getOrganizationGrantedCount',
            accepts: 'text/plain',
            call: `/service/v3/applications/organizations/${ '{organizationId}' }/count`,
            type: 'GET'
        },
        {
            cmd: 'getPersonGrantableApps',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',
            call: `/service/v3/applications/persons/${ '{personId}' }/grantable`,
            type: 'GET'
        },
        {
            cmd: 'getPersonGrantableCount',
            accepts: 'text/plain',
            call: `/service/v3/applications/persons/${ '{personId}' }/grantable/count`,
            type: 'GET'
        },
        {
            cmd: 'getOrganizationGrantableApps',
            accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',
            call: `/service/v3/applications/organizations/${ '{organizationId}' }/grantable`,
            type: 'GET'
        },
        {
            cmd: 'getOrganizationGrantableCount',
            accepts: 'text/plain',
            call: `/service/v3/applications/organizations/${ '{organizationId}' }/grantable/count`,
            type: 'GET'
        },
        {
            cmd: 'getPersonStatusHistory',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.person.status.history.v1+json',
            call: '/person/v3/persons/statusHistory',
            type: 'GET'
        },
        {
            cmd: 'getPersonPasswordChangeHistory',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.authn.password.change.history.req.v1+json',
            call: `/authentication/v4/passwords/changeHistory`,
            type: 'GET'
        },
        {
            cmd: 'getPersonPendingServicePackages',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.package.request.v1+json',
            call: `/service/v3/requests`,
            type: 'GET'
        },
        {
            cmd: 'getPackage',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.package.v1+json',
            call: `/service/v3/packages/${ '{packageId}' }`,
            type: 'GET'
        },
        {
            cmd: 'denyPackage',
            cmdType: 'secured',
            accepts: 'text/plain',
            type: 'POST',
            call: `/service/v3/requests/tasks/deny`,
        },
        {
            cmd: 'approvePackage',
            cmdType: 'secured',
            accepts: 'text/plain',
            type: 'POST',
            call: `/service/v3/requests/tasks/approve`
        },
        {
            cmd: 'grantClaims',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.package.grant.claim.v1+json',
            call: `/service/v3/packages/grants/claims`,
            type: 'PUT'
        },
        {
            cmd: 'getOrganizationRegistrationRequest',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.organization.request.v1+json',
            call: `/organization/v3/requests`,
            type: 'GET'
        },
        {
            cmd: 'getPersonRegistrationRequest',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.person.request.v1+json',
            call: `/person/v3/requests`,
            type: 'GET'
        },
        {
            cmd: 'approvePersonRegistration',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.person.request.v1+json',
            call: `/person/v3/requests/tasks/approve`,
            type: 'POST'
        },
        {
            cmd: 'denyPersonRegistration',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.person.request.v1+json',
            call: `/person/v3/requests/tasks/deny`,
            type: 'POST'
        },
        {
            cmd: 'getAllOrganizationRequests',
            accepts: 'application/vnd.com.covisint.platform.organization.request.v1+json',
            call: `/organization/v3/requests`,
            type: 'GET'
        },
        {
            cmd: 'getPersonEntitlements',
            cmdType: 'secured',
            contentType: 'application/vnd.com.covisint.platform.person.privilege.v1+json',
            accepts: 'application/vnd.com.covisint.platform.person.privilege.v1+json',
            call: `/person/v3/persons/privileges/${ '{personId}'}`,
            type: 'GET'
        },
        {   cmd: 'getPersonGrantedCount',
            cmdType: 'secured',
            accepts: 'text/plain',
            call: `/person/v3/persons/count`,
            type: 'GET' 
        },
        {
            cmd: 'suspendOrgPkg',
            cmdType: 'secured',
            accepts: 'application/vnd.com.covisint.platform.package.grant.status.request.v1+json',
            contentType: 'application/vnd.com.covisint.platform.package.grant.status.request.v1+json',
            call: `/service/v3/grants/tasks/organization/package/suspend`,
            type: 'POST'
        }
    ]

    return calls.concat(CustomAPIExtension)

})
