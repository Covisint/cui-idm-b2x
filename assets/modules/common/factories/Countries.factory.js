angular.module('common')
.factory('Countries',['$http','$rootScope','$translate',function($http,$rootScope,$translate){

    var countries=[];

    var GetCountries=function(locale){
        return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/' + locale + '.json');
    };

    var setCountries=function(language){
        language = language || 'en';
        if(language.indexOf('_')>-1){
            language=language.split('_')[0];
        }
        GetCountries(language)
        .then(function(res){
            countries.lenght=0;
            res.data.forEach(function(country){
                countries.push(country);
            });
        })
        .catch(function(err){
            console.log(err);
        });
    };

    $rootScope.$on('languageChange',function(e,args){
        setCountries(args);
    });

    var getCountryByCode=function(countryCode){
        return _.find(countries,function(countryObject){
            return countryObject.code===countryCode;
        });
    };

    setCountries($translate.proposedLanguage());

    return {
        list:countries,
        getCountryByCode:getCountryByCode
    };
}]);