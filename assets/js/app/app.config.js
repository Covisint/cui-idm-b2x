angular.module('app')
.config(['$translateProvider','$locationProvider','$stateProvider','$urlRouterProvider',
    '$injector','localStorageServiceProvider','$cuiIconProvider','$cuiI18nProvider',
function($translateProvider,$locationProvider,$stateProvider,$urlRouterProvider,
    $injector,localStorageServiceProvider,$cuiIconProvider,$cuiI18nProvider){

    localStorageServiceProvider.setPrefix('cui');

    var templateBase='assets/angular-templates/'; // base directori of your partials


    var returnCtrlAs=function(name,asPrefix){ // build controller as syntax easily. returnCtrlAs('test','new') returns 'testCtrl as newTest'
        // returnCtrlAs('test') returns 'testCtrl as test'
        return name + 'Ctrl as ' + ( asPrefix? asPrefix : '' ) + ( asPrefix? name[0].toUpperCase() + name.slice(1,name.length) : name );
    };

    $stateProvider
        .state('base',{
            url: '/',
            templateUrl: templateBase + 'base.html',
            controller: returnCtrlAs('base')
        })
        .state('users',{
            url: '/users',
            templateUrl: templateBase + 'users/users.html'
        })
        .state('users.search',{
            url: '/',
            templateUrl: templateBase + 'users/users.search/users.search.html',
            controller: returnCtrlAs('usersSearch')
        })
        .state('users.edit',{
            url: '/edit/:id',
            templateUrl: templateBase + 'edit/users.edit/users.edit.html',
            controller: returnCtrlAs('usersEdit')
        })
        .state('users.invitations',{
            url: '/invitations',
            templateUrl: templateBase + 'invitations/users.invitations/users.invitations.search.html',
            controller: returnCtrlAs('usersInvitations')
        })
        .state('users.invite',{
            url: '/invite',
            templateUrl: templateBase + 'invitations/users.invitations/users.invite.html',
            controller: returnCtrlAs('usersInvite')
        })
        .state('users.register',{
            url: '/register?id&code',
            templateUrl: templateBase + 'registration/userInvited/users.register.html',
            controller: returnCtrlAs('usersRegister')
        })
        .state('users.walkupRegistration',{
            url: '/walkupRegistration',
            templateUrl:templateBase + 'registration/userWalkup/users.walkup.html',
            controller: returnCtrlAs('usersWalkup')
        })
        .state('users.activate',{
            url: '/activate/:id',
            templateUrl: templateBase + 'users/users.activate/users.activate.html',
            controller: returnCtrlAs('usersActivate')
        })
        .state('applications',{
            url: '/applications',
            templateUrl : templateBase + 'applications/applications.html'
        })
        .state('applications.myApplications',{
            url: '/myApplications',
            templateUrl: templateBase + 'applications/myApplications.html',
            controller: returnCtrlAs('myApplications')
        })
        .state('applications.myApplicationDetails',{
            url: '/myApplications/:packageId/:appId',
            templateUrl: templateBase + 'applications/myApplicationDetails.html',
            controller: returnCtrlAs('myApplicationDetails')
        })
        .state('applications.newRequest',{
            url: '/newRequest',
            templateUrl: templateBase + 'applications/newRequest.html',
            controller: returnCtrlAs('newAppRequest')
        })
        .state('applications.search',{
            url: '/search?name&category&page',
            templateUrl: templateBase + 'applications/search.html',
            controller: returnCtrlAs('applicationSearch')
        })
        .state('welcome',{
            url: '/welcome',
            templateUrl: templateBase + 'welcome/welcome.html'
        })
        .state('welcome.screen',{
            url: '/welcome',
            templateUrl: templateBase + 'welcome/welcome.screen.html',
            controller: returnCtrlAs('welcome')
        })
        .state('tlo',{
            url: '/tlo',
            templateUrl: templateBase + 'registration/newTopLevelOrg/topLevelOrg.html'
        })
        .state('tlo.registration',{
            url: '/registration',
            templateUrl: templateBase + 'registration/newTopLevelOrg/topLevelOrg.registration/topLevelOrg.registration.html',
            controller: returnCtrlAs('tlo','new')
        })
        .state('division',{
            url: '/division',
            templateUrl: templateBase + 'registration/newDivision/division.html'
        })
        .state('division.registration',{
            url: '/registration',
            templateUrl: templateBase + 'registration/newDivision/division.registration/division.registration.html',
            controller: returnCtrlAs('division','new')
        })
        .state('misc',{
            url: '/status',
            templateUrl: templateBase + 'misc/misc.html'
        })
        .state('misc.404',{
            url: '/404',
            templateUrl: templateBase + 'misc/misc.404.html'
        })
        .state('misc.notAuth',{
            url: '/notAuthorized',
            templateUrl: templateBase + 'misc/misc.notAuth.html'
        })
        .state('misc.pendingStatus',{
            url: '/pendingStatus',
            templateUrl: templateBase + 'misc/misc.pendingStatus.html'
        })
        .state('misc.success',{
            url: '/success',
            templateUrl: templateBase + 'misc/misc.success.html'
        })
        .state('profile', {
            url: '/profile',
            templateUrl: templateBase + 'profiles/profile.html'
        })
        .state('profile.organization', {
            url: '/profile/organization?id',
            templateUrl: templateBase + 'profiles/organization.profile.html',
            controller: returnCtrlAs('orgProfile')
        });

    // $locationProvider.html5Mode(true);

    //fixes infinite digest loop with ui-router (do NOT change unless absolutely required)
    $urlRouterProvider.otherwise( function($injector) {
      var $state = $injector.get("$state");
      $state.go('base');
    });

    $cuiI18nProvider.setLocaleCodesAndNames( // put these in the order of preference for language fallback
        // ADD LANGUAGES HERE ONLY
        {
            'en':'English',
            'pt':'Portuguese',
            'tr':'Turkish',
            'zh':'Chinese (Simplified)',
            'fr':'French',
            'es':'Spanish',
            'it':'Italian',
            'ru':'Russian',
            'th':'Thai',
            'ja':'Japanese',
            'de':'German'
        }
    )

    var languageKeys=Object.keys($cuiI18nProvider.getLocaleCodesAndNames());

    var returnRegisterAvailableLanguageKeys=function(){
        var object={'*':languageKeys[0]}; // set unknown languages to reroute to prefered language
        languageKeys.forEach(function(languageKey){
            object[languageKey+'*']=languageKey //redirect language keys such as en_US to en or en-US to en
        })
        return object;
    }

    $translateProvider
    .useLoader('LocaleLoader',{
        url:'bower_components/cui-i18n/dist/cui-i18n/angular-translate/',
        prefix:'locale-',
        suffix:'.json'
    })
    .registerAvailableLanguageKeys(languageKeys,returnRegisterAvailableLanguageKeys())
    .uniformLanguageTag('java')
    .determinePreferredLanguage()
    .fallbackLanguage(languageKeys);

    $cuiI18nProvider.setLocalePreference(languageKeys);

    $cuiIconProvider.iconSet('cui','bower_components/cui-icons/dist/icons/icons-out.svg',48,true);
    $cuiIconProvider.iconSet('fa','bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg',216,true);
}]);

angular.module('app')
.run(['LocaleService','$rootScope','$state','$http','$templateCache','$cuiI18n',
    function(LocaleService,$rootScope,$state,$http,$templateCache,$cuiI18n){
    //add more locales here
    var languageNameObject=$cuiI18n.getLocaleCodesAndNames();
    for(var LanguageKey in languageNameObject){
        LocaleService.setLocales(LanguageKey,languageNameObject[LanguageKey]);
    };

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $state.previous = {};
        $state.previous.name = fromState;
        $state.previous.params = fromParams;
    });

    var icons=['bower_components/cui-icons/dist/icons/icons-out.svg','bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg'];

    angular.forEach(icons,function(icon){
        $http.get(icon,{
            cache: $templateCache
        });
    });
}]);

