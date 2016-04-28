angular.module('common')
.factory('Timezones',['$http','$rootScope','$translate',function($http,$rootScope,$translate){

    var timezones=[];

    var GetTimezones=function(locale){
        return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/timezones/' + locale + '.json');
    };

    var setTimezones=function(language){
        language = language || 'en';
        if(language.indexOf('_')>-1){
            language=language.split('_')[0];
        }
        GetTimezones(language)
        .then(function(res){
            res.data.forEach(function(timezone){
                timezones.push(timezone);
            });
        })
        .catch(function(err){
            console.log(err);
        });
    };

    var getTimezoneById=function(id){
        if(!id) return '';
        return _.find(timezones,function(timezone){
            return timezone.id===id;
        }).name;
    };

    $rootScope.$on('languageChange',function(e,args){
        setTimezones(args);
    });

    setTimezones($translate.proposedLanguage());

    return {
        all:timezones,
        timezoneById:getTimezoneById
    }
}]);