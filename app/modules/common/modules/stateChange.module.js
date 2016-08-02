angular.module('cui.stateChange', [])
.run(($rootScope, StateChangeStartHandler, StateChangeSuccessHandler, AuthHandler) => {
    $rootScope.$on('$stateChangeStart', StateChangeStartHandler)
    $rootScope.$on('$stateChangeSuccess', StateChangeSuccessHandler)
})
.factory('StateChangeStartHandler', ['Menu', 'cui.authorization.routing', 'PubSub', 'User', 'API', (Menu, Routing, PubSub, User, API) => {
    return (event, toState, toParams, fromState, fromParams) => {
        event.preventDefault()
        API.cui().utils.initIfEmpty(appConfig.cuiObjects, 'wholeApp', 'custom-api-loading')
        .then(
            res => {
                if (!toState.access || !toState.access.loginRequired) {
                    Menu.handleStateChange(toState.menu)
                    Routing(toState, toParams, fromState, fromParams, User.getEntitlements())
                    PubSub.publish('stateChange',{ toState, toParams, fromState, fromParams })
                } else if (User.get() !== '[cuid]') {
                    Routing(toState, toParams, fromState, fromParams, User.getEntitlements())
                    PubSub.publish('stateChange',{ toState, toParams, fromState, fromParams })
                    Menu.handleStateChange(toState.menu)
                } else {
                    AuthHandler({ toState, toParams, fromState, fromParams })
                    .then(({ roleList, redirect }) => {
                        Routing(redirect.toState, redirect.toParams, redirect.fromState, redirect.fromParams, roleList)
                        PubSub.publish('stateChange', redirect)
                        Menu.handleStateChange(redirect.toState.menu)
                    })
                }
            },
            err => console.error(err.message, err.payload)
        )
    }
}])
.factory('StateChangeSuccessHandler', ($rootScope, $state) => {
    $state.stateStack = []
    return (e, { toState, toParams, fromState, fromParams }) => {
        $state.stateStack.push({
            name: fromState,
            params: fromParams
        })
    }
})
.factory('AuthHandler', (API, User, $q, Helpers) => {
    return (redirectOpts) => {
        const cuiOptions = appConfig.cuiObjects[0]
        const cui = API.cui()[cuiOptions.name]
        const { toState } = redirectOpts

        const deferred = $q.defer()
        const sessionInfo = cui.getCovAuthInfo()
        if (toState.name!=='auth') {
            localStorageService.set('cui.b2x.appRedirect', redirectOpts) // set the redirect to whatever the last state before auth was
            API.loader.onFor('wholeApp', 'redirecting-to-sso') // don't need to turn this loader off since covAuth takes us to another page
            cuiOptions.solutionInstancesUrl && cuiOptions.setServiceUrl(cuiOptions.solutionInstancesUrl)
            if (cuiOptions.authHandler) Helpers.replaceWithFactory(cuiOptions.authHandler)(cuiOptions, cui) // force sso redirection
            else API.cuiUtils().defaultAuthHandlerCallback(cuiOptions, cui)
        } else {
            API.loader.onFor('wholeApp', 'getting-user-info')
            cui.handleCovAuthResponse({selfRedirect: true})
            .then(authInfo => User.actions().populateUserInfo(authInfo))
            .then(roleList => {
                deferred.resolve({ roleList, redirect: localStorageService.get('cui.b2x.appRedirect') })
                API.loader.offFor('wholeApp')
            })
        }
        return deferred.promise
    }
})