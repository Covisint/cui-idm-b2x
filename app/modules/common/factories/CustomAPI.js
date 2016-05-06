angular.module('common')
.factory('CustomAPI',[()=>{

    const urls = [
        // {name: 'STG', url: 'https://apistgdev.np.covapp.io'}
    ];

    const calls = [
        {cmd: 'getCategories',                           accepts: '.platform.category.v1',                   call: '/service/v3/categories'},

        {cmd: 'getPersonRequestableApps',                accepts: '.platform.service.application.v1',        call: `/service/v3/applications/persons/${ '{personId}' }/requestable`},

        {cmd: 'getPersonRequestableCount',               accepts: 'text/plain',                              call: `/service/v3/applications/persons/${ '{personId}' }/requestable/count`},

        {cmd: 'getPersonGrantedApps',                    accepts: '.platform.service.application.v1',        call: `/service/v3/applications/persons/${ '{personId}' }`},

        {cmd: 'getPersonGrantedCount',                   accepts: 'text/plain',                              call: `/service/v3/applications/persons/${ '{personId}' }/count`},

        {cmd: 'getOrganizationRequestableApps',          accepts: '.platform.service.application.v1',        call: `/service/v3/applications/organizations/${ '{organizationId}' }/requestable`},

        {cmd: 'getOrganizationRequestableCount',         accepts: 'text/plain',                              call: `/service/v3/applications/organizations/${ '{organizationId}' }/requestable/count`},

        {cmd: 'getOrganizationGrantedApps',              accepts: '.platform.service.application.v1',        call: `/service/v3/applications/organizations/${ '{organizationId}' }`},

        {cmd: 'getOrganizationGrantedCount',             accepts: 'text/plain',                              call: `/service/v3/applications/organizations/${ '{organizationId}' }/count`},

        {cmd: 'getPersonGrantableApps',                  accepts: '.platform.service.application.v1',        call: `/service/v3/applications/persons/${ '{personId}' }/grantable`},

        {cmd:'getPersonGrantableCount',                  accepts: 'text/plain',                              call: `/service/v3/applications/persons/${ '{personId}' }/grantable/count`},

        {cmd:'getOrganizationGrantableApps',             accepts:'.platform.service.application.v1',         call: `/service/v3/applications/oeganizations/${ '{organizationId}' }/grantable`},

        {cmd:'getOrganizationGrantableCount',            accepts: 'text/plain',                              call: `/service/v3/applications/persons/${ '{organizationId}' }/grantable/count`},
    ];

    const getCallWrappers = (cuiObject) => {
        return calls.reduce((wrappers,call) => {
            wrappers[call.cmd] = (opts) => {
                if(call.accepts === 'text/plain') opts.accepts = call.accepts;
                return cuiObject.doCall(call.cmd,opts)
            }
            return wrappers;
        }, {});
    };

    return { urls, calls, getCallWrappers };

}]);
