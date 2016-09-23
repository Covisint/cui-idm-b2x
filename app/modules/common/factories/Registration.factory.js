angular.module('common')
    .factory('Registration',[ 'API', '$q',( API, $q ) => {

    const self = {}
    const pub = {}


    /**
     * this method makes sure to make the call but before it calls cui.initiateNonce
     * @param method method name
     * @param args method arguments
     * @returns {*} promise
     */
    self.makeNonceCall = ( method, ...args )=>{
        const deferred = $.Deferred()

        API.cui.initiateNonce()
        .then(res=>{

            console.log( "initiateNonce.reply", res )
            API.cui[method].apply( API.cui, args )
            .then(result=>{
                deferred.resolve(result)
            })
            .fail((error)=>{
                deferred.reject(error)
            })

        })
        .fail((error)=>{
            deferred.reject(error)
        })

        return deferred.promise()
    }

    pub.getOrganizations=()=>{
        return self.makeNonceCall( "getOrganizationsNonce" )
    }

    pub.getSecurityQuestions=()=>{

        return self.makeNonceCall( "getSecurityQuestionsNonce" )
    }

    /**
     * This method gets security questions and organizations
     * @returns {*} promise, result has already security questions and organizations
     */
    pub.walkUpInit =()=>{

        const deferred = $.Deferred()

        API.cui.initiateNonce().then(res=>{

            $.when( pub.getOrganizations(), pub.getSecurityQuestions())
            .done( ( organizations, questions )=>{
                deferred.resolve({questions:questions, organizations:organizations})
            })
        })

        return deferred.promise()
    }


    /**
     * method goes and submits walkup registration
     * it calls postUserRegistration and postPersonRequest
     * @param build, an object that generates the user and buildRequest
     * @returns {*}
     */
    pub.walkUpSubmit=(build, applications)=>{

        const deferred = $.Deferred()
        const user = build.buildPerson()

        return API.cui.initiateNonce()
            .then(res => {
                return API.cui.postUserRegistrationNonce({data: user})
            })
            .then(res => {
                if (applications.numberOfSelected !== 0) {
                    API.cui.postPersonRequestNonce({data: build.buildRequest(res.person.id, res.person.realm)})
                }
                else {
                    deferred.resolve( res )
                }
            })
            .then(res=>{
                deferred.resolve( res )
            })
            .fail( error=>{
                deferred.reject( error )
            })

        return deferred.promise()
    }


    pub.selectOrganization = (organization)=>{

        const deferred = $.Deferred()
        const results = {}

        API.cui.initiateNonce()
            .then(res => {
                return API.cui.getOrgPackageGrantsNonce({organizationId: organization.id})
            })
            .then(res => {
                results.grants = res
                return API.cui.getPasswordPoliciesNonce({policyId: organization.passwordPolicy.id})
            })
            .then(res => {
                results.passwordRules = res.rules
                deferred.resolve(results)
            })
            .fail( error=>{
                deferred.reject(error)
            })

        return deferred.promise()
    }

    pub.isUsernameTaken = value => {
        return {
            promise:(() => {
                console.log( "userWalkup.usernametaken/promise",  value )
                const defered = $q.defer()

                if( value ){

                    self.makeNonceCall( "validateUsernameEmailNonce", {qs:[['userName',value]]} ).then( res => {
                        console.log( "validateUsernameEmailNonce.reply", res )
                        defered.resolve( true )

                    }).fail( error => {
                        console.log( "validateUsernameEmailNonce.error", error )
                    })
                }else{
                    defered.resolve( true )
                }


                /*setTimeout( () => {

                    if( value ){
                        if( value.length<=5 ){
                            defered.resolve( false )
                        }
                        else{
                            defered.resolve( true )
                        }
                    }else{
                        defered.resolve( true )
                    }
                }, 500 )*/

                return defered.promise
            })(),
            valid: res => {
                console.log( "userWalkup.usernametaken/valid",  res, value )
                return res
            },
            catch: error => {
                // do something with the error here
                console.error( "userWalkup.usernametaken/catch", "there is an error, :) ")
            }
        }
    }

    return pub
}])