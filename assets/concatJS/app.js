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
    myCUI.setServiceUrl('PRD');

    var doAuth = function(){
        return myCUI.doSysAuth({
            clientId: 'wntKAjev5sE1RhZCHzXQ7ko2vCwq3wi2',
            clientSecret: 'MqKZsqUtAVAIiWkg'
        });
    };

    var token = function(){
        return myCUI.getToken();
    };

    return{
        token:token,
        cui:myCUI,
        doAuth:doAuth
    };
}]);

angular.module('app')
.controller('baseCtrl',['$state','getCountries','$scope','$translate','LocaleService',
function($state,getCountries,$scope,$translate,LocaleService){
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

    base.generateHiddenPassword=function(password){
        return Array(password.length+1).join('•');
    };

    base.passwordPolicies=[
        {
            'allowUpperChars':true,
            'allowLowerChars':true,
            'allowNumChars':true,
            'allowSpecialChars':true,
            'requiredNumberOfCharClasses':3
        },
        {
            'disallowedChars':'^&*)(#$'
        },
        {
            'min':8,
            'max':18
        },
        {
            'disallowedWords':['password','admin']
        }
    ];

    // This returns the current language being used by the cui-i18n library, used for registration processes.
    base.getLanguageCode = function(){
        if(LocaleService.getLocaleCode().indexOf('_')>-1) return LocaleService.getLocaleCode().split('_')[0];
        else return LocaleService.getLocaleCode();
    };

    var setCountries=function(language){
        language = language || 'en';
        if(language.indexOf('_')>-1){
            language=language.split('_')[0];
        }
        getCountries(language)
        .then(function(res){
            base.countries=res.data;
        })
        .catch(function(err){
            console.log(err);
        });
    };

    $scope.$on('languageChange',function(e,args){
        // console.log(e);
        setCountries(args);
    });

    setCountries($translate.proposedLanguage());


}]);

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
            'pl':'Polish',
            'zh':'Chinese'
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



