(function(angular){
    'use strict';

    angular
    .module('app',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule'])
    .run(['$rootScope', '$state', 'cui.authorization.routing', function($rootScope,$state,routing){
        // $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        //     event.preventDefault();
        //     routing($rootScope, $state, toState, toParams, fromState, fromParams);
        // })
    }]);

angular.module('app')
.factory('Auth',[function(){
    
    var myCUI= cui.api();
    myCUI.setService('https://api.covapp.io');

    var doAuth = function(){
        myCUI.doSysAuth({
            clientId: 'HlNH57h2X9GlUGWTyvztAsXZGFOAHQnF',
            clientSecret: 'LhedhdbgKYWcmZru'
        });
    };

    var token = function(){
        doAuth();
        return myCUI.getToken();
    };

    var url = function(){
        return myCUI.getService();
    };

    return{
        token:token,
        url:url
    };
}]);

angular.module('app')
.controller('baseCtrl',['Person',function(Person){
    var base=this;
    
    base.desktopMenu=true;

    base.toggleDesktopMenu=function(){
        base.desktopMenu=!base.desktopMenu;
    };

    // Person.getAll() gets all the people in the API
    // Person.getById(id) gets 1 person


}]);

angular.module('app')
.config(['$translateProvider','$locationProvider','$stateProvider','$urlRouterProvider','$injector','localStorageServiceProvider',
function($translateProvider,$locationProvider,$stateProvider,$urlRouterProvider,$injector,localStorageServiceProvider){
    localStorageServiceProvider.setPrefix('cui');
    $stateProvider
        .state('base',{
            url: '/',
            templateUrl: 'assets/angular-templates/home.html',
            controller: 'baseCtrl as base'
        })
        .state('profile',{
            url: '/profile',
            templateUrl: 'assets/angular-templates/profile.html',
            controller: 'profileManagementCtrl as profile'
        });
    // $locationProvider.html5Mode(true);
    
    //fixes infinite digest loop with ui-router
    $urlRouterProvider.otherwise( function($injector) {
      var $state = $injector.get("$state");
      $state.go('base');
    });

    
    //where the locales are being loaded from
    $translateProvider.useLoader('LocaleLoader',{
        url:'bower_components/cui-i18n/dist/cui-i18n/angular-translate/',
        prefix:'locale-'
    });
     
}]);

angular.module('app')
.run(['LocaleService',function(LocaleService){
    //add more locales here
    LocaleService.setLocales('en_US','English (United States)');
    LocaleService.setLocales('pl_PL','Polish (Poland)');
    LocaleService.setLocales('zh_CN', 'Chinese (Simplified)');
    LocaleService.setLocales('pt_PT','Portuguese (Portugal)');
}]);



angular.module('app')
.controller('profileManagementCtrl',['localStorageService', '$scope','Person', function(localStorageService, $scope,Person){
    var profile=this;

    Person.getById("OGEXKB93")
    .then(function(res){
        profile.user=res.data;
    })
    .catch(function(err){
        console.log(err);
    });


    profile.save=function(){
        Person.update("OGEXKB93",profile.user);
    };

}]);

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

})(angular);