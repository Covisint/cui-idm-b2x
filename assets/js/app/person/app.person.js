angular.module('app')
.factory('Person',['$http','$q','Auth',function($http,$q,Auth){


    
    var getPeople=function(){
        return $http({
            method:'GET',
            url:Auth.url() + '/person/v1/persons',
            headers:{
                Accept:'application/vnd.com.covisint.platform.person.v1+json',
                Authorization:'Bearer ' + Auth.token()
            }
        })
        .then(function(res){
            return res;
        })
        .catch(function(res){
            return $q.reject(res);
        });
    };

    var getById=function(id){
        return $http({
            method:'GET',
            url:Auth.url() + '/person/v1/persons/' + id,
            headers:{
                Accept:'application/vnd.com.covisint.platform.person.v1+json',
                Authorization:'Bearer ' + Auth.token()
            }
        })
        .then(function(res){
            return res;
        })
        .catch(function(res){
            return $q.reject(res);
        });
    };

    var update=function(id,data){
        return $http({
            method:'PUT',
            url:Auth.url() + '/person/v1/persons/' + id,
            headers:{
                Accept:'application/vnd.com.covisint.platform.person.v1+json',
                Authorization:'Bearer ' + Auth.token(),
                'Content-Type':'application/vnd.com.covisint.platform.person.v1+json'
            },
            data:data
        })
        .then(function(res){
            return res;
        })
        .catch(function(res){
            return $q.reject(res);
        });
    };

    var person={
        getAll:getPeople,
        getById:getById,
        update:update
    };

    return person;

}]);