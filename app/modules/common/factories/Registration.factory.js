angular.module('common')
    .factory('Registration',[ 'API',(API)=>{

    const self = {}
    const pub = {}


    /**
     * this method makes sure to make the call but before it calls cui.initiateNonce
     * @param method method name
     * @param args method arguments
     * @returns {*} promise
     */
    self.callRequiresInit = ( method, ...args )=>{
        const deferred = $.Deferred()

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
            deferred.reject(error)
        })

        return deferred.promise()
    }

    pub.getOrganizations=()=>{
        return self.callRequiresInit( "getOrganizationsNonce" );
    }

    pub.getSecurityQuestions=()=>{

        return self.callRequiresInit( "getSecurityQuestionsNonce" );
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

        const deferred = $.Deferred();
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
                results.grants = res;
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

    return pub
}]);