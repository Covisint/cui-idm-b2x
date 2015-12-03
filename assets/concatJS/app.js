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
.controller('baseCtrl',['$state',function($state){
    var base=this;
    
    base.desktopMenu=true;

    base.toggleDesktopMenu=function(){
        base.desktopMenu=!base.desktopMenu;
    };

    base.goBack=function(){
        if($state.previous.name.name!==''){
            $state.go($state.previous.name,$state.previous.params);
        }
        else {
            $state.go('base');
        }
    };



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
            templateUrl: 'assets/angular-templates/users/users.html'
        })
        .state('users.search',{
            url: '/',
            templateUrl: 'assets/angular-templates/users/users.search.html',
            controller: 'usersSearchCtrl as usersSearch'
        })
        .state('users.edit',{
            url: '/edit/:id',
            templateUrl: 'assets/angular-templates/users/users.edit.html',
            controller: 'usersEditCtrl as userEdit'
        })
        .state('users.invitations',{
            url: '/invitations',
            templateUrl: 'assets/angular-templates/users/users.invitations.search.html',
            controller: 'usersInvitationsCtrl as usersInvitations'
        })
        .state('users.invitations.view',{
            url: '/view',
            templateUrl: 'assets/angular-templates/users/users.invitations.view.html',
            controller: 'userInvitationsViewCtrl as usersInvitationsView'
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
.run(['LocaleService','$rootScope','$state',function(LocaleService,$rootScope,$state){
    //add more locales here
    LocaleService.setLocales('en_US','English (United States)');
    LocaleService.setLocales('pl_PL','Polish (Poland)');
    LocaleService.setLocales('zh_CN', 'Chinese (Simplified)');
    LocaleService.setLocales('pt_PT','Portuguese (Portugal)');

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $state.previous = {};
        $state.previous.name = fromState;
        $state.previous.params = fromParams;
    });
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

    var getInvitations=function(){
        return $http({
            method:'GET',
            url:API.url() + '/person/v1/personInvitations/',
            headers:{
                Accept:'application/vnd.com.covisint.platform.person.invitation.v1+json',
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
        update:update,
        getInvitations:getInvitations
    };

    return person;

}]);

angular.module('app')
.controller('usersEditCtrl',['localStorageService','$scope','Person','$stateParams', 
function(localStorageService,$scope,Person,$stateParams){
    var usersEdit=this;
    usersEdit.loading=true;

    Person.getById($stateParams.id)
    .then(function(res){
        usersEdit.loading=false;
        usersEdit.user=res.data;
    })
    .catch(function(err){
        usersEdit.loading=false
        console.log(err);
    });


    usersEdit.save=function(){
        Person.update($stateParams.id,usersEdit.user);
    };

}]);

angular.module('app')
.controller('usersInvitationsCtrl',['localStorageService','$scope','Person','$stateParams','API',
function(localStorageService,$scope,Person,$stateParams,API){
    var usersInvitations=this;
    usersInvitations.listLoading=true;
    usersInvitations.invitor=[];
    usersInvitations.invitee=[];
    usersInvitations.invitorLoading=[];
    usersInvitations.inviteeLoading=[];

    Person.getInvitations()
    .then(function(res){
        usersInvitations.listLoading=false;
        usersInvitations.list=res.data;
    })
    .catch(function(err){
        usersInvitations.listLoading=false
        console.log(err);
    });

    usersInvitations.getInfo=function(invitorId,inviteeId,index){
        if(usersInvitations.invitor[index]===undefined){
            var params={};
            //get invitor's details
            usersInvitations.invitorLoading[index]=true;
            params={
                id:invitorId
            };
            API.cui.getUsers({data:params})
            .then(function(res){
                usersInvitations.invitorLoading[index]=false;
                usersInvitations.invitor[index]=res[0];
                // console.log(usersInvitations.invitor);
                $scope.$apply();
            })
            .fail(function(err){
                console.log(err);
            });


            //get invitee's details
            params={
                id:inviteeId
            };
            API.cui.getUsers({data:params})
            .then(function(res){
                usersInvitations.inviteeLoading[index]=false;
                usersInvitations.invitee[index]=res[0];
                $scope.$apply();
            })
            .fail(function(err){
                console.log(err);
            });
        }
    }


    // var search=function(){
    //     API.cui.getUser({data:usersSearch.search})
    //     .then(function(res){
    //         usersSearch.list=res;
    //         $scope.$apply();
    //     })
    //     .fail(function(err){
    //         // TBD : error handling
    //         // console.log(err);
    //     });
    // };

    // $scope.$watchCollection('usersSearch.search',search); 

}]);

angular.module('app')
.controller('usersSearchCtrl',['localStorageService', '$scope','API', function(localStorageService, $scope, API){
    var usersSearch=this;

    usersSearch.listLoading=true;
    API.cui.getUsers()
    .then(function(res){
        usersSearch.listLoading=false;
        usersSearch.list=res;
        usersSearch.list.splice(0,4); // removes superusers, won't be needed after cui.js uses 3legged auth
        $scope.$apply();
    })
    .fail(function(err){
        usersSearch.listLoading=false;
        // console.log(err);
    });


    var search=function(){
        API.cui.getUser({data:usersSearch.search})
        .then(function(res){
            usersSearch.list=res;
            $scope.$apply();
        })
        .fail(function(err){
            // TBD : error handling
            // console.log(err);
        });
    };

    $scope.$watchCollection('usersSearch.search',search); 




}]);

})(angular);