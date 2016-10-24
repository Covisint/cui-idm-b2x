angular.module('common')
.factory('Timezones', function($http, $rootScope, $translate) {

    let timezones = []

    const GetTimezones = (locale) => {
        return $http.get(appConfig.languageResources.url + 'timezones/' + locale + '.json')
    }

    const setTimezones = (language) => {
        language = language || 'en'

        if (language.indexOf('_') > -1) {
            language = language.split('_')[0]
        }

        GetTimezones(language)
        .then(res => {
            timezones.length = 0

            res.data.forEach(timezone => {
                timezones.push(timezone)
            })
        })
        .catch(function(err) {
            console.log(err)
        })
    }

    const getTimezoneById = (id) => {
        if (!id) {
            return ''
        }

        return _.find(timezones, function(timezone) {
            return timezone.id === id
        }).name
    }

    $rootScope.$on('languageChange', function(e, args) {
        setTimezones(args)
    })

    setTimezones($translate.proposedLanguage())

    return {
        all: timezones,
        timezoneById: getTimezoneById
    }
})
