angular.module('common')
.factory('CustomAPI',[()=>{

    const urls = [
        // {name: 'STG', url: 'https://apistgdev.np.covapp.io'}
    ];

    const calls = [
        {cmd: 'getPackageClaims',                        accepts: '.platform.package.claim.v1',                     call: '/service/v3/claims'},

        {cmd: 'getPersonPackageClaims',                  accepts: '.platform.package.grant.claim.v1',               call: `/service/v3/persons/${ '{grantee}' }/packages/${ '{packageId}' }/claims`},

        {cmd: 'getCategories',                           accepts: '.platform.category.v1',                          call: `/service/v3/categories`},

        {cmd: 'getPersonRequestableApps',                accepts: '.platform.service.application.v1',               call: `/service/v3/applications/persons/${ '{personId}' }/requestable`},

        {cmd: 'getPersonRequestableCount',               accepts: 'text/plain',                                     call: `/service/v3/applications/persons/${ '{personId}' }/requestable/count`},

        {cmd: 'getPersonGrantedApps',                    accepts: '.platform.service.application.v1',               call: `/service/v3/applications/persons/${ '{personId}' }`},

        {cmd: 'getPersonGrantedCount',                   accepts: 'text/plain',                                     call: `/service/v3/applications/persons/${ '{personId}' }/count`},

        {cmd: 'getOrganizationRequestableApps',          accepts: '.platform.service.application.v1',               call: `/service/v3/applications/organizations/${ '{organizationId}' }/requestable`},

        {cmd: 'getOrganizationRequestableCount',         accepts: 'text/plain',                                     call: `/service/v3/applications/organizations/${ '{organizationId}' }/requestable/count`},

        {cmd: 'getOrganizationGrantedApps',              accepts: '.platform.service.application.v1',               call: `/service/v3/applications/organizations/${ '{organizationId}' }`},

        {cmd: 'getOrganizationGrantedCount',             accepts: 'text/plain',                                     call: `/service/v3/applications/organizations/${ '{organizationId}' }/count`},

        {cmd: 'getPersonGrantableApps',                  accepts: '.platform.service.application.v1',               call: `/service/v3/applications/persons/${ '{personId}' }/grantable`},

        {cmd:'getPersonGrantableCount',                  accepts: 'text/plain',                                     call: `/service/v3/applications/persons/${ '{personId}' }/grantable/count`},

        {cmd:'getOrganizationGrantableApps',             accepts:'.platform.service.application.v1',                call: `/service/v3/applications/oeganizations/${ '{organizationId}' }/grantable`},

        {cmd:'getOrganizationGrantableCount',            accepts: 'text/plain',                                     call: `/service/v3/applications/persons/${ '{organizationId}' }/grantable/count`},

        {cmd: 'getPersonStatusHistory',                  accepts: '.platform.person.status.history.v1',             call: '/person/v3/persons/statusHistory' },

        {cmd: 'getPersonPasswordChangeHistory',          accepts: '.platform.authn.password.change.history.req.v1', call: `/authentication/v4/passwords/changeHistory` },

        {cmd: 'getPersonPendingServicePackages',         accepts: '.platform.package.request.v1',                   call: `/service/v3/requests` },

        {cmd: 'grantClaims',                             accepts: '.platform.package.grant.claim.v1',               call: `/packages/grants/claims`,   type:'POST' }
    ];

    const getCallWrappers = (cuiObject) => {
        return calls.reduce((wrappers,call) => {
            wrappers[call.cmd] = (opts) => {
                if(!opts) opts = {};

                if(call.type) opts.type = call.type;
                else opts.type = 'GET';

                if(opts.type==='POST' || opts.type==='PUT') {
                    opts.data = JSON.stringify(opts.data);
                }

                if(call.accepts === 'text/plain') opts.accepts = call.accepts;
                return cuiObject.doCall(call.cmd,opts)
            }
            return wrappers;
        }, {});
    };

    return { urls, calls, getCallWrappers };

}]);
