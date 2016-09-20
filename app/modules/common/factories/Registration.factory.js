/**
 * Created by musta on 9/19/2016.
 */
angular.module('common')
    .factory('Registration',[ 'API','$rootScope','$state','$q',(API,$rootScope,$state,$q)=>{

    const pub = {};
    const self = {initiateNonce:null};

    self.initiate = ()=>{

        let deferred = $q.defer()

        if( !self.initiateNonce ){
            API.cui.initiateNonce().then((res)=>{
                console.log( "initiate!", res )
                self.initiateNonce = res
                deferred.resolve(true)
            })
        }else{
            console.log( "you!")
            deferred.resolve(true)
        }

        return deferred.promise
    }

    pub.getOrganizations=()=>{

        return self.initiate().then((res)=> {
            return API.cui.getOrganizationsNonce()
        })
    };

    /**
     * this method returns security questions along with organizations
     */
    pub.getSecurityQuestions=()=>{

        return self.initiate().then(()=> {
            return API.cui.getSecurityQuestionsNonce()
        })
    }

    return pub;
}]);