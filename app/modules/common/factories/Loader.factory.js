angular.module('common')
.factory('Loader', (SharedService) => {
    const Loader = Object.create(SharedService)
    return Loader
})
