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
.factory('API',[function(){
    
    var myCUI= cui.api();
    myCUI.setService('https://api.covapp.io');
    
    var doAuth = (function(){
        myCUI.doSysAuth({
            clientId: 'wntKAjev5sE1RhZCHzXQ7ko2vCwq3wi2',
            clientSecret: 'MqKZsqUtAVAIiWkg'
        });
    })();

    var token = function(){
        return myCUI.getToken();
    };

    var url = function(){
        return myCUI.getService();
    };

    return{
        token:token,
        url:url,
        cui:myCUI
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
        .state('users',{
            url: '/users',
            templateUrl: 'assets/angular-templates/users/users.html',
            controller: 'usersCtrl as users'
        })
        .state('edit',{
            url: '/edit',
            templateUrl: 'assets/angular-templates/edit/edit.html',
        })
        .state('edit.user',{
            url: '/user/:id',
            templateUrl: 'assets/angular-templates/edit/edit.users.html',
            controller: 'userEditCtrl as userEdit'
        })
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
.controller('userEditCtrl',['localStorageService', '$scope','Person','$stateParams', 
function(localStorageService, $scope,Person,$stateParams){
    var userEdit=this;

    Person.getById($stateParams.id)
    .then(function(res){
        userEdit.user=res.data;
    })
    .catch(function(err){
        console.log(err);
    });


    userEdit.save=function(){
        Person.update($stateParams.id,userEdit.user);
    };

}]);

angular.module('app')
.factory('Person',['$http','$q','API',function($http,$q,API){


    
    var getPeople=function(){
        return API.cui.getUsers;
    };

    var getById=function(id){
        return $http({
            method:'GET',
            url:API.url() + '/person/v1/persons/' + id,
            headers:{
                Accept:'application/vnd.com.covisint.platform.person.v1+json',
                Authorization:'Bearer ' + API.token()
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
            url:API.url() + '/person/v1/persons/' + id,
            headers:{
                Accept:'application/vnd.com.covisint.platform.person.v1+json',
                Authorization:'Bearer ' + API.token(),
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
        getAll:API.cui.getUsers,
        getById:getById,
        update:update
    };

    return person;

}]);

angular.module('app')
.controller('usersCtrl',['localStorageService', '$scope','API', function(localStorageService, $scope, API){
    var users=this;

    API.cui.getUsers()
    .then(function(res){
        users.list=res;
        $scope.$apply();
    })
    .fail(function(err){
        // console.log(err);
    });


    // $scope.$watchCollection('users.search',search); once Mitchs library supports search params

}]);

})(angular);