angular.module('app')
.controller('applicationSearchCtrl',['API','$scope','$stateParams','$state','$filter',
function(API,$scope,$stateParams,$state,$filter){
    var applicationSearch = this;
    var userId='RN3BJI54'; // this will be replaced with the current user ID
    var nameSearch=$stateParams.name;
    var categorySearch=$stateParams.category;
    var orgPackageList=[],
        userPackageList=[], // WORKAROUND CASE #1
        packageRequests=[];

        // TODO : RELATED APPS CHECKBOX

    var handleError=function(err){
        console.log('Error \n', err);
    };

    // ON LOAD START ---------------------------------------------------------------------------------

    applicationSearch.nameSearch=nameSearch; // get the url param for name and pre-populate the search field
    applicationSearch.category=categorySearch; // same as above

    var user;

    var nameFilter=function(app,search){
        if(!search || search ==='') return true;
        return $filter('cuiI18n')(app.name).toLowerCase().indexOf(search.toLowerCase())>-1;
    };

    var categoryFilter=function(app,category){
        if(!app.category && category) return false;
        if(!category) return true;
        return $filter('cuiI18n')(app.category).indexOf(category)>-1;
    };

    applicationSearch.parseAppsByCategoryAndName=function(){
        var filteredApps = _.filter(applicationSearch.unparsedListOfAvailabeApps,function(app){
            return nameFilter(app,applicationSearch.nameSearch) && categoryFilter(app,applicationSearch.category);
        });
        applicationSearch.list = filteredApps;
        applicationSearch.doneLoading = true;
    };

    var getApplications=function(orgPackageListPassed){
        var listOfAvailabeApps=[],i=0;
        var listOfOrgPackages=orgPackageListPassed || orgPackageList; // so we can call this without passing the orgPackageList again
        listOfOrgPackages.forEach(function(orgPackage){
            if(orgPackage.requestable){
                API.cui.getServices({'packageId':orgPackage.id})
                .then(function(res){
                    i++
                    res.forEach(function(service){
                        service.packageId=orgPackage.id;
                        service.owningOrganization=orgPackage.owningOrganization;
                        listOfAvailabeApps.push(service);
                    });
                    if(i===listOfOrgPackages.length){
                        applicationSearch.unparsedListOfAvailabeApps=listOfAvailabeApps;
                        applicationSearch.parseAppsByCategoryAndName()
                        $scope.$digest();
                    }
                })
                .fail(handleError);
            }
            else i++;
            if(i===listOfOrgPackages.length){
                applicationSearch.unparsedListOfAvailabeApps=listOfAvailabeApps;
                applicationSearch.parseAppsByCategoryAndName();
                $scope.$digest();
            }
        });
    };

    var getAvailableApplications=function(userPackageGrantList){ // get apps that the user can request and doesn't already have grants to
        orgPackageList.forEach(function(orgPackage,i){
            var userGrantInPackageList = _.some(userPackageList,function(userPackageGrant){ // if the user has grants to a package in the list of
                return orgPackage.id===userPackageGrant.servicePackage.id; // packages granted to an org, remove that package from the list.
            });
            if(userGrantInPackageList) orgPackageList.splice(i,1);
        });
        var i=0;
        orgPackageList.forEach(function(orgPackage){
            API.cui.getOrganization({'organizationId':orgPackage.owningOrganization.id})
            .then(function(res){
                i++;
                orgPackage.owningOrganization=res; // WORKAROUND CASE # 8
                if(i===orgPackageList.length){
                    getApplications(orgPackageList);
                }
            })
            .fail(handleError);
        })
    };

    var getUserPackageGrants=function(){ // gets applications that are available for request
        API.cui.getPersonPackages({personId:userId})
        .then(function(res){
            userPackageList=res;
            getAvailableApplications(userPackageList);
        })
        .fail(handleError);
    };

    API.doAuth()
    .then(function(res){
        return API.cui.getPerson({personId:userId});
    })
    .then(function(res){
        user=res;
        return API.cui.getOrganizationPackages({'organizationId':user.organization.id}); // WORKAROUND CASE #1
    })
    .then(function(res){
        var i=0;
        var packageGrants=res;
        packageGrants.forEach(function(pkgGrant){
            API.cui.getPackage({'packageId':pkgGrant.servicePackage.id})
            .then(function(res){
                i++;
                orgPackageList.push(res);
                if(i===packageGrants.length){
                    getUserPackageGrants();
                }
            })
            .fail(handleError);
        });
    })
   .fail(handleError);

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    applicationSearch.listenForEnter=function($event){
        if($event.keyCode===13) applicationSearch.parseAppsByCategoryAndName();
    };

    var pkgRequestCount=applicationSearch.numberOfRequest=0;

    var processNumberOfRequiredApps=function(pkgRequest){
        if(pkgRequest) pkgRequestCount++;
        else pkgRequestCount--;
        applicationSearch.numberOfRequest=pkgRequestCount;
    };

    applicationSearch.toggleRequest=function(i,application){
        if(!packageRequests[i]) packageRequests[i]=application;
        else packageRequests[i]=undefined;
        processNumberOfRequiredApps(packageRequests[i]);
    };

    var bundled=[],related=[];
    applicationSearch.detailsLoadingDone=[];

    var detailsFetchStep=0;

    var getBundledApps=function($index,application){ // WORKAROUND CASE # 1
        bundled[$index]=[];
        API.cui.getServices({ 'packageId':application.packageId })
        .then(function(res){
            res.forEach(function(app){
                if(app.id!==application.id){
                    app.packageId=application.packageId;
                    bundled[$index].push(app);
                }
            });
            detailsFetchStep++;
            if(detailsFetchStep===2){
                applicationSearch.list[$index].details={ 'bundled':bundled[$index],'related':related[$index] };
                applicationSearch.detailsLoadingDone[$index]=true;
                $scope.$digest();
            }
        })
        .fail(handleError);
    };


    var getRelatedAppsThatHaventBeenGranted=function(packagesToIgnore,packages,$index){
        var z=0;
        packages.forEach(function(pkg){
            if(packagesToIgnore.indexOf(pkg.id)===-1) {
                API.cui.getServices({ 'packageId':pkg.id })
                .then(function(res){
                    z++;
                    res.forEach(function(app){ // for each of the services in that child package
                        app.packageId=pkg.id;
                        related[$index].push(app);
                    });
                    if(z===packages.length){
                        detailsFetchStep++;
                        if(detailsFetchStep===2){
                            applicationSearch.list[$index].details={ bundled:bundled[$index],related:related[$index] };
                            applicationSearch.detailsLoadingDone[$index]=true;
                            $scope.$digest();
                        }
                    }
                })
                .fail(handleError);
            }
            else{
                z++;
                if(z===packages.length){
                    detailsFetchStep++;
                    if(detailsFetchStep===2){
                        applicationSearch.list[$index].details={ bundled:bundled[$index],related:related[$index] };
                        applicationSearch.detailsLoadingDone[$index]=true;
                        $scope.$digest();
                    }
                }
            }
        });
    };

    var getRelatedApps=function($index,application){ // WORKAROUND CASE #3
        related[$index]=[];
        API.cui.getPackages({qs:[['parentPackage.id',application.packageId]]}) // Get the packages that are children of the package that the app
        .then(function(res){                                  // we're checking the details of belongs to
            if(res.length===0) {
                detailsFetchStep++;
                if(detailsFetchStep===2) {
                    applicationSearch.list[$index].details={ bundled:bundled[$index],related:related[$index] };
                    applicationSearch.detailsLoadingDone[$index]=true;
                    $scope.$digest();
                }
            }
            var z=0;
            var packages=res;
            var packagesToIgnore=[]; // WORKAROUND CASE #3
            API.cui.getPersonPackages({'personId':userId})
            .then(function(res){
                res.forEach(function(pkgGrant,i){
                    if(_.some(packages,function(pkg){
                        return pkg.id===pkgGrant.servicePackage.id
                    })){
                        packagesToIgnore.push(pkgGrant.servicePackage.id);
                    }
                });
                getRelatedAppsThatHaventBeenGranted(packagesToIgnore,packages,$index)
            })
            .fail(handleError);
        })
        .fail(handleError);
    };

    applicationSearch.getRelatedAndBundled=function($index,application){
        if(applicationSearch.detailsLoadingDone[$index]){
            return;
        }
        detailsFetchStep=0;
        getBundledApps($index,application);
        getRelatedApps($index,application);
    };

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);


angular.module('app')
.controller('myApplicationDetailsCtrl',['API','$scope','$stateParams','$state',
function(API,$scope,$stateParams,$state){
    var myApplicationDetails = this;
    var userId='RN3BJI54'; // this will be replaced with the current user ID

    var appId=$stateParams.appId; // get the appId from the url
    var packageId=$stateParams.packageId;  // get the packageId from the url

    var handleError=function(err){
        console.log('Error \n', err);
        myApplicationDetails.doneLoading=true; // WORKAROUND CASE #6
        $scope.$digest();
    };

    // ON LOAD START ---------------------------------------------------------------------------------

    var i=0; // this is used to see if the process of getting related and bundled apps is done

    var getDateGranted=function(creationUnixStamp){
        var dateGranted=new Date(creationUnixStamp);
        var dateGrantedFormatted=dateGranted.getMonth() + '.' + dateGranted.getDay() + '.' + dateGranted.getFullYear();
        return dateGrantedFormatted;
    };


    var getBundledApps=function(service){ // WORKAROUND CASE # 1
        myApplicationDetails.bundled=[];
        API.cui.getServices({ 'packageId':packageId })
        .then(function(res){
            i++;
            res.forEach(function(app){
                if(app.id!==myApplicationDetails.app.id){
                    app.grantedDate=service.grantedDate;
                    app.status=service.status;
                    app.parentPackage=packageId; // put the package ID on it so we can redirect the user to the right place when he clicks on the app's name
                    myApplicationDetails.bundled.push(app);
                }
            });
            if(i===2) {
                myApplicationDetails.doneLoading=true;
                $scope.$digest();
            }
        })
        .fail(handleError);
    };

    var checkIfAppIsGrantedToUser=function(app,pkgThatAppBelongsTo,packagesGrantedToUser){
        var pkgGrantThatMatches;
        packagesGrantedToUser.some(function(pkg,i){
            return pkgThatAppBelongsTo.id===pkg.servicePackage.id? (pkgGrantThatMatches=packagesGrantedToUser[i],true) : false;
        });
        if(pkgGrantThatMatches) {
            app.status=pkgGrantThatMatches.status;
            app.grantedDate=getDateGranted(pkgGrantThatMatches.creation);
        }
        app.packageId=pkgThatAppBelongsTo.id;
        return app;
    };

    var getRelatedApps=function(app){ // WORKAROUND CASE #3
        myApplicationDetails.related=[];
        var packagesGrantedToUser=[];
        API.cui.getPersonPackages({'personId':userId }) // Check if that child package has been granted to the user
        .then(function(res){
            res.forEach(function(pkg){
                packagesGrantedToUser.push(pkg);
            });
            return API.cui.getPackages({qs:[['parentPackage.id',packageId]]}) // Get the packages that are children of the package that the app
        })                                                             // we're checking the details of belongs to
        .then(function(res){
            if(res.length===0) {
                i++;
                if(i===2) {
                    myApplicationDetails.doneLoading=true; // if there's no packages that are children of the package the app we're
                    $scope.$digest(); // checking out belongs to then we're done here.
                }
            }
            var packagesThatAreChildrenOfMainPacakge=res;
            packagesThatAreChildrenOfMainPacakge.forEach(function(pkg,z){
                API.cui.getServices({'packageId':pkg.id})
                .then(function(res){
                    res.forEach(function(app,z){ // for each of the services in that child package
                        app=checkIfAppIsGrantedToUser(app,pkg,packagesGrantedToUser); // checks if the package has been granted to the user
                        myApplicationDetails.related.push(app); // and re-assign that app to have status and granted date if it has
                    });
                    if(z===packagesThatAreChildrenOfMainPacakge.length-1){
                        i++;
                        if(i===2) {
                            myApplicationDetails.doneLoading=true;
                            $scope.$digest();
                        }
                    }
                })
                .fail(handleError);
            });
        })
        .fail(handleError);
    };

    var getPackageGrantDetails=function(app){
        API.cui.getPersonPackage({ 'personId':userId , 'packageId':packageId })
        .then(function(res){
            app.grantedDate=getDateGranted(res.creation);
            app.status=res.status;
            myApplicationDetails.app=app;
            getBundledApps(app);
            getRelatedApps(app);
        })
        .fail(handleError);
    };

    if(appId){
        API.doAuth()
        .then(function(res){
            return API.cui.getService({ 'serviceId':appId });
        })
        .then(function(res){
            var app=res;
            getPackageGrantDetails(app);
        })
        .fail(handleError);
    }
    else {
        // message for no appId in the state
    }

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    myApplicationDetails.goToDetails=function(application){
        $state.go('applications.myApplicationDetails' , { 'packageId':application.parentPackage, 'appId':application.id } );
    };

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);


angular.module('app')
.controller('myApplicationsCtrl',['API','$scope','$state',
function(API,$scope,$state){
    var myApplications = this;
    var userId='RN3BJI54';

    myApplications.list=[];

    var handleError=function(err){
        console.log('Error \n\n', err);
    };

    // ON LOAD START ------------------------------------------------------------------------------------------

                // WORKAROUND CASE #1
    var getApplicationsFromGrants=function(grants){ // from the list of grants, get the list of services from each of those service packages
        var i=0;
        grants.forEach(function(grant){
            API.cui.getPackageServices({'packageId':grant.servicePackage.id})
            .then(function(res){
                i++;
                res.forEach(function(service){
                    service.status=grant.status; // attach the status of the service package to the service
                    service.parentPackage=grant.servicePackage.id;
                    myApplications.list.push(service);
                });
                if(i===grants.length){ // if this is the last grant
                    myApplications.doneLoading=true;
                    $scope.$digest();
                }
            })
            .fail(handleError);
        });
    };

    API.doAuth()
    .then(function(res){
        return API.cui.getPersonPackages({'personId':userId}); // this returns a list of grants
    })
    .then(function(res){
        getApplicationsFromGrants(res);
    })
    .fail(handleError);


    // ON LOAD END --------------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------------

    myApplications.goToDetails=function(application){
        $state.go('applications.myApplicationDetails' , { 'packageId':application.parentPackage, 'appId':application.id } );
    };


    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------------

}]);


angular.module('app')
.controller('newAppRequestCtrl',['API','$scope','$state',
function(API,$scope,$state){
    var newAppRequest = this;
    var userId='RN3BJI54'; // this will be replaced with the current user ID
    var services=[];
    var handleError=function(err){
        console.log('Error\n',err);
    };

    // ON LOAD START ---------------------------------------------------------------------------------

    var user;
    var getListOfCategories=function(services){
        var categoryList=[]; // WORKAROUND CASE # 7
        services.forEach(function(service){
            service.category=[  // TODO : FORCING A CATEGORY FOR STYLING PURPOSES, NONE OF THE APPS HAVE CATEGORIES RIGHT NOW
                {
                    lang:'en',
                    text:'Admin'
                }
            ];
            if(service.category){
                var serviceCategoryInCategoryList = _.some(categoryList,function(category){
                    return angular.equals(category,service.category);
                });
                if(!serviceCategoryInCategoryList){
                    categoryList.push(service.category);
                }
            }
        });
        return categoryList;
    };

    API.doAuth()
    .then(function(res){
        return API.cui.getPerson({personId:userId});
    })
    .then(function(res){
        user=res;
        return API.cui.getOrganizationPackages({'organizationId':user.organization.id}); // WORKAROUND CASE #1
    })
    .then(function(res){
        var i=0;
        var packageGrants=res;
        packageGrants.forEach(function(pkgGrant){
            API.cui.getServices({'packageId':pkgGrant.servicePackage.id})
            .then(function(res){
                i++;
                res.forEach(function(service){
                    service.status=pkgGrant.status;
                    services.push(service);
                });
                if(i===packageGrants.length){
                    newAppRequest.categories=getListOfCategories(services);
                    newAppRequest.loadingDone=true;
                    $scope.$digest();
                }
            })
            .fail(handleError);
        });
    })
   .fail(handleError);

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------



    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------
}]);


angular.module('app')
.controller('usersEditCtrl',['localStorageService','$scope','$stateParams','$timeout','API',
function(localStorageService,$scope,$stateParams,$timeout,API){
    var usersEdit = this;
    usersEdit.loading = true;
    usersEdit.tempTimezones = ['AKST1AKDT', 'PST2PDT', 'MST3MDT', 'CST4CDT', 'EST5EDT'];
    usersEdit.tempLanguages = ['en', 'pl', 'zh', 'pt'];

    var initializeFullNameTemp = function() {
        usersEdit.tempGiven = usersEdit.user.name.given;
        usersEdit.tempSurname = usersEdit.user.name.surname
    };

    var initializeTempAddressValues = function(){
        usersEdit.tempStreetAddress = usersEdit.user.addresses[0].streets[0];
        usersEdit.tempAddress2 = usersEdit.user.addresses[0].streets[1];
        usersEdit.tempCity = usersEdit.user.addresses[0].city;
        usersEdit.tempZIP = usersEdit.user.addresses[0].postal;
        usersEdit.tempCountry = usersEdit.user.addresses[0].country;
    };

    var selectQuestionsForUser = function(){
        var questions = [];
        angular.forEach(usersEdit.userSecurityQuestions.questions, function(userQuestion){
            var question = _.find(usersEdit.allSecurityQuestions, function(question){return question.id === userQuestion.question.id});
            this.push(question);
        }, questions);

        usersEdit.challengeQuestion1 = questions[0];
        usersEdit.challengeQuestion1.answer = '';
        usersEdit.challengeQuestion2 = questions[1];
        usersEdit.challengeQuestion2.answer = '';
        $scope.$apply();
    };

    var initializePhones = function() {
        usersEdit.phoneTypes = ['main', 'mobile', 'fax'];
        usersEdit.phones = []
        angular.forEach(usersEdit.phoneTypes, function(type) {
            var phoneObject = {type: type, number: filterPhones(type)}
            usersEdit.phones.push(phoneObject);
        });
    };

    var filterPhones = function(type) {
        var phones = usersEdit.user.phones;
        var filteredPhones = phones.filter(function (item) {
            return item.type === type;
        });
        if(filteredPhones.length > 0) {
            return filteredPhones[0].number;
        } else {
            return '';
        };
    }

    API.doAuth()
    .then(function(res) {
        return  API.cui.getPerson({personId: $stateParams.id});
    })
    .then(function(res) {
        usersEdit.user = res;
        initializeTempAddressValues();
        initializeFullNameTemp();
        initializePhones();
        return API.cui.getSecurityQuestionAccount({personId: usersEdit.user.id})
    })
    .then(function(res){
        usersEdit.userSecurityQuestions = res;
        $scope.$apply();
        return API.cui.getSecurityQuestions();
    })
    .then(function(res){
        usersEdit.allSecurityQuestions = res;
        selectQuestionsForUser();
        $scope.$apply();
        return API.cui.getPersonPassword({personId: usersEdit.user.id});
    })
    .then(function(res) {
        usersEdit.userPassword = res;
        $scope.$apply();
        usersEdit.loading = false;
    })
    .fail(function(err) {
        $scope.$apply();
        usersEdit.loading = false;
    });

    usersEdit.save = function() {
        usersEdit.saving = true;
        usersEdit.fail = false;
        usersEdit.success = false;

        API.cui.updatePerson({personId:$stateParams.id,data:usersEdit.user})
        .then(function(res) {
            $timeout(function() {
                usersEdit.saving = false;
                usersEdit.success = true;
            }, 300);
        })
        .fail(function(err) {
            $timeout(function() {
                usersEdit.saving = false;
                usersEdit.fail = true;
            }, 300);
        });
    };

    usersEdit.saveFullName = function() {
        usersEdit.user.name.given = usersEdit.tempGiven; 
        usersEdit.user.name.surname = usersEdit.tempSurname; 
        usersEdit.save();
    }

    usersEdit.resetFullName = function() {
        usersEdit.tempGiven = usersEdit.user.name.given;
        usersEdit.tempSurname = usersEdit.user.name.surname;
    }

    usersEdit.resetTempAddress = function() {
        initializeTempAddressValues();
    }

    usersEdit.saveAddress = function(){
        usersEdit.user.addresses[0].streets[0] = usersEdit.tempStreetAddress;
        if (usersEdit.tempAddress2) {
            usersEdit.user.addresses[0].streets[1] = usersEdit.tempAddress2;
        } else if (usersEdit.user.addresses[0].streets[1]) {
            usersEdit.user.addresses[0].streets.splice(1, 1)
        }
        usersEdit.user.addresses[0].city = usersEdit.tempCity;
        usersEdit.user.addresses[0].postal = usersEdit.tempZIP;
        usersEdit.user.addresses[0].country = usersEdit.tempCountry;
        usersEdit.save();
    }

    usersEdit.updateTempCountry = function(results) {
        usersEdit.tempCountry = results.description.name;
    }

    usersEdit.clearAdditionalPhone = function() {
        usersEdit.additionalPhoneType = '';
        usersEdit.additionalPhoneNumber = '';
    }

    usersEdit.savePhone = function() {
        usersEdit.user.phones = usersEdit.phones.slice();
        _.remove(usersEdit.user.phones, function(phone) {
          return phone.number == '';
        });
        usersEdit.save();
    }

    usersEdit.saveChallengeQuestions = function() {
        var updatedChallengeQuestions = {};
        updatedChallengeQuestions = [{
            question: {
                text: usersEdit.challengeQuestion1.question[0].text,
                lang: usersEdit.challengeQuestion1.question[0].lang,
                answer:   usersEdit.challengeAnswer1,
                index: 1 },
            owner: { 
                id: usersEdit.challengeQuestion1.owner.id } 
            },{
            question: {
                text: usersEdit.challengeQuestion2.question[0].text,
                lang: usersEdit.challengeQuestion2.question[0].lang,
                answer:   usersEdit.challengeAnswer2,
                index: 2 },
            owner: { 
                id: usersEdit.challengeQuestion1.owner.id }
            }
        ];

        usersEdit.saving = true;
        usersEdit.fail = false;
        usersEdit.success = false;

        API.cui.updateSecurityQuestions({
          personId: $stateParams.id,
          data: {
            version: '1',
            id: usersEdit.user.id,
            questions: updatedChallengeQuestions
            }
        })
        .then(function(res) {
            $timeout(function() {
                usersEdit.saving = false;
                usersEdit.success = true;
            }, 300);
        })
        .fail(function(err) {
            $timeout(function() {
                usersEdit.saving = false;
                usersEdit.fail = true;
            }, 300);
        });
    }

    usersEdit.resetChallengeQuestion = function(question) {
        usersEdit['challengeAnswer' + question] = '';
        selectQuestionsForUser();
    }
}]);


angular.module('app').factory('getCountries',['$http',function($http){
    return function(locale){
        return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/' + locale + '.json');
    };
}]);

angular.module('app')
.controller('usersInvitationsCtrl',['localStorageService','$scope','$stateParams','API','$timeout',
function(localStorageService,$scope,$stateParams,API,$timeout){
    var usersInvitations=this;
    usersInvitations.listLoading=true;
    usersInvitations.invitor=[];
    usersInvitations.invitee=[];
    usersInvitations.invitorLoading=[];
    usersInvitations.inviteeLoading=[];


    API.cui.getPersonInvitations()
    .then(function(res){
        usersInvitations.listLoading=false;
        usersInvitations.list=res;
        $scope.$apply();
    })
    .fail(function(err){
        usersInvitations.listLoading=false;
        console.log(err);
    });

    // This is needed to "attach" the invitor's and the invitee's info to the invitation
    // since the only parameter that we have from the invitation API is the ID
    usersInvitations.getInfo=function(invitorId,inviteeId,index){
        if(usersInvitations.invitor[index]===undefined){
            //get invitor's details
            usersInvitations.invitorLoading[index]=true;
            usersInvitations.inviteeLoading[index]=true;

            API.cui.getPerson({personId:invitorId})
            .then(function(res){
                usersInvitations.invitor[index]=res;
                $scope.$apply();
                $timeout(function(){
                    usersInvitations.invitorLoading[index]=false;
                },500);
            })
            .fail(function(err){
                console.log(err);
            });


            //get invitee's details
            API.cui.getPerson({personId:inviteeId})
            .then(function(res){
                usersInvitations.invitee[index]=res;
                $scope.$apply();
                $timeout(function(){
                    usersInvitations.inviteeLoading[index]=false;
                },500);
            })
            .fail(function(err){
                console.log(err);
            });
        }
    };


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
.controller('usersInviteCtrl',['localStorageService','$scope','$stateParams','API',
function(localStorageService,$scope,$stateParams,API){
    var usersInvite=this;
    usersInvite.user={};
    usersInvite.user.organization={ // organization is hardcoded
                                    // will be replaced once auth is in place
        "id": "OCOVSMKT-CVDEV204002",
        "type": "organization",
        "realm": "APPCLOUD"
    };

    var sendInvitationEmail=function(invitation){
        var message="You've received an invitation to join our organization.<p>" +
            "<a href='localhost:9001/#/users/register?id=" + invitation.id + "&code=" + invitation.invitationCode + "'>Click here" +
            " to register</a>.",
            text;
        console.log(message);
        usersInvite.sending=false;
        usersInvite.sent=true;
        $scope.$digest();
        // if(usersInvite.message && usersInvite.message!==''){
        //     text=usersInvite.message + '<br/><br/>' + message;
        // }
        // else text=message;
        // var emailOpts={
        //     to:invitation.email,
        //     from:'cuiInterface@thirdwave.com',
        //     fromName:'CUI INTERFACE',
        //     subject: 'Request to join our organization',
        //     text: text
        // };
        // Person.sendUserInvitationEmail(emailOpts)
        // .then(function(res){
        //     usersInvite.sending=false;
        //     usersInvite.sent=true;
        // })
        // .catch(function(err){
        //     usersInvite.sending=false;
        //     usersInvite.fail=true;
        // });
    };

    usersInvite.saveUser=function(form){
        // Sets every field to $touched, so that when the user
        // clicks on 'sent invitation' he gets the warnings
        // for each field that has an error.
        angular.forEach(form.$error, function (field) {
            angular.forEach(field, function(errorField){
                errorField.$setTouched();
            });
        });
        if(form.$valid){
            usersInvite.sending=true;
            usersInvite.sent=false;
            usersInvite.fail=false;
            usersInvite.user.timezone="EST5EDT";
            usersInvite.user.language=$scope.$parent.base.getLanguageCode();
            API.doAuth()
            .then(function(){
                return API.cui.createPerson({data:usersInvite.user});
            })
            .then(function(res){
                return API.cui.createPersonInvitation({data:build.personInvitation(res)});
            })
            .then(function(res){
                sendInvitationEmail(res);
            })
            .fail(function(err){
                usersInvite.sending=false;
                usersInvite.fail=true;
                $scope.$digest();
            });
        }
    };

    var build={
        personInvitation:function(invitee){
            return {
                email:invitee.email,
                invitor:{
                    id:'RN3BJI54',
                    type:'person'
                },
                invitee:{
                    id:invitee.id,
                    type:'person'
                },
                targetOrganization:{
                    "id":"OCOVSMKT-CVDEV204002",
                    "type":"organization"
                }
            };
        }
    };



}]);

angular.module('app')
.factory('Person',['$http','$q','API',function($http,$q,API){


    
    var getPeople=function(){
        return API.cui.getPersons;
    };

    var getById=function(id){
        return $http({
            method:'GET',
            url:API.cui.getServiceUrl() + '/person/v1/persons/' + id,
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
            url:API.cui.getServiceUrl() + '/person/v1/personInvitations/',
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

    var getInvitationById=function(id){
        return $http({
            method:'GET',
            url:API.cui.getServiceUrl() + '/person/v1/personInvitations/' + id,
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

    var createInvitation=function(invitee,invitor){
        return $http({
            method:'POST',
            url:API.cui.getServiceUrl() + '/person/v1/personInvitations',
            headers:{
                Accept:'application/vnd.com.covisint.platform.person.invitation.v1+json',
                Authorization:'Bearer ' + API.token(),
                'Content-type':'application/vnd.com.covisint.platform.person.invitation.v1+json'
            },
            data:{
                email:invitee.email,
                invitor:{
                    id:invitor.id,
                    type:'person'
                },
                invitee:{
                    id:invitee.id,
                    type:'person'
                },
                targetOrganization:{
                    "id":"OCOVSMKT-CVDEV204002",
                    "type":"organization"
                }
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
            url:API.cui.getServiceUrl() + '/person/v1/persons/' + id,
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

    var create=function(data){
        return $http({
            method:'POST',
            url:API.cui.getServiceUrl() + '/person/v1/persons',
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

    var sendUserInvitationEmail=function(body){
        return $http({
            'method':'POST',
            'url':'http://localhost:8000/invitation/person',
            'Content-Type': 'application/json',
            'data':body
        })
        .then(function(res){
            return res;
        })
        .catch(function(err){
            return $q.reject(err);
        });
    };

    var getSecurityQuestions=function(){
        return $http({
            method:'GET',
            url: API.cui.getServiceUrl() + '/authn/v2/securityQuestions',
            headers:{
                Accept:'application/vnd.com.covisint.platform.securityquestion.v1+json',
                Authorization:'Bearer ' + API.token()
            }
        })
        .then(function(res){
            return res;
        })
        .catch(function(err){
            return $q.reject(err);
        });
    };

    var getPasswordAccount=function(id){
        return $http({
            method:'GET',
            url: API.cui.getServiceUrl() + '/person/v1/persons/' + id + '/accounts/password',
            headers:{
                Accept: 'application/vnd.com.covisint.platform.person.account.password.v1+json',
                Authorization:'Bearer ' + API.token()
            }
        })
        .then(function(res){
            return res;
        })
        .catch(function(err){
            return $q.reject(err);
        });
    };

    var createPasswordAccount=function(id,data){
        return $http({
            method: 'PUT',
            url: API.cui.getServiceUrl() + '/person/v1/persons/' + id + '/accounts/password',
            headers: {
                Accept: 'application/vnd.com.covisint.platform.person.account.password.v1+json',
                Authorization: 'Bearer ' + API.token(),
                'Content-Type': 'application/vnd.com.covisint.platform.person.account.password.v1+json'
            },
            data:data
        })
        .then(function(res){
            return res;
        })
        .catch(function(err){
            return $q.reject(err);
        });
    };

    var createSecurityQuestions=function(id,data){
        return $http({
            method: 'PUT',
            url: API.cui.getServiceUrl() + '/authn/v2/persons/' + id + '/accounts/securityQuestion',
            headers: {
                Accept: 'application/vnd.com.covisint.platform.person.account.securityQuestion.v1+json',
                Authorization: 'Bearer ' + API.token(),
                'Content-Type': 'application/vnd.com.covisint.platform.person.account.securityQuestion.v1+json'
            },
            data:data
        })
        .then(function(res){
            return res;
        })
        .catch(function(err){
            return $q.reject(err);
        });
    };

    var grantExchangePackage=function(id){
        return $http({
            method:'PUT',
            url: API.cui.getServiceUrl() + '/service/v1/persons/' + id + '/packages/PCOVSMKT-CVDEV204003000',
            headers:{
                Accept: 'application/vnd.com.covisint.platform.package.grant.v1+json',
                Authorization : 'Bearer ' + API.token(),
                'Content-Type': 'application/vnd.com.covisint.platform.package.grant.v1+json',
            },
            data:{
                "version": 1,
                "grantee": {
                    "id": id,
                    "type": "person"
                },
                "servicePackage": {
                    "id": "PCOVSMKT-CVDEV204003000"
                }
            }
        })
        .then(function(res){
            return res;
        })
        .catch(function(err){
            return $q.reject(err);
        });
    };

    var grantCcaPackage=function(id){
        return $http({
            method:'PUT',
            url: API.cui.getServiceUrl() + '/service/v1/persons/' + id + '/packages/PAPC2040605',
            headers:{
                Accept: 'application/vnd.com.covisint.platform.package.grant.v1+json',
                Authorization : 'Bearer ' + API.token(),
                'Content-Type': 'application/vnd.com.covisint.platform.package.grant.v1+json',
            },
            data:{
                "version": 1,
                "grantee": {
                    "id": id,
                    "type": "person"
                },
                "servicePackage": {
                    "id": "PAPC2040605"
                }
            }
        })
        .then(function(res){
            return res;
        })
        .catch(function(err){
            return $q.reject(err);
        });
    };

    var person={
        getAll:API.cui.getUsers,
        getById:getById,
        update:update,
        getInvitations:getInvitations,
        create:create,
        createInvitation:createInvitation,
        sendUserInvitationEmail:sendUserInvitationEmail,
        getInvitationById:getInvitationById,
        getSecurityQuestions:getSecurityQuestions,
        getPasswordAccount:getPasswordAccount,
        createPasswordAccount:createPasswordAccount,
        createSecurityQuestions:createSecurityQuestions,
        grantCcaPackage:grantCcaPackage,
        grantExchangePackage:grantExchangePackage
    };


    return person;

}]);

angular.module('app')
.controller('orgProfileCtrl',['$scope','$stateParams','API',
function($scope,$stateParams,API) {

    var orgProfile = this;
    var userId = 'RN3BJI54'; // this will be replaced with the current user ID

    orgProfile.organization = {};

    API.doAuth()
    .then(function() {
        return API.cui.getPerson({personId: userId});
    })
    .then(function(res) {
        return API.cui.getOrganization({organizationId: res.organization.id});
    })
    .then(function(res) {
        orgProfile.organization = res;
        $scope.$digest();
    })
    .fail(function(err) {
        console.log(err);
    });

}]);


angular.module('app')
.controller('divisionCtrl',['$scope', 'API', function($scope, API) {
	var newDivision = this;
	newDivision.userLogin = {};
    newDivision.orgSearch = {};

    newDivision.passwordPolicies = [  // WORKAROUND CASE #5
        {
            'allowUpperChars': true,
            'allowLowerChars': true,
            'allowNumChars': true,
            'allowSpecialChars': true,
            'requiredNumberOfCharClasses': 3
        },
        {
            'disallowedChars':'^&*)(#$'
        },
        {
            'min': 8,
            'max': 18
        },
        {
            'disallowedWords': ['password', 'admin']
        }
    ];

    API.doAuth()
    .then(function(){
        return API.cui.getSecurityQuestions();
    })
    .then(function(res){
            // Removes first question as it is blank
            res.splice(0,1);

            // Splits questions to use between both dropdowns
            var numberOfQuestions = res.length,
            numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);

            newDivision.userLogin.challengeQuestions1 = res.slice(0,numberOfQuestionsFloor);
            newDivision.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);

            // Preload question into input
            newDivision.userLogin.question1 = newDivision.userLogin.challengeQuestions1[0];
            newDivision.userLogin.question2 = newDivision.userLogin.challengeQuestions2[0];
            return API.cui.getOrganizations();
    })
    .then(function(res) {
        newDivision.organizationList = res;
        $scope.$digest();
    })
    .fail(function(err){
        console.log(err);
    });

    var searchOrganizations = function() {
        // this if statement stops the search from executing
        // when the controller first fires  and the search object is undefined/
        // once pagination is impletemented this won't be needed
        if (newDivision.orgSearch) {
            API.cui.getOrganizations({'qs': [['name', newDivision.orgSearch.name]]})
            .then(function(res){
                newDivision.organizationList = res;
                $scope.$apply();
            })
            .fail(function(err){
                console.log(err);
            });
        }
    };

    $scope.$watchCollection('newDivision.orgSearch', searchOrganizations);

}]);


angular.module('app')
.controller('tloCtrl',['$scope', 'API', function($scope, API) {
	var newTLO = this;
	newTLO.userLogin = {};

  var handleError=function(err){
    console.log('Error\n',err);
  };

  newTLO.passwordPolicies = [ // WORKAROUND CASE #5
    {
      'allowUpperChars': true,
      'allowLowerChars': true,
      'allowNumChars': true,
      'allowSpecialChars': true,
      'requiredNumberOfCharClasses': 3
    },
    {
      'disallowedChars':'^&*)(#$'
    },
    {
      'min': 8,
      'max': 18
    },
    {
      'disallowedWords': ['password', 'admin']
    }
  ];


  API.doAuth()
  .then(function(){
    return API.cui.getSecurityQuestions();
  })
  .then(function(res){
    // Removes first question as it is blank
    res.splice(0,1);

    // Splits questions to use between both dropdowns
    var numberOfQuestions = res.length,
    numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);

    newTLO.userLogin.challengeQuestions1 = res.slice(0,numberOfQuestionsFloor);
    newTLO.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);

    // Preload question into input
    newTLO.userLogin.question1 = newTLO.userLogin.challengeQuestions1[0];
    newTLO.userLogin.question2 = newTLO.userLogin.challengeQuestions2[0];
  })
  .fail(handleError);

}]);


angular.module('app')
.controller('usersRegisterCtrl',['localStorageService','$scope','Person','$stateParams', 'API', '$state',
    function(localStorageService,$scope,Person,$stateParams,API,$state){
        var usersRegister=this;

        usersRegister.loading = true;
        usersRegister.userLogin = {};
        usersRegister.registrationError = false;
        usersRegister.applications = {};
        usersRegister.applications.numberOfSelected = 0;
        usersRegister.showCovisintInfo = false;
        usersRegister.submitting = false;
        usersRegister.targetOrganization = {};

        // Pre polulates the form with info the admin inserted when he first created the invitation
        var getUser = function(id) {
            return API.cui.getPerson({personId:id});
        };

        var getOrganization = function(id) {
            return API.cui.getOrganization({organizationId: id});
        };

        usersRegister.passwordPolicies=[
            {
                'allowUpperChars':true,
                'allowLowerChars':true,
                'allowNumChars':true,
                'allowSpecialChars':true,
                'requiredNumberOfCharClasses':3
            },
            {
                'disallowedChars':'^&*)(#$'
            },
            {
                'min':8,
                'max':18
            },
            {
                'disallowedWords':['password','admin']
            }
        ];


        API.doAuth()
        // Preload user data from Invitation
        .then(function() {
            if(!$stateParams.id || !$stateParams.code) {
                console.log('Invited user reg requires 2 url params: id (invitationId) and code (invitatioCode)')
                return;
            }
            return API.cui.getPersonInvitation({invitationId: $stateParams.id});
        })
        .then(function(res){
            if (res.invitationCode !== $stateParams.code) {
                // Wrong Code
                return;
            }
            return getUser(res.invitee.id);
        })
        .then(function(res){
            usersRegister.invitedUser = res;
            usersRegister.user = res;
            usersRegister.user.addresses = []; // We need to initialize these arrays so ng-model treats them as arrays
            usersRegister.user.addresses[0] = { streets:[] }; // rather than objects
            usersRegister.user.phones = [];
            return getOrganization(res.organization.id);
        })
        .then(function(res){
            usersRegister.targetOrganization = res;
            return API.cui.getSecurityQuestions();   // Load security questions for login form
        })
        .then(function(res) {
            // Removes first question as it is blank
            res.splice(0,1);

            // Splits questions to use between both dropdowns
            var numberOfQuestions = res.length,
            numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);
            usersRegister.userLogin.challengeQuestions1 = res.slice(0,numberOfQuestionsFloor);
            usersRegister.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);

            // Preload question into input
            usersRegister.userLogin.question1 = usersRegister.userLogin.challengeQuestions1[0];
            usersRegister.userLogin.question2 = usersRegister.userLogin.challengeQuestions2[0];
        })
        // Populate Applications List
        .then(function() {
            return API.cui.getOrganizationPackages({'organizationId':usersRegister.targetOrganization.id});
        })
        .then(function(res) {
            var listOfApps=[];
            res.forEach(function(packageGrant){
                var i=0;
                API.cui.getPackageServices({'packageId':packageGrant.servicePackage.id})
                .then(function(res){
                    i++;
                    res.forEach(function(service){
                        service.packageId=packageGrant.servicePackage.id;
                        listOfApps.push(service);
                    });
                    if(i===res.length){
                        usersRegister.applications.list = listOfApps;
                        $scope.$digest();
                    }
                });
            });
        })
        .fail(function(err) {
            console.log(err);
        });

        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        usersRegister.applications.updateNumberOfSelected=function(a){
            if(a!==null) { usersRegister.applications.numberOfSelected++; }
            else { usersRegister.applications.numberOfSelected--; }
        };

        // Process the selected apps when you click next after selecting the apps you need
        usersRegister.applications.process=function(){
            if(usersRegister.applications.processedSelected) var oldSelected=usersRegister.applications.processedSelected;
            usersRegister.applications.processedSelected=[];
            angular.forEach(usersRegister.applications.selected,function(app,i){
               if(app!==null) {
                   usersRegister.applications.processedSelected.push({
                       packageId:app.split(',')[0],
                       name:app.split(',')[1],
                       acceptedTos:((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false)
                   });
               }
           });
            return usersRegister.applications.processedSelected.length;
        };

        // Search apps by name
        usersRegister.applications.searchApplications = function() {
            API.cui.getPackages({'qs': [['name', usersRegister.applications.search]]})
            .then(function(res){
                usersRegister.applications.list = res;
                $scope.$digest();
            })
            .fail(function(err){
                console.log(err);
            });
        };

        usersRegister.applications.toggleCovisintInfo=function(){
            usersRegister.showCovisintInfo = !usersRegister.showCovisintInfo;
        };

        usersRegister.submit = function() {
            usersRegister.submitting = true;
            var user;

            API.doAuth()
            // Update Person
            .then(function() {
                return API.cui.updatePerson({personId: usersRegister.invitedUser.id, data: build.user()});
            })
            // Create Password Account
            .then(function(res) {
                user = res;
                return API.cui.createPersonPassword(build.personPassword(user, usersRegister.targetOrganization));
            })
            // Create Security Account
            .then(function() {
                return API.cui.createSecurityQuestionAccount(build.userSecurityQuestionAccount(user));
            })
            // Activate Person
            .then(function() {
                return API.cui.activatePerson({qs: [['personId', user.id]] });
            })
            // Get Selected Packages
            .then(function() {
                return build.packagesSelected();
            })
            // Create Package Requests
            .then(function(res) {
                if (res.length === 0) {
                    // No Packages Selected
                    return;
                }
                angular.forEach(res, function(servicePackage) {
                    var i=0;
                    API.cui.createPackageRequest(build.packageRequest(servicePackage))
                    .then(function(res){
                        i++;
                        if(i===res.length) {
                            usersRegister.submitting = false;
                            usersRegister.success = true;
                            console.log('User Created');
                            $state.go('misc.success');
                        }
                    })
                    .fail(function(err) {
                        console.log(err);
                    });
                });
            })
            .fail(function(err) {
                console.log(err);
            });
        };

        // Collection of helper functions to build necessaru calls on this controller
        var build = {
            user: function() {
                usersRegister.user.addresses[0].country = usersRegister.userCountry.title;
                usersRegister.user.organization = { id: usersRegister.targetOrganization.id,
                                                    realm: usersRegister.targetOrganization.realm,
                                                    type: 'organization' };
                usersRegister.user.timezone = 'EST5EDT';
                if (usersRegister.user.phones[0]) { usersRegister.user.phones[0].type = 'main'; };
                // Get the current selected language
                usersRegister.user.language = $scope.$parent.base.getLanguageCode();
                return usersRegister.user;
            },
            personPassword: function(user, org) {
                return {
                    personId: user.id,
                    data: {
                        id: user.id,
                        version: '1',
                        username: usersRegister.userLogin.username,
                        password: usersRegister.userLogin.password,
                        passwordPolicy: org.passwordPolicy,
                        authenticationPolicy: org.authenticationPolicy
                    }
                };
            },
            userSecurityQuestions: function(user) {
                return [
                    {
                        question: {
                            id: usersRegister.userLogin.question1.id,
                            type: 'question',
                            realm: user.realm
                        },
                        answer: usersRegister.userLogin.challengeAnswer1,
                        index: 1
                    },
                    {
                        question: {
                            id: usersRegister.userLogin.question2.id,
                            type: 'question',
                            realm: user.realm
                        },
                        answer: usersRegister.userLogin.challengeAnswer2,
                        index: 2
                    }
                ];
            },
            userSecurityQuestionAccount: function(user) {
                return {
                    personId: user.id,
                    data: {
                        version: '1',
                        id: user.id,
                        questions: this.userSecurityQuestions(user)
                    }
                };
            },
            packagesSelected: function() {
                var packages=[];
                angular.forEach(usersRegister.applications.selected,function(servicePackage){
                    packages.push({packageId:servicePackage.split(',')[0]});
                });
                return packages;
            },
            packageRequest: function(packageId) {
                return {
                    data: {
                        requestor: {
                            id: usersRegister.user.id,
                            type: 'person'
                        },
                        servicePackage: {
                            id: packageId.packageId,
                            type: 'servicePackage'
                        },
                        reason: 'Invited User Registration'
                    }
                };
            }
        };
}]);


angular.module('app')
.controller('usersWalkupCtrl',['localStorageService','$scope','Person','$stateParams', 'API','LocaleService','$state',
function(localStorageService,$scope,Person,$stateParams,API,LocaleService,$state){
    var usersWalkup=this;

    usersWalkup.userLogin={};
    usersWalkup.applications={};
    usersWalkup.registering=false;
    usersWalkup.registrationError=false;
    usersWalkup.applications.numberOfSelected=0;
    if(!localStorageService.get('usersWalkup.user')){ // if it's not in the localstorage already
        usersWalkup.user={ addresses:[] }; // We need to initialize these arrays so ng-model treats them as arrays
        usersWalkup.user.addresses[0]={ streets:[] }; // rather than objects
        usersWalkup.user.phones=[];
    }
    else usersWalkup.user=localStorageService.get('usersWalkup.user');

    $scope.$watch('usersWalkup.user',function(a){
        if(a && Object.keys(a).length!==0) localStorageService.set('usersWalkup.user',a);
    },true);

    function handleError(err){
        console.log('Error!\n');
        console.log(err);
    };

    API.doAuth()
    .then(function(res){
        return API.cui.getSecurityQuestions();
    })
    .then(function(res){ // get all the security questions
        res.splice(0,1);
        // Splits questions to use between both dropdowns
        var numberOfQuestions = res.length,
        numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);
        usersWalkup.userLogin.challengeQuestions1 = res.slice(0,numberOfQuestionsFloor);
        usersWalkup.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);
        // Preload question into input
        usersWalkup.userLogin.question1 = usersWalkup.userLogin.challengeQuestions1[0];
        usersWalkup.userLogin.question2 = usersWalkup.userLogin.challengeQuestions2[0];
        return API.cui.getOrganizations();
    })
    .then(function(res){
        usersWalkup.organizationList=res; // populate organization list
    })
    .fail(handleError);

    var searchOrganizations = function(newOrgToSearch) {
        if (newOrgToSearch) {
            API.cui.getOrganizations({'qs': [['name', newOrgToSearch.name]]})
            .then(function(res){
                usersWalkup.organizationList = res;
                $scope.$apply();
            })
            .fail(handleError);
        }
    };

    $scope.$watchCollection('usersWalkup.orgSearch', searchOrganizations);

    // Populate Applications List based on the current organization
    $scope.$watch('usersWalkup.organization',function(newOrgSelected){ // If the organization selected changes reset all the apps
        if(newOrgSelected){
            usersWalkup.applications.numberOfSelected=0; // restart the applications process when a new org
            usersWalkup.applications.processedSelected=undefined; // is selected.
            API.cui.getPackages({'qs': [['owningOrganization.id', newOrgSelected.id]]}) // TODO GET SERVICES INSTEAD
            .then(function(res){
                if(res.length===0) usersWalkup.applications.list=undefined;
                else usersWalkup.applications.list=res;
                $scope.$apply();
            })
            .fail(handleError);
        }
    });

    // Update the number of selected apps everytime on of the boxes is checked/unchecked
    usersWalkup.applications.updateNumberOfSelected=function(checkboxValue){
        if(checkboxValue!==null) usersWalkup.applications.numberOfSelected++;
        else usersWalkup.applications.numberOfSelected--;
    };

    // Process the selected apps when you click next after selecting the apps you need
    // returns number of apps selected
    usersWalkup.applications.process=function(){
        if(usersWalkup.applications.processedSelected) var oldSelected=usersWalkup.applications.processedSelected;
        usersWalkup.applications.processedSelected=[];
        angular.forEach(usersWalkup.applications.selected,function(app,i){
            if(app!==null) {
                usersWalkup.applications.processedSelected.push({
                    id:app.split(',')[0],
                    name:app.split(',')[1],
                    acceptedTos:((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false) // this fixes an issue
                    // where removing an app from the selected list that the user had accepted the terms for
                    // would carry over that acceptance to the next app on the list
                });
            }
        });
        return usersWalkup.applications.processedSelected.length;
    };

    // Search apps by name
    usersWalkup.applications.searchApplications=function(){
        // TODO : GET SERVICES INSTEAD
        API.cui.getPackages({'qs': [['name', usersWalkup.applications.search],['owningOrganization.id', usersWalkup.organization.id]]})
        .then(function(res){

             usersWalkup.applications.list = res;
            $scope.$apply();
        })
        .fail(handleError);
    };

    usersWalkup.submit = function(){
        usersWalkup.submitting=true;
        var user,org;
        API.cui.createPerson({data: build.user()})
        .then(function(res){
            user=res;
            return API.cui.getOrganization({ organizationId:user.organization.id });
        })
        .then(function(res){
            org=res;
            return API.cui.createSecurityQuestionAccount( build.userSecurityQuestionAccount(user) );
        })
        .then(function(){
            return API.cui.createPersonPassword( build.personPassword(user,org) );
        })
        .then(function(){
            return API.cui.createPersonRequest( build.personRequest(user,org) );
        })
        .then(function(){
            usersWalkup.submitting=false;
            usersWalkup.success=true;
            console.log('userCreated.');
            $state.go('misc.success');
        })
        .fail(function(err){
            usersWalkup.success=false;
            handleError(err);
        });
    };

    // collection of helper functions to build necessary calls on this controller
    var build={
        personRequest:function(user,org){
            return {
                data:{
                    id:user.id,
                    registrant:{
                        id: user.id,
                        type: 'person',
                        realm: org.realm
                    },
                    justification:'User walkup registration.',
                    servicePackageRequest:this.packageRequests()
                }
            };
        },
        packageRequests:function(){
            // var packages=[];
            // angular.forEach(usersWalkup.applications.selected,function(servicePackage){
            //     packages.push({packageId:servicePackage.split(',')[0]}); // usersWalkup.applications.selected is an array of strings that looks like
            // });                                                          // ['<appId>,<appName>','<app2Id>,<app2Name>',etc]
            // WORKAROUND CASE #4
            var packages={
                'packageId':usersWalkup.applications.selected[0].split(',')[0]
            };
            return packages;
        },
        personPassword:function(user,org){
            return {
                personId:user.id,
                data:{
                    version:'1',
                    username:usersWalkup.userLogin.username,
                    password:usersWalkup.userLogin.password,
                    passwordPolicy:org.passwordPolicy,
                    authenticationPolicy:org.authenticationPolicy
                }
            };
        },
        userSecurityQuestionAccount:function(user){
            return {
                personId:user.id,
                data: {
                    version:'1',
                    id:user.id,
                    questions: this.userSecurityQuestions(user)
                }
            };
        },
        user:function(){
            // get the title of the country object selected
            usersWalkup.user.addresses[0].country=usersWalkup.userCountry.title;
            usersWalkup.user.organization={id:usersWalkup.organization.id};
            usersWalkup.user.timezone='EST5EDT';
            if(usersWalkup.user.phones[0]) usersWalkup.user.phones[0].type="main";
            // get the current language being used
            usersWalkup.user.language=$scope.$parent.base.getLanguageCode();
            return usersWalkup.user;
        },
        userSecurityQuestions:function(user){
            return [
                {
                    question:{
                        id:usersWalkup.userLogin.question1.id,
                        type:'question',
                        realm:user.realm
                    },
                    answer:usersWalkup.userLogin.challengeAnswer1,
                    index:1
                },
                {
                    question:{
                        id:usersWalkup.userLogin.question2.id,
                        type:'question',
                        realm:user.realm
                    },
                    answer:usersWalkup.userLogin.challengeAnswer2,
                    index:2
                }
            ];
        }
    };


}]);


angular.module('app')
.controller('usersActivateCtrl',['$stateParams','API','Person',
function($stateParams,API,Person){
    var usersActivate=this;

    var personParams=[{
        name:'personId',
        value: $stateParams.id
    }];

    API.cui.activatePerson({params:personParams})
    .then(function(res){
        return Person.grantCcaPackage($stateParams.id);
    })
    .then(function(res){
        return Person.grantExchangePackage($stateParams.id);
    })
    .then(function(res){
        console.log(res);
    })
    .fail(function(err){
        console.log(err);
    });

}]);

angular.module('app')
.controller('usersSearchCtrl',['localStorageService', '$scope','API','Person',
 function(localStorageService, $scope, API,Person){
    var usersSearch=this;
    usersSearch.listLoading=true;

    API.doAuth()
    .then(function(){
        API.cui.getPersons()
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
    });


    var search=function(){
        // this if statement stops the search from executing
        // when the controller first fires  and the search object is undefined/
        // once pagination is impletemented this won't be needed
        if(usersSearch.search){
            console.log(usersSearch.search);
            API.cui.getPersons({data:usersSearch.search})
            .then(function(res){
                usersSearch.list=res;
                $scope.$apply();
            })
            .fail(function(err){
                // TBD : error handling
                // console.log(err);
            });
        }
    };

    $scope.$watchCollection('usersSearch.search',search);



}]);

angular.module('app')
.controller('welcomeCtrl',['$scope', 
	function($scope) {
		var welcome = this;
}]); 


})(angular);