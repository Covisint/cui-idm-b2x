angular.module('common', ['cui.dependencies', 'cui.stateChange'])
.config(($stateProvider) => {

    const templateBase = 'app/modules/common/'

    const returnCtrlAs = (name, asPrefix) => `${name}Ctrl as ${ asPrefix || ''}${(asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name)}`

    const loginRequired = {
        loginRequired: true
    }

    $stateProvider
    .state('auth', {
        url: '/auth?xsrfToken&cuid',
        controller: returnCtrlAs('auth'),
        templateUrl: templateBase + 'auth/auth.html',
        access: loginRequired
    })
})
