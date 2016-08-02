angular.module('common')
.factory('APILoader', (SharedService) => {
    const APILoader = Object.create(SharedService)
    APILoader.details = Object.assign({}, APILoader.details)
    APILoader.for = APILoader.details
    return APILoader
})