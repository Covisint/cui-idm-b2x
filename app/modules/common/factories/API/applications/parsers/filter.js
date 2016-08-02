angular.module('common')
.factory('applications.filter', ($filter) => {
    /*
        Based on a parse type, parse value and an unparsed list of services returns
        a new parsed list of services

        usage: API.applications.parseAppList(parseType, unparsedList, parseValue)
    */
    return (parseType, unparsedListOfservices, newValue) => {
        switch (parseType) {
            case 'category':
                return unparsedListOfservices.filter(service => (
                    $filter('cuiI18n')(newValue) === $filter('cuiI18n')(service.category)
                ))
        }
    }
})
