angular.module('common')
.factory('Loader', (SharedService) => {
    const Loader = Object.create(SharedService)
    Loader.details = Object.assign({}, Loader.details)
    Loader.for = Loader.details
    return Loader
})
