angular.module('common')
.factory('APIHelpers', () => {
    let apiHelpers = {}


    /**
        return a qs array from an object of key value pairs
        where the key is the search param and the value is the search value (accepts undefined values)
    **/
    apiHelpers.getQs = (opts) => {
        return Object.keys(_(opts).omitBy(_.isUndefined).value())
               .reduce((query, param) => {
                   return query.concat([[param, opts[param]]])
               }, [])
    }

    return apiHelpers
})