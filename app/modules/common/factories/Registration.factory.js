angular.module('common')
.factory('Registration', (API, APIError, $q) => {

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
        const tag = "registration/self/makeNonceCall"

        API.cui.initiateNonce()
        .then(res=>{

            API.cui[method].apply( API.cui, args )
            .then(result=>{
                deferred.resolve(result)
            })
            .fail((error)=>{
                deferred.reject(error)
            })

        })
        .fail((error)=>{
            console.error( tag, error )
            deferred.reject(error)
        })

        return deferred.promise()
    }

    /**
     * TODO: once the promise gets an error message, we are going to resolve as false. This is temporary.
     * Makes an api call to know if the registrating user's username or email address
     * appear already been taken.
     * @param stringParams a param array having either or both userName and emalAddress.
     * @returns {{promise, valid: (function(*=)), catch: (function(*))}}
     */
    self.isUsernameOrEmailTaken = stringParams => {
        const tag = "registration/self/isUsernameOrEmailTaken";

        return {
            promise:(() => {
                const defered = $q.defer()

                if( stringParams ){

                    self.makeNonceCall( "validateUsernameEmailNonce", {qs:stringParams} ).then( res => {
                        defered.resolve( true )
                    }).fail( error => {
                        defered.resolve( false )
                        console.error( tag + ".error", error )
                    })
                }else{
                    defered.resolve( true )
                }

                return defered.promise
            })(),
            valid: res => {
                return res
            },
            catch: error => {
                // do something with the error here
                console.error( tag + ".catch", "there is an error, :) ")
            }
        }
    }


    pub.getOrganizations=()=>{
        return self.makeNonceCall( "getOrganizationsNonce" )
    }

    pub.getSecurityQuestions=()=>{

        return self.makeNonceCall( "getSecurityQuestionsNonce" )
    }

    // Returns organizations and security questions for the realm.
    // Both must resolve for the walkup registration to work.
    pub.initWalkupRegistration = () => {    
        const defer = $q.defer()
        const data = {}
        
        APIError.offFor('RegistrationFactory.initWalkup')

        API.cui.initiateNonce()
        .then(() => {
            return API.cui.getOrganizationsNonce()
        })
        .then(res => {
            data.organizations = res
            return API.cui.getSecurityQuestionsNonce()
        })
        .then(res => {
            data.securityQuestions = res
            defer.resolve(data)
        })
        .fail(error => {
            APIError.onFor('RegistrationFactory.initWalkup')
            defer.reject(error)
        })

        return defer.promise
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
        const results = {
            grants: []
        }

        API.cui.initiateNonce()
            .then(res => {
                return API.cui.getOrgPackageGrantsNonce({organizationId: organization.id})
            })
            .then(res => {
                res.forEach(grant => {
                    if (grant.servicePackageResource.requestable) results.grants.push(grant)
                })
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

    pub.isUsernameTaken = name => {
        return self.isUsernameOrEmailTaken( [['userName',name]] );
    }

    pub.isEmailTaken = email => {
        return self.isUsernameOrEmailTaken( [['emailAddress',email]] );
    }

    return pub

})
