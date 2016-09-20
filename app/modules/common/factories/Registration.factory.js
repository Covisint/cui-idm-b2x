/**
 * Created by musta on 9/19/2016.
 */
angular.module('common')
    .factory('Registration',[ 'API','$rootScope','$state','$q','APIError',(API,$rootScope,$state,$q,APIError)=>{

    const self = {}
    const pub = {}


    self.callRequiresInit = ( method, ...args )=>{
        const deferred = $q.defer()

        API.cui.initiateNonce().then(res=>{

            API.cui[method].apply( API.cui, args ).then(result=>{
                deferred.resolve(result)
            },error=>{
                deferred.reject(error)
            })

        }, error=>{
            deferred.reject(error)
        })

        return deferred.promise
    }

    pub.getOrganizations=()=>{
        return self.callRequiresInit( "getOrganizationsNonce" );
    }

    pub.getSecurityQuestions=()=>{

        return self.callRequiresInit( "getSecurityQuestionsNonce" );
    }

    pub.walkUpInit =()=>{

        const deferred = $q.defer()

        $q.all([pub.getOrganizations(),pub.getSecurityQuestions()]).then(values=>{
            deferred.resolve({questions:values[0], organizations:values[1]})
        },error=>{
            APIError.onFor('registrationFactory.walkUpInit', 'Error getting required data for registration')
            deferred.reject(error)
        })

        return deferred.promise
    }

    return pub
}]);