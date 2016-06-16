angular.module('common')
.factory('CustomAPI',()=>{

    const calls = [
        {cmd: 'getPackageClaims',                        accepts: 'application/vnd.com.covisint.platform.package.claim.v1+json',                         call: '/service/v3/claims',																type: 'GET' },

        {cmd: 'getPersonPackageClaims',                  accepts: 'application/vnd.com.covisint.platform.package.grant.claim.v1+json',                   call: `/service/v3/persons/${ '{grantee}' }/packages/${ '{packageId}' }/claims`,			type: 'GET' },

        {cmd: 'getCategories',                           accepts: 'application/vnd.com.covisint.platform.category.v1+json',                              call: `/service/v3/categories`, 															type: 'GET' },

        {cmd: 'getPersonRequestableApps',                accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',                   call: `/service/v3/applications/persons/${ '{personId}' }/requestable`, 					type: 'GET' },

        {cmd: 'getPersonRequestableCount',               accepts: 'text/plain',                                          							     call: `/service/v3/applications/persons/${ '{personId}' }/requestable/count`, 				type: 'GET'},

        {cmd: 'getPersonGrantedApps',                    accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',                   call: `/service/v3/applications/persons/${ '{personId}' }`, 								type: 'GET' },

        {cmd: 'getPersonGrantedCount',                   accepts: 'text/plain',                                          							     call: `/service/v3/applications/persons/${ '{personId}' }/count`, 							type: 'GET' },

        {cmd: 'getOrganizationRequestableApps',          accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',                   call: `/service/v3/applications/organizations/${ '{organizationId}' }`, 					type: 'GET' },

        {cmd: 'getOrganizationRequestableCount',         accepts: 'text/plain',                                          							     call: `/service/v3/applications/organizations/${ '{organizationId}' }/requestable/count`, 	type: 'GET' },

        {cmd: 'getOrganizationGrantedApps',              accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',                   call: `/service/v3/applications/organizations/${ '{organizationId}' }`, 					type: 'GET' },

        {cmd: 'getOrganizationGrantedCount',             accepts: 'text/plain',                                          							     call: `/service/v3/applications/organizations/${ '{organizationId}' }/count`, 				type: 'GET' },

        {cmd: 'getPersonGrantableApps',                  accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',                   call: `/service/v3/applications/persons/${ '{personId}' }/grantable`, 						type: 'GET' },

        {cmd: 'getPersonGrantableCount',                 accepts: 'text/plain',                                          							     call: `/service/v3/applications/persons/${ '{personId}' }/grantable/count`, 				type: 'GET' },

        {cmd: 'getOrganizationGrantableApps',            accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',                   call: `/service/v3/applications/organizations/${ '{organizationId}' }/grantable`, 			type: 'GET' },

        {cmd: 'getOrganizationGrantableCount',           accepts: 'text/plain',                                          							     call: `/service/v3/applications/persons/${ '{organizationId}' }/grantable/count`, 			type: 'GET' },

        {cmd: 'getPersonStatusHistory',                  accepts: 'application/vnd.com.covisint.platform.person.status.history.v1+json',                 call: '/person/v3/persons/statusHistory', 													type: 'GET' },

        {cmd: 'getPersonPasswordChangeHistory',          accepts: 'application/vnd.com.covisint.platform.authn.password.change.history.req.v1+json',     call: `/authentication/v4/passwords/changeHistory`, 										type: 'GET' },

        {cmd: 'getPersonPendingServicePackages',         accepts: 'application/vnd.com.covisint.platform.package.request.v1+json',                       call: `/service/v3/requests`, 																type: 'GET' },

        {cmd: 'getPackage',                              accepts: 'application/vnd.com.covisint.platform.package.v1+json',                               call: `/service/v3/packages/${ '{packageId}' }`, 											type: 'GET' },

        {cmd: 'denyPackage',                             accepts: 'text/plain',                                          							     call: `/service/v3/requests/tasks/deny`,                                                    type: 'POST' },

        {cmd: 'approvePackage',                          accepts: 'text/plain',                                          							     call: `/service/v3/requests/tasks/approve`,                                                 type: 'POST' },

        {cmd: 'grantClaims',                             accepts: 'application/vnd.com.covisint.platform.package.grant.claim.v1+json',                   call: `/service/v3/packages/grants/claims`,                                                 type: 'PUT' },

        {cmd: 'getOrganizationRegistrationRequest',      accepts: 'application/vnd.com.covisint.platform.organization.request.v1+json',                  call: `/organization/v3/requests`,                                                          type: 'GET' },

        {cmd: 'getPersonRegistrationRequest',            accepts: 'application/vnd.com.covisint.platform.person.request.v1+json',                        call: `/person/v3/requests`,                                                                type: 'GET' },

        {cmd: 'approvePersonRegistration',               accepts: 'application/vnd.com.covisint.platform.person.request.v1+json',                        call: `/person/v3/requests/tasks/approve`,                                                  type: 'POST' },

        {cmd: 'denyPersonRegistration',                  accepts: 'application/vnd.com.covisint.platform.person.request.v1+json',                        call: `/person/v3/requests/tasks/deny`,                                                     type: 'POST' },

        {cmd: 'getAllOrganizationRequests',              accepts: 'application/vnd.com.covisint.platform.organization.request.v1+json',                  call: `/organization/v3/requests`,                                                          type: 'GET' },

        {cmd: 'grantPersonPackage',                      accepts: 'application/vnd.com.covisint.platform.package.grant.v1+json',                         call: `/service/v3/applications/persons/${ '{personId}' }/packages/${ '{packageId}' }`,     type: 'PUT' },
    ];

    return calls;

});
