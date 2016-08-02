angular.module('common')
.factory('APIHelpers', ($q) => function (API) {
    /**
        return a qs array from an object of key value pairs
        where the key is the search param and the value is the search value (accepts undefined values)
    **/
    this.getQs = (opts) => {
        return Object.keys(_(opts).omitBy(_.isUndefined).value())
               .reduce((query, param) => {
                   return query.concat([[param, opts[param]]])
               }, [])
    }

    // calls can be a single promise or an array of promises
    this.getApiCall = (calls, loaderName, apiErrorName) => {
        const deferred = $q.defer()
        loaderName && API.loader.onFor(loaderName)
        apiErrorName && API.error.offFor(apiErrorName)
        $q.all(calls)
        .then(deferred.resolve)
        .catch(err => {
            apiErrorName && API.error.onFor(apiErrorName)
            deferred.reject(err)
        })
        .finally(() => {
            loaderName && API.loader.offFor(loaderName)
        })
        return deferred.promise
    }

    return this
})
