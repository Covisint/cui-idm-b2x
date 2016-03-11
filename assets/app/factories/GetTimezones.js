angular.module('app').factory('GetTimezones',['$http',function($http){
    return function(locale){
        return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/timezones/' + locale + '.json');
    };
}]);