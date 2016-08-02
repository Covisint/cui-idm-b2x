angular.module('common')
.factory('APIHelpers', ($q) => function (API) {

    const loader = API.loader
    const error = API.error

    /*
        return a qs array from an object of key value pairs
        where the key is the search param and the value is the search value (accepts undefined values)
    */
    this.getQs = (opts) => {
        return Object.keys(_(opts).omitBy(_.isUndefined).value())
        .map(param => {
            return [param, opts[param]]
        })
    }

    /*
        calls can be a single promise or an array of promises
        how to use
        API.helpers().getApiCall(
            API.cui.xyz(),
            loaderName  <sring> (enables that property in the loader factory and disables when done),
            apiErrorName <string> (enables that error in the error factory and disables it as soon as getApiCall is called again),
            opts <object>
                {
                    ignoreError: if set to true will resolve with the data that it was able to fetch
                }
        )
    */
    this.getApiCall = (calls, { loaderName, loaderMessage, apiErrorName, apiErrorMessage, ignoreErrors } = {}) => {
        const deferred = $q.defer()
        loaderName && loader.onFor(loaderName, loaderMessage)
        apiErrorName && error.offFor(apiErrorName)

        if (ignoreErrors) {
            if (_.isArray(calls)) {
                if (calls.length === 0) {
                    deferred.resolve([])
                    loader.offFor(loaderName)
                    return deferred.promise
                }
                let z = 0
                let results = []
                calls.forEach(call => {
                    call
                    .then(results.push)
                    .always(() => {
                        z++
                        if (z === calls.length) {
                            deferred.resolve(results)
                            loaderName && loader.offFor(loaderName)
                        }
                    })
                })
            } else if (calls) {
                calls
                .then(res => {
                    deferred.resolve(res)
                    loaderName && loader.offFor(loaderName)
                })
            } else deferred.resolve([])
        } else {
            $q.all(calls)
            .then(deferred.resolve)
            .catch(err => {
                apiErrorName && error.onFor(apiErrorName, apiErrorMessage)
                deferred.reject(err)
            })
            .finally(() => {
                loaderName && loader.offFor(loaderName)
            })
        }
        return deferred.promise
    }

    return this
})
