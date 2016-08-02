angular.module('common')
.factory('APICui', ($q, $location, Helpers) => function (API) {
    const self = {}

    const loader = API.loader
    const error = API.error

    self.utils = {}

    /*
        default auth handler for cui
        apps that need to customize this should pass an authHandler to the appropriate cui object in appConfig
        with the name of the factory that contains the authHandler suffixed with '.factory'

        the authHandler factory must return a function that takes the cuiConfig (from app config) and the resulting
        cui object as arguments, and return a second function that then returns the appropriate covAuth handler

        see below for example (defaultAuthHandlerCallback)
    */
    self.utils.defaultAuthHandlerCallback = (cuiConfig, cuiObject) => {
        return () => (
            cuiObject.covAuth({
                originUri: cuiConfig.originUri,
                authRedirect: window.location.href.split('#')[0] + '#/auth',
                appRedirect: $location.path()
            })
        )
    }

    /*
        called with API.cuiUtils().initIfEmpty(arrayOfCuiObjects, loader to enable while initializing, message to pass to loader)
        cuiObjects should look similar to this

        [
            {
                "name" <string>: "myCui", This is how you will use this cui object in your app, API.cui().myCui
                "envDefs" <array | optional>:  ["https://cuijs.run.covisintrnd.com/defs/env.json", "EndDefs.factory"],
                "dataCallDefs" <array>: [
                    'https://cuijs.run.covisintrnd.com/defs/auth.json',
                    'app/json/idmApi.json',
                    'CustomAPI.factory'
                ],
                "authHandler" <string | optional>: "MyCuiAuthHandler.factory",
                "solutionInstanceUrl" <string | optional>: "PRD" || "https://mySolutionInstancesUrl.com",
                "serviceUrl" <string | optional>: "PRD" || "https://myServiceUrl.com",
                "apiInterceptorOpts" <object | optional>: {
                    stopIfInvalidPayload, interceptors, enabled
                    enabled <boolean>,
                    stopIfInvalidPayload <boolean | optional>, // stops POST and PUT requests if the data doesn't match the schema
                    interceptors <array | optional>: [ // if not passed all the incepters will be enabled
                        'Get',
                        'PrePut',
                        'PrePost',
                        'PostPut',
                        'PostPost'
                    ]
                }
            }
        ]

        any other properties can be assigned to this object and they will be readily available in your custom authHandler

        when you use a string that ends in .factory for envDefs or dataCallDefs, ex: CustomAPI.factory, your app must have
        an angular factory/service/const that has the name CustomAPI and returns an array of definitions that are valid
        from a cui.js standpoint. Refer to the cui.js docs for more information.

        authHandler must ALWAYS end in .factory and, like envDefs and dataCallDefs, must be an angular factory/service but
        instead should return a function that accepts the cuiConfig and the resolved cuiObject as arguments and that function
        should return an authHandler type function that is acceptable by cui.js (refer to the cui.js docs for more info)

        .factory('MyCuiAuthHandler', () => (cuiConfig, cuiObject) => {
            return () => {
                cuiObject.covAuth({
                    originUri: cuiConfig.originUri,
                    authRedirect: window.location.href.split('#')[0] + '#/auth',
                    appRedirect: $location.path()
                })
            }
        })

        API.cuiUtils().initIfEmpty returns a promise that has 3 possible responses

        resolves in success if
            - cui objects were already initialized, res === {message: 'Already initialized'}
            - cui objects initialized successfully, res === {message: 'Initialized successfully'}

        fails if
            - any of the cui objects failed to initialize, err === {message:'Error initializing cui', payload: <error given back from cui>}
    */
    self.utils.initIfEmpty = (cuiObjects, loaderName, loaderMessage = undefined) => {
        const deferred = $q.defer()
        if (!_.isEmpty(self[cuiObjects[0].name])) deferred.resolve('Already initialized')
        else {
            loaderName && loader.onFor(loaderName, loaderMessage)

            let covAuthInfoPromises
            const cuiObjectPromises = cuiObjects.map(object => {
                object.envDefs = object.envDefs.map(Helpers.replaceWithFactory)
                object.dataCallDefs = object.dataCallDefs.map(Helpers.replaceWithFactory)
                return window.cui.api(object)
            })
            $q.all(cuiObjectPromises)
            .then(
                cuiObjectsResolved => {
                    cuiObjectsResolved.forEach((cuiObject, i) => {
                        const cuiObjectName = cuiObjects[i].name
                        self[cuiObjectName] = Object.assign({}, cuiObject)
                        // set the auth handler
                        if (cuiObjects[i].authHandler) {
                            self[cuiObjectName].setAuthHandler(Helpers.replaceWithFactory(cuiObjects[i].authHandler)(cuiObjects[i], self[cuiObjectName]))
                        } else {
                            self[cuiObjectName].setAuthHandler(self.utils.defaultAuthHandlerCallback(cuiObjects[i], self[cuiObjectName]))
                        }
                        // overide solution instances url to get SII
                        if (cuiObjects[i].solutionInstancesUrl) {
                            self[cuiObjectName].setServiceUrl(cuiObjects[i].solutionInstancesUrl)
                        }
                    })
                    // after we get the covAuthInfo we need to reset the service url
                    return $q.all(cuiObjectsResolved.map((cui, i) => cui.covAuthInfo({originUri: cuiObjects[i].originUri})))
                }
            )
            .then(
                authInfoArray => {
                    cuiObjects.forEach((cuiObject) => {
                        // reset the service url in case a solution instance url had to be used
                        self[cuiObject.name].setServiceUrl(cuiObject.serviceUrl)
                    })
                    deferred.resolve({message: 'Initialized successfully'})
                },
                err => {
                    deferred.reject({message: 'Error initializing cui', payload: err})
                }
            )
            .finally(() => {
                loaderName && loader.offFor(loaderName)
            })
        }
        return deferred.promise
    }

    return self

})