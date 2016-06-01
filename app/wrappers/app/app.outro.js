
    const calls = [
        {cmd: 'getPackageClaims',                        accepts: '.platform.package.claim.v1',                          call: '/service/v3/claims'},
        {cmd: 'getPersonPackageClaims',                  accepts: '.platform.package.grant.claim.v1',                    call: `/service/v3/persons/${ '{grantee}' }/packages/${ '{packageId}' }/claims`},
        {cmd: 'getCategories',                           accepts: 'application/vnd.com.covisint.platform.category.v1+json',                               call: `/service/v3/categories`},
        {cmd: 'getPersonRequestableApps',                accepts: '.platform.service.application.v1',                    call: `/service/v3/applications/persons/${ '{personId}' }/requestable`},
        {cmd: 'getPersonRequestableCount',               accepts: 'text/plain',                                          call: `/service/v3/applications/persons/${ '{personId}' }/requestable/count`},
        {cmd: 'getPersonGrantedApps',                    accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',                    call: `/service/v3/applications/persons/${ '{personId}' }`},
        {cmd: 'getPersonGrantedCount',                   accepts: 'text/plain',                                          call: `/service/v3/applications/persons/${ '{personId}' }/count`},
        {cmd: 'getOrganizationRequestableApps',          accepts: '.platform.service.application.v1',                    call: `/service/v3/applications/organizations/${ '{organizationId}' }`},
        {cmd: 'getOrganizationRequestableCount',         accepts: 'text/plain',                                          call: `/service/v3/applications/organizations/${ '{organizationId}' }/requestable/count`},
        {cmd: 'getOrganizationGrantedApps',              accepts: '.platform.service.application.v1',                    call: `/service/v3/applications/organizations/${ '{organizationId}' }`},
        {cmd: 'getOrganizationGrantedCount',             accepts: 'text/plain',                                          call: `/service/v3/applications/organizations/${ '{organizationId}' }/count`},
        {cmd: 'getPersonGrantableApps',                  accepts: '.platform.service.application.v1',                    call: `/service/v3/applications/persons/${ '{personId}' }/grantable`},
        {cmd: 'getPersonGrantableCount',                 accepts: 'text/plain',                                          call: `/service/v3/applications/persons/${ '{personId}' }/grantable/count`},
        {cmd: 'getOrganizationGrantableApps',            accepts:'.platform.service.application.v1',                     call: `/service/v3/applications/organizations/${ '{organizationId}' }/grantable`},
        {cmd: 'getOrganizationGrantableCount',           accepts: 'text/plain',                                          call: `/service/v3/applications/persons/${ '{organizationId}' }/grantable/count`},
        {cmd: 'getPersonStatusHistory',                  accepts: '.platform.person.status.history.v1',                  call: '/person/v3/persons/statusHistory' },
        {cmd: 'getPersonPasswordChangeHistory',          accepts: '.platform.authn.password.change.history.req.v1',      call: `/authentication/v4/passwords/changeHistory` },
        {cmd: 'getPersonPendingServicePackages',         accepts: '.platform.package.request.v1',                        call: `/service/v3/requests` },
        {cmd: 'getPackage',                              accepts: '.platform.package.v1',                                call: `/service/v3/packages/${ '{packageId}' }` },
        {cmd: 'denyPackage',                             accepts: 'text/plain',                                          call: `/service/v3/requests/tasks/deny`,                                                           type: 'POST' },
        {cmd: 'approvePackage',                          accepts: 'text/plain',                                          call: `/service/v3/requests/tasks/approve`,                                                        type: 'POST' },
        {cmd: 'grantClaims',                             accepts: '.platform.package.grant.claim.v1',                    call: `/service/v3/packages/grants/claims`,                                                        type: 'PUT' },
        {cmd: 'getOrganizationRegistrationRequest',      accepts: '.platform.organization.request.v1',                   call: `/organization/v3/requests`,                                                                 type: 'GET' },
        {cmd: 'getPersonRegistrationRequest',            accepts: '.platform.person.request.v1',                         call: `/person/v3/requests`,                                                                       type: 'GET' },
        {cmd: 'approvePersonRegistration',               accepts: '.platform.person.request.v1',                         call: `/person/v3/requests/tasks/approve`,                                                         type: 'POST' },
        {cmd: 'denyPersonRegistration',                  accepts: '.platform.person.request.v1',                         call: `/person/v3/requests/tasks/deny`,                                                            type: 'POST' },
        {cmd: 'getAllOrganizationRequests',              accepts: '.platform.organization.request.v1',                   call: `/organization/v3/requests`,                                                                 type: 'GET' }
    ];

    // Initialize CUI.JS before bootstrapping the application
    cui.api({
        retryUnseured: true,
        envDefs: ['https://cuijs.run.covisintrnd.com/defs/env.json'],
        dataCallDefs: [
            'https://cuijs.run.covisintrnd.com/defs/auth.json',
            'https://cuijs.run.covisintrnd.com/defs/idm.json',
            calls
        ]
    })
    .then((cui) => {
        window.initializedCustomCui = cui;
        angular.bootstrap(document, ['app']);
    });

});
