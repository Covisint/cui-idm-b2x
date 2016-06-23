angular.module('common')
.factory('APIError', (SharedService) => {
    const APIError = Object.create(SharedService)
    APIError.details = Object.assign({}, APIError.details)
    APIError.for = APIError.details
    return APIError
})