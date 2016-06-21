angular.module('common')
.factory('APIError', (SharedService) => {
    const APIError = Object.create(SharedService)
    return APIError
})