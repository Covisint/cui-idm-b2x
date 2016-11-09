angular.module('common')
.factory('Countries', function($http, $rootScope, $translate) {

    let countries = []

    const GetCountries = (locale) => {
        return $http.get(appConfig.languageResources.url + 'countries/' + locale + '.json')
    }

    const setCountries = (language) => {
        language = language || 'en'

        if (language.indexOf('_') > -1) {
            language = language.split('_')[0]
        }

        GetCountries(language)
        .then(res => {
            countries.length = 0

            res.data.forEach(country => {
                countries.push(country)
            })
        })
        .catch(err => {
            console.log(err)
        })
    }

    $rootScope.$on('languageChange',function(e, args) {
        setCountries(args)
    })

    const getCountryByCode = (countryCode) => {
        return _.find(countries, function(countryObject) {
            return countryObject.code === countryCode
        })
    }

    setCountries($translate.proposedLanguage())

    return {
        list: countries,
        getCountryByCode: getCountryByCode
    }
})
