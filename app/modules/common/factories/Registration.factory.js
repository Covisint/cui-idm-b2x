/**
 * Created by musta on 9/19/2016.
 */
angular.module('common')
    .factory('Registration',[ 'API','$rootScope','$state','$q','APIError',(API,$rootScope,$state,$q,APIError)=>{

    const self = {}
    const pub = {}


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


    pub.walkUpSubmit=(build)=>{

        const deferred = $.Deferred();
        const user = build.buildPerson()

        return API.cui.initiateNonce()
            .then(res => {
                return API.cui.postUserRegistrationNonce({data: user})
            })
            .then(res => {
                if (userWalkup.applications.numberOfSelected !== 0) {
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
                results.policyRules = res.rules
                deferred.resolve(results)
            })
            .fail( error=>{
                deferred.reject(error)
            })

        return deferred.promise()
    }

    return pub
}]);