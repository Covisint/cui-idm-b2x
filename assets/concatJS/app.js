(function(angular){
    'use strict';

    angular
    .module('app',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule']);

angular.module('app')
.controller('myApplicationDetailsCtrl',['API','$scope','$stateParams','$state','Helper',
function(API,$scope,$stateParams,$state,Helper) {
    var myApplicationDetails = this;

    var appId = $stateParams.appId; // get the appId from the url
    var packageId = $stateParams.packageId;  // get the packageId from the url
    var i = 0; // this is used to see if the process of getting related and bundled apps is done

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function(err) {
        console.log('Error \n', err);
        $scope.$digest();
    };

    var getBundledApps = function(service) { // WORKAROUND CASE # 1
        myApplicationDetails.bundled = [];
        API.cui.getPackageServices({ 'packageId':packageId })
        .then(function(res) {
            i++;
            res.forEach(function(app) {
                if (app.id !== myApplicationDetails.app.id) {
                    console.log('image?',app);
                    app.grantedDate = service.grantedDate;
                    app.status = service.status;
                    app.parentPackage = packageId; // put the package ID on it so we can redirect the user to the right place when he clicks on the app's name
                    myApplicationDetails.bundled.push(app);
                }
                else {
                    console.log('image?',app);
                    myApplicationDetails.app.mangledUrl = app.mangledUrl;
                    myApplicationDetails.app.urls = app.urls;
                    myApplicationDetails.iconUrl = app.iconUrl;
                }
            });
            if (i === 2) {
                myApplicationDetails.doneLoading = true;
                $scope.$digest();
            }
        })
        .fail(handleError);
    };

    var checkIfAppIsGrantedToUser = function(childService, childPackage, packagesGrantedToUser){
        var pkgGrantThatMatches;

        packagesGrantedToUser.some(function(pkg, i) {
            return childPackage.id === pkg.servicePackage.id ? (pkgGrantThatMatches = packagesGrantedToUser[i], true) : false;
        });

        if (pkgGrantThatMatches) {
            childService.status = pkgGrantThatMatches.status;
            childService.grantedDate = Helper.getDateFromUnixStamp(pkgGrantThatMatches.creation);
        }

        childService.packageId = childPackage.id;
        return childService;
    };

    var getRelatedApps = function(app) {
        // WORKAROUND CASE #3
        myApplicationDetails.related = [];
        var packagesGrantedToUser = [];
        var childServices = [];

        API.cui.getPersonPackages({ personId: API.getUser(), useCuid:true }) // Get All Person Packages
        .then(function(res) {
            res.forEach(function(pkg) {
                packagesGrantedToUser.push(pkg);
            });
            // Return all child packages of package we are currently viewing
            return API.cui.getPackages({qs:[['parentPackage.id',packageId]]});
        })
        .then(function(res) {
            // No Children Packages
            if (res.length === 0) {
                i++;
                if (i === 2) {
                    myApplicationDetails.doneLoading = true;
                    $scope.$digest();
                }
            }

            var packagesThatAreChildrenOfMainPacakge = res;

            // Get services of each child package
            packagesThatAreChildrenOfMainPacakge.forEach(function(childPackage, z) {
                API.cui.getServices({'packageId':childPackage.id})
                .then(function(res) {
                    z++;

                    res.forEach(function(service) {
                        childServices.push(service);
                    });

                    if (z === packagesThatAreChildrenOfMainPacakge.length) {
                        childServices = _.uniq(childServices, function(x) {
                            return x.id;
                        });

                        childServices.forEach(function(service, z) {
                            app = checkIfAppIsGrantedToUser(service, childPackage, packagesGrantedToUser);
                            myApplicationDetails.related.push(app);
                        });

                        myApplicationDetails.doneLoading = true;
                        $scope.$digest();
                    }
                })
                .fail(handleError);
            });
        })
        .fail(handleError);
    };

    var getPackageGrantDetails = function(app) {
        API.cui.getPersonPackage({ personId: API.getUser(), useCuid:true, packageId:packageId })
        .then(function(res) {
            app.grantedDate = Helper.getDateFromUnixStamp(res.creation);
            app.status = res.status;
            myApplicationDetails.app = app;
            getBundledApps(app);
            var thisList = getRelatedApps(app);
        })
        .fail(handleError);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if (appId) {
        API.cui.getService({ 'serviceId':appId })
        .then(function(res) {
            console.log('service',res);
            var app = res;
            getPackageGrantDetails(app);
        })
        .fail(handleError);
    }
    else {
        // message for no appId in the state
    }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START ----------------------------------------------------------------------

    myApplicationDetails.goToDetails = function(application) {
        $state.go('applications.myApplicationDetails', {'packageId':application.packageId, 'appId':application.id});
    };

    // ON CLICK FUNCTIONS END ------------------------------------------------------------------------

}]);


angular.module('app')
.controller('myApplicationsCtrl', ['localStorageService','$scope','$stateParams', 'API','$state','$filter','Helper',
function(localStorageService,$scope,$stateParams,API,$state,$filter,Helper) {
    'use strict';

    var myApplications = this;

    myApplications.doneLoading = false;
    myApplications.sortFlag = false;
    myApplications.categoriesFlag = false;

    myApplications.list = [];
    myApplications.unparsedListOfAvailabeApps = [];

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    var handleError = function(err) {
        console.log('Error \n\n', err);
    };

    var getListOfCategories = function(services) {
        // WORKAROUND CASE # 7
        var categoryList = [];
        var categoryCount = [myApplications.unparsedListOfAvailabeApps.length];

        services.forEach(function(service) {
            if (service.category) {
                var serviceCategoryInCategoryList = _.some(categoryList, function(category, i) {
                    if (angular.equals(category, service.category)) {
                        categoryCount[i+1] ? categoryCount[i+1]++ : categoryCount[i+1] = 1;
                        return true;
                    }
                    return false;
                });

                if (!serviceCategoryInCategoryList) {
                    categoryList.push(service.category);
                    categoryCount[categoryList.length] = 1;
                }
            }
        });
        myApplications.categoryCount = categoryCount;
        return categoryList;
    };

    var listSort = function(listToSort, sortType, order) { // order is a boolean
        listToSort.sort(function(a, b) {
            if (sortType === 'alphabetically') { a = $filter('cuiI18n')(a.name).toUpperCase(), b = $filter('cuiI18n')(b.name).toUpperCase(); }
            else { a = a.dateCreated, b = b.dateCreated; }

            if ( a < b ) {
                if (order) return 1;
                else return -1
            }
            else if( a > b ) {
                if (order) return -1;
                else return 1;
            }
            else return 0;
        });
    };

    var categoryFilter = function (app, category) {
        if (!app.category && category) return false;
        if (!category) return true;
        return $filter('cuiI18n')(app.category)===$filter('cuiI18n')(category);
    };

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    var getApplicationsFromGrants = function(grants) {
        // WORKAROUND CASE #1
        // from the list of grants, get the list of services from each of those service packages
        var i = 0;
        grants.forEach(function(grant) {
            API.cui.getPackageServices({'packageId':grant.servicePackage.id})
            .then(function(res) {
                i++;
                res.forEach(function(service) {
                    service.status = grant.status; // attach the status of the service package to the service
                    service.dateCreated = Helper.getDateFromUnixStamp(grant.creation);
                    service.parentPackage = grant.servicePackage.id;
                    myApplications.list.push(service);
                });
                if (i === grants.length) { // if this is the last grant
                    angular.copy(myApplications.list, myApplications.unparsedListOfAvailabeApps);
                    myApplications.categoryList = getListOfCategories(myApplications.list);
                    myApplications.doneLoading = true;
                    $scope.$digest();
                }
            })
            .fail(handleError);
        });
    };

    API.cui.getPersonPackages({personId:API.getUser(), useCuid:true}) // this returns a list of grant
    .then(function(res) {
        getApplicationsFromGrants(res);
    })
    .fail(handleError);

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

    myApplications.goToDetails = function(application) {
        $state.go('applications.myApplicationDetails', {'packageId':application.parentPackage, 'appId':application.id});
    };

    myApplications.sort = function(sortType) {
        listSort(myApplications.list, sortType, myApplications.sortFlag);
        myApplications.sortFlag=!myApplications.sortFlag;
    };

    myApplications.parseAppsByCategory = function(category) {
        if (category === 'all') {
            myApplications.list = myApplications.unparsedListOfAvailabeApps;
        }
        else {
            var filteredApps = _.filter(myApplications.unparsedListOfAvailabeApps, function(app) {
                return categoryFilter(app, category);
            });
            myApplications.list = filteredApps;
        }
    };

    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

}]);


angular.module('app')
.factory('AppRequests',['$filter',function($filter){
    var appRequestsObject={},
        appRequests={};

    appRequests.set=function(newAppRequestsObject){
        appRequestsObject=newAppRequestsObject;
    };

    appRequests.get=function(){
        return appRequestsObject;
    };

    appRequests.buildReason=function(app,reason){
        var tempApp={};
        angular.copy(app,tempApp);
        tempApp.reason=$filter('translate')('reason-im-requesting') + ' ' +  $filter('cuiI18n')(tempApp.name) + ': ' + reason;
        return tempApp;
    };


    // appRequestsObject is an object that looks something like
    // {
    //    appId:{
    //       id:appId,
    //       reason: reasonForRequestingThisApp,
    //       packageId: idOfThePackageThatContainsThisApp,
    //       ...other app properties,
    //    },
    //    otherAppId:{ ... },
    //    ...
    // }
    appRequests.getPackageRequests=function(userId,arrayOfAppsBeingRequested){
        var arrayOfPackagesBeingRequested=[],
            arrayOfPackageRequests=[];
        arrayOfAppsBeingRequested.forEach(function(app,i){
            if(arrayOfPackagesBeingRequested.indexOf(app.packageId)>-1){ // if we've parsed an app that belongs to the same pacakge
                arrayOfPackageRequests.some(function(packageRequest,i){
                    return arrayOfPackageRequests[i].servicePackage.id===app.packageId? (arrayOfPackageRequests[i].reason=arrayOfPackageRequests[i].reason + ('\n\n' + app.reason),true) : false; // if we already build a package request for this pacakge then append the reason of why we need this other app
                });
            }
            else {
                arrayOfPackageRequests[i]={
                    'requestor':{
                        id:userId,
                        type:'person'
                    },
                    servicePackage:{
                        id:arrayOfAppsBeingRequested[i].packageId,
                        type: 'servicePackage'
                    },
                    reason: app.reason
                };
                arrayOfPackagesBeingRequested[i]=app.packageId; // save the pacakge id that we're requesting in a throwaway array, so it's easier to check if we're
                                                                // already requesting this package
            }
        });
        return arrayOfPackageRequests;
    };

    return appRequests;
}]);

angular.module('app')
.controller('newAppRequestCtrl',['API','$scope','$state','AppRequests',
function(API,$scope,$state,AppRequests){
    var newAppRequest = this;

    var services=[];
    var handleError=function(err){
        console.log('Error\n',err);
    };

    // ON LOAD START ---------------------------------------------------------------------------------

    // AppRequests.set({}); // This resets the package requests, in case the user had selected some and left the page unexpectedly
    var appsBeingRequested=AppRequests.get();
    newAppRequest.numberOfRequests=0;
    newAppRequest.appsBeingRequested=[];
    Object.keys(appsBeingRequested).forEach(function(appId){ // This sets the checkboxes back to marked when the user clicks back
        newAppRequest.numberOfRequests++;
        newAppRequest.appsBeingRequested.push(appsBeingRequested[appId]);
    });


    var user;
    var getListOfCategories=function(services){
        var categoryList=[]; // WORKAROUND CASE # 7
        services.forEach(function(service){
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

    API.cui.getPerson({ personId: API.getUser(), useCuid:true })
    .then(function(res){
        user=res;
        return API.cui.getPackages(); // WORKAROUND CASE #1
    })
    .then(function(res){
        var i=0;
        var packages=res;
        packages.forEach(function(pkg){
            API.cui.getPackageServices({'packageId':pkg.id})
            .then(function(res){
                i++;
                res.forEach(function(service){
                    services.push(service);
                });
                if(i===packages.length){
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

    newAppRequest.listenForEnter=function($event){
        if($event.keyCode===13) $state.go('applications.search',{name:newAppRequest.search})
    };

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------
}]);


angular.module('app')
.controller('applicationReviewCtrl',['$scope','API','AppRequests',function($scope,API,AppRequests){;

    var applicationReview=this;
    var appRequests=AppRequests.get(),
        appsBeingRequested=Object.keys(appRequests),
        userId='IT88ZQJ8';  // this will be replaced with the current user ID;

    var handleError=function(err){
        console.log('Error \n', err);
    };

    // ON LOAD START ---------------------------------------------------------------------------------

    applicationReview.appRequests=[];

    for(var i=0; i<appsBeingRequested.length; i=i+2){
        applicationReview.appRequests.push([appRequests[appsBeingRequested[i]],appRequests[appsBeingRequested[i+1]] || undefined]);
    }


    applicationReview.numberOfRequests=0;
    appsBeingRequested.forEach(function(){
        applicationReview.numberOfRequests++;
    });

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK START ---------------------------------------------------------------------------------

    applicationReview.submit=function(){
        var applicationRequestArray=[];
        applicationReview.attempting=true;
        applicationReview.appRequests.forEach(function(appRequestGroup,i){
            appRequestGroup.forEach(function(appRequest,x){
                if(appRequest){
                    if(!appRequest.reason || appRequest.reason===''){
                        appRequest.reasonRequired=true;
                        applicationReview.attempting=false;
                        applicationReview.error=true;
                    }
                    else {
                        appRequest.reasonRequired=false;
                        applicationReview.error=false;
                        applicationRequestArray[i+x] = AppRequests.buildReason(appRequest,appRequest.reason);
                    }
                }
            });
        });
        if(applicationReview.error) return;
        var appRequests=AppRequests.getPackageRequests(userId,applicationRequestArray),
            i=0;
        appRequests.forEach(function(appRequest){
            API.cui.createPackageRequest({data:appRequest})
            .then(function(res){
                i++;
                if(i===appRequests.length){
                    applicationReview.attempting=false;
                    applicationReview.success=true;
                    $scope.$digest();
                }
            })
            .fail(handleError);
        });
    };

    // ON CLICK END -----------------------------------------------------------------------------------

}]);

angular.module('app')
.controller('applicationSearchCtrl',['API','$scope','$stateParams','$state','$filter','AppRequests',
function(API,$scope,$stateParams,$state,$filter,AppRequests){
    var applicationSearch = this;

    var nameSearch=$stateParams.name;
    var categorySearch=$stateParams.category;
    var packageList=[],
        userPackageList=[], // WORKAROUND CASE #1
        userOrg;

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

    var getApplications=function(packageListPassed, packagesTheOrgHasGrants){
        var listOfAvailabeApps=[],i=0;
        var listOfPackages=packageListPassed || packageList; // so we can call this without passing the orgPackageList again
        listOfPackages.forEach(function(pkg){
            if(pkg.requestable){
                API.cui.getPackageServices({'packageId':pkg.id})
                .then(function(res){
                    i++
                    res.forEach(function(service){
                        if(packagesTheOrgHasGrants.indexOf(pkg.id)>-1) service.orgHasGrants=true; // if the org has grants to the package
                        service.packageId=pkg.id;
                        listOfAvailabeApps.push(service);
                    });
                    if(i===listOfPackages.length){
                        applicationSearch.unparsedListOfAvailabeApps=listOfAvailabeApps;
                        applicationSearch.parseAppsByCategoryAndName()
                        $scope.$digest();
                    }
                })
                .fail(handleError);
            }
            else i++;
            if(i===listOfPackages.length){
                applicationSearch.unparsedListOfAvailabeApps=listOfAvailabeApps;
                applicationSearch.parseAppsByCategoryAndName();
                $scope.$digest();
            }
        });
    };

    var getAvailableApplications=function(userPackageGrantList){ // get apps that the user can request and doesn't already have grants to
        packageList.forEach(function(pkg,i){
            var userGrantInPackageList = _.some(userPackageList,function(userPackageGrant){ // if the user has grants to a package in the list
                return pkg.id===userPackageGrant.servicePackage.id; // remove that package from the list.
            });
            if(userGrantInPackageList) packageList.splice(i,1);
        });
        API.cui.getOrganizationPackages({'organizationId':userOrg})
        .then(function(res){
            var packagesTheOrgHasGrants=[];
            res.forEach(function(pkgGrant){
                packagesTheOrgHasGrants.push(pkgGrant.servicePackage.id);
            });
            getApplications(packageList, packagesTheOrgHasGrants);
        })
        .fail(handleError);
    };

    var getUserPackageGrants=function(){ // gets applications that are available for request
        API.cui.getPersonPackages({personId:API.getUser(),useCuid:true})
        .then(function(res){
            userPackageList=res;
            getAvailableApplications(userPackageList);
        })
        .fail(handleError);
    };


    API.cui.getPerson({personId:API.getUser(),useCuid:true})
    .then(function(res){
        userOrg=res.organization.id;
        user=res;
        return API.cui.getPackages(); // WORKAROUND CASE #1
    })
    .then(function(res){
        var i=0;
        var packages=res;
        packages.forEach(function(pkg){
            packageList.push(pkg);
        });
        getUserPackageGrants();
    })
   .fail(handleError);

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    applicationSearch.listenForEnter=function($event){
        if($event.keyCode===13) applicationSearch.parseAppsByCategoryAndName();
    };

    applicationSearch.numberOfRequests=0;
    var processNumberOfRequiredApps=function(pkgRequest){
        if(pkgRequest) applicationSearch.numberOfRequests++;
        else  applicationSearch.numberOfRequests--;
    };

    applicationSearch.packageRequests=AppRequests.get();
    applicationSearch.appCheckbox={};
    Object.keys(applicationSearch.packageRequests).forEach(function(appId){ // This sets the checkboxes back to marked when the user clicks back
        applicationSearch.appCheckbox[appId]=true;  // after being in request review
        applicationSearch.numberOfRequests++;
    });

    applicationSearch.toggleRequest=function(application){
        if(!applicationSearch.packageRequests[application.id]) applicationSearch.packageRequests[application.id]=application;
        else delete applicationSearch.packageRequests[application.id];
        processNumberOfRequiredApps(applicationSearch.packageRequests[application.id]);
    };

    var bundled=[],related=[];

    var detailsFetchStep=0;

    var getBundledApps=function($index,application){ // WORKAROUND CASE # 1
        bundled[$index]=[];
        API.cui.getPackageServices({ 'packageId':application.packageId })
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
                applicationSearch.detailsLoadingDone[application.id]=true;
                $scope.$digest();
            }
        })
        .fail(handleError);
    };


    var getRelatedAppsThatHaventBeenGranted=function(packagesToIgnore,packages,$index,application){
        var z=0;
        packages.forEach(function(pkg){
            if(packagesToIgnore.indexOf(pkg.id)===-1) {
                API.cui.getPackageServices({ 'packageId':pkg.id })
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
                            applicationSearch.detailsLoadingDone[application.id]=true;
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
                    applicationSearch.detailsLoadingDone[application.id]=true;
                    $scope.$digest();
                }
            }
            var z=0;
            var packages=res;
            var packagesToIgnore=[]; // WORKAROUND CASE #3
            API.cui.getPersonPackages({personId:API.getUser(),useCuid:true})
            .then(function(res){
                res.forEach(function(pkgGrant,i){
                    if(_.some(packages,function(pkg){
                        return pkg.id===pkgGrant.servicePackage.id
                    })){
                        packagesToIgnore.push(pkgGrant.servicePackage.id);
                    }
                });
                getRelatedAppsThatHaventBeenGranted(packagesToIgnore,packages,$index,application)
            })
            .fail(handleError);
        })
        .fail(handleError);
    };

    applicationSearch.detailsLoadingDone={};

    applicationSearch.getRelatedAndBundled=function($index,application){
        if(applicationSearch.detailsLoadingDone[application.id]){ // If we've already loaded the bundled and related apps for this app then we don't do it again
            return;
        }
        detailsFetchStep=0;
        getBundledApps($index,application);
        getRelatedApps($index,application);
    };

    applicationSearch.saveRequestsAndCheckout=function(){
        AppRequests.set(applicationSearch.packageRequests);
        $state.go('applications.reviewRequest');
    }

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);


angular.module('app')
.controller('baseCtrl',['$state','Countries','Timezones','Languages','$scope','$translate','LocaleService','User','API','Menu',
function($state,Countries,Timezones,Languages,$scope,$translate,LocaleService,User,API,Menu){
    var base=this;

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

    base.menu=Menu;

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
    base.getLanguageCode = Languages.getCurrentLanguageCode;

    base.countries=Countries;
    base.timezones=Timezones.all;
    base.languages=Languages.all;

    base.user = User.user;
    base.authInfo = API.authInfo;

    base.logout=API.cui.covLogout;


}]);

angular.module('app')
.config(['$translateProvider','$locationProvider','$stateProvider','$urlRouterProvider',
    '$injector','localStorageServiceProvider','$cuiIconProvider','$cuiI18nProvider',
function($translateProvider,$locationProvider,$stateProvider,$urlRouterProvider,
    $injector,localStorageServiceProvider,$cuiIconProvider,$cuiI18nProvider){

    localStorageServiceProvider.setPrefix('cui');

    var templateBase='assets/app/'; // base directori of your partials


    var returnCtrlAs=function(name,asPrefix){ // build controller as syntax easily. returnCtrlAs('test','new') returns 'testCtrl as newTest'
        // returnCtrlAs('test') returns 'testCtrl as test'
        return name + 'Ctrl as ' + ( asPrefix? asPrefix : '' ) + ( asPrefix? name[0].toUpperCase() + name.slice(1,name.length) : name );
    };

    $stateProvider
        .state('base',{
            url: '/',
            templateUrl: templateBase + 'base/base.html',
            controller: returnCtrlAs('base'),
        })
        .state('users',{
            url: '/users',
            templateUrl: templateBase + 'misc/users/users.html'
        })
        .state('users.search',{
            url: '/',
            templateUrl: templateBase + 'misc/users/search/users.search.html',
            controller: returnCtrlAs('usersSearch')
        })
        .state('users.invitations',{
            url: '/invitations',
            templateUrl: templateBase + 'misc/invitations/search/users.invitations.search.html',
            controller: returnCtrlAs('usersInvitations')
        })
        .state('users.invite',{
            url: '/invite',
            templateUrl: templateBase + 'misc/invitations/invite/users.invite.html',
            controller: returnCtrlAs('usersInvite')
        })
        .state('users.activate',{
            url: '/activate/:id',
            templateUrl: templateBase + 'users/users.activate/users.activate.html',
            controller: returnCtrlAs('usersActivate')
        })
        .state('registration',{
            url: '/register',
            templateUrl: templateBase + 'registration/registration.html'
        })
        .state('registration.invited',{ // invited Registration
            url: '/invitation?id&code',
            templateUrl: templateBase + 'registration/userInvited/users.register.html',
            controller: returnCtrlAs('usersRegister')
        })
        .state('registration.walkup',{
            url: '/walkup',
            templateUrl:templateBase + 'registration/userWalkup/users.walkup.html',
            controller: returnCtrlAs('usersWalkup'),
            // menu:{
            //     desktop:false
            // }
        })
        .state('registration.tlo',{
            url: '/top-level-org',
            templateUrl: templateBase + 'registration/newTopLevelOrg/topLevelOrg.registration.html',
            controller: returnCtrlAs('tlo','new')
        })
        .state('registration.division',{
            url: '/new-division',
            templateUrl: templateBase + 'registration/newDivision/division.registration.html',
            controller: returnCtrlAs('division','new')
        })
        .state('applications',{
            url: '/applications',
            templateUrl : templateBase + 'applications/applications.html'
        })
        .state('applications.myApplications',{
            url: '/',
            templateUrl: templateBase + 'applications/my-applications/my-applications.html',
            controller: returnCtrlAs('myApplications')
        })
        .state('applications.myApplicationDetails',{
            url: '/:packageId/:appId',
            templateUrl: templateBase + 'applications/my-applications/my-application-details.html',
            controller: returnCtrlAs('myApplicationDetails')
        })
        .state('applications.newRequest',{
            url: '/request',
            templateUrl: templateBase + 'applications/new-request&review/new-request.html',
            controller: returnCtrlAs('newAppRequest')
        })
        .state('applications.search',{
            url: '/search?name&category&page',
            templateUrl: templateBase + 'applications/search/search.html',
            controller: returnCtrlAs('applicationSearch')
        })
        .state('applications.reviewRequest',{
            url: '/review',
            templateUrl: templateBase + 'applications/new-request&review/review.html',
            controller: returnCtrlAs('applicationReview')
        })
        .state('welcome',{
            url: '/welcome',
            templateUrl: templateBase + 'misc/welcome/welcome.html'
        })
        .state('welcome.screen',{
            url: '/welcome',
            templateUrl: templateBase + 'misc/welcome/welcome.screen.html',
            controller: returnCtrlAs('welcome')
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
            templateUrl: templateBase + 'profile/profile.html'
        })
        .state('profile.user',{
            url: '/user:id',
            templateUrl: templateBase + 'profile/user/users.edit.html',
            controller: returnCtrlAs('usersEdit')
        })
        .state('profile.organization', {
            url: '/organization',
            templateUrl: templateBase + 'profile/organization/organization.profile.html',
            controller: returnCtrlAs('orgProfile')
        })
        .state('empty', {
            url: '/empty',
            templateUrl: templateBase + 'empty/empty.html',
            controller: returnCtrlAs('empty')
        });

    // $locationProvider.html5Mode(true);

    //fixes infinite digest loop with ui-router (do NOT change unless absolutely required)
    $urlRouterProvider.otherwise( function($injector) {
      var $state = $injector.get("$state");
      $state.go('welcome.screen');
    });

    $cuiI18nProvider.setLocaleCodesAndNames( // put these in the order of preference for language fallback
        // ADD LANGUAGES HERE ONLY
        {
            'en':'English',
            'pt':'Português (Portuguese)',
            'tr':'Türk (Turkish)',
            'zh':'中文 (Chinese - Simplified)',
            'fr':'Français (French)',
            'es':'Español (Spanish)',
            'it':'Italiano (Italian)',
            'ru':'Pусский (Russian)',
            'th':'ไทย (Thai)',
            'ja':'日本語 (Japanese)',
            'de':'Deutsche (German)'
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

    $cuiIconProvider.iconSet('cui','bower_components/cui-icons/dist/icons/icons-out.svg','0 0 48 48');
    $cuiIconProvider.iconSet('fa','bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg','0 0 216 216');
}]);

angular.module('app')
.run(['LocaleService','$rootScope','$state','$http','$templateCache','$cuiI18n','User','cui.authorization.routing','Menu','API','$cuiIcon',
    function(LocaleService,$rootScope,$state,$http,$templateCache,$cuiI18n,User,routing,Menu,API,$cuiIcon){
    //add more locales here
    var languageNameObject=$cuiI18n.getLocaleCodesAndNames();
    for(var LanguageKey in languageNameObject){
        LocaleService.setLocales(LanguageKey,languageNameObject[LanguageKey]);
    };

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        // cui Auth
        API.handleCovAuthResponse(event,toState,toParams,fromState,fromParams);
        // determines if user is able to access the particular route we're navigation to
        routing($rootScope, $state, toState, toParams, fromState, fromParams, User.getEntitlements());
        // for menu handling
        Menu.handleStateChange(toState.menu);
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) { // this is for base.goBack()
        $state.previous = {};
        $state.previous.name = fromState;
        $state.previous.params = fromParams;
    });

    angular.forEach($cuiIcon.getIconSets(),function(iconSettings,namespace){
        $http.get(iconSettings.path,{
            cache: $templateCache
        });
    });
}]);



angular.module('app')
.controller('emptyCtrl',['API',function(API) {
    // This empty controller is used to prevent an authHandler loop in the JWT token process!
}]);


angular.module('app')
.factory('API',['$state','User','$rootScope','$window','$location',function($state,User,$rootScope,$window,$location){

    var myCUI = cui.api();
    cui.log('cui.js v', myCUI.version()); // CUI Log

    var authInfo={};

    // myCUI.setServiceUrl('PRD'); // PRD
    myCUI.setServiceUrl('STG'); // STG

    var originUri = 'coke-idm.run.covapp.io'; // Coke
    // var originUri = 'coke-idm.run.covapp.io'; // Covisint

    function jwtAuthHandler() {
        return myCUI.covAuth({
            originUri: originUri,
            authRedirect: window.location.href.split('#')[0] + '#/empty',
            appRedirect: $location.path()
        });
    };

    myCUI.setAuthHandler(jwtAuthHandler);

    return {
        cui: myCUI,
        getUser: User.get,
        setUser: User.set,
        getUserEntitlements: User.getEntitlements,
        setUserEntitlements: User.setEntitlements,
        handleCovAuthResponse: function(e,toState,toParams,fromState,fromParams){
            var self=this;
            myCUI.covAuthInfo({originUri:originUri});
            myCUI.handleCovAuthResponse({selfRedirect:true})
            .then(function(res) {
                if(toState.name==='empty'){
                    if(res.appRedirect!=='empty') {
                        Object.keys($location.search()).forEach(function(searchParam){
                            $location.search(searchParam,null);
                        });
                        $location.path(res.appRedirect).replace();
                    }
                    return;
                }
                else {
                    self.setUser(res);
                    self.setAuthInfo(res.authInfo);
                    myCUI.getPersonRoles({ personId: self.getUser() })
                    .then(function(roles) {
                        var roleList = [];
                        roles.forEach(function(role) {
                            roleList.push(role.name);
                        });
                        self.setUserEntitlements(roleList);
                        $rootScope.$digest();
                    });
                }
            });
        },
        setAuthInfo:function(newAuthInfo){
            angular.copy(newAuthInfo[0],authInfo);
        },
        authInfo:authInfo
    };
}]);


angular.module('app')
.factory('Countries',['$http','$rootScope','$translate',function($http,$rootScope,$translate){

    var countries=[];

    var GetCountries=function(locale){
        return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/' + locale + '.json');
    };

    var setCountries=function(language){
        language = language || 'en';
        if(language.indexOf('_')>-1){
            language=language.split('_')[0];
        }
        GetCountries(language)
        .then(function(res){
            res.data.forEach(function(country){
                countries.push(country);
            });
        })
        .catch(function(err){
            console.log(err);
        });
    };

    $rootScope.$on('languageChange',function(e,args){
        setCountries(args);
    });

    setCountries($translate.proposedLanguage());

    return countries;
}]);

angular.module('app')
.factory('Helper',[function(){

    return {
        getDateFromUnixStamp:function(unixTimeStamp){
            var dateGranted = new Date(unixTimeStamp);
            var dateGrantedFormatted = (dateGranted.getMonth()+1) + '.' + dateGranted.getDate() + '.' + dateGranted.getFullYear();
            return dateGrantedFormatted;
        }

    };

}]);

angular.module('app')
.factory('Languages',['$cuiI18n','LocaleService',function($cuiI18n,LocaleService){

    var languages=$cuiI18n.getLocaleCodesAndNames();

    return {
        all:languages,
        getCurrentLanguageCode : function(){
            if(LocaleService.getLocaleCode().indexOf('_')>-1) return LocaleService.getLocaleCode().split('_')[0];
            else return LocaleService.getLocaleCode();
        }
    };
}]);

angular.module('app')
.factory('Menu',[ '$rootScope',function($rootScope){
    return {
        desktop:{
            'state':'open', // default state for desktop menu
            'enabled':true,
            'open':function(){
                this.state='open';
            },
            'close':function(){
                this.state='closed';
            },
            'toggle':function(){
                this.state==='open' ? this.state='closed' : this.state='open';
            },
            'hide':function(){
                this.enabled=false;
            },
            'show':function(){
                this.enabled=true;
            }
        },

        mobile:{
            'state':'closed', // default state for mobile menu
            'enabled':true,
            'open':function(){
                this.state='open';
            },
            'close':function(){
                this.state='close';
            },
            'toggle':function(){
                this.state==='open' ? this.state='closed' : this.state='open';
            },
            'hide':function(){
                this.enabled=false;
            },
            'show':function(){
                this.state=true;
            }
        },

        handleStateChange: function(stateMenuOptions){
            if (!angular.isDefined(stateMenuOptions)){
                this.desktop.show();
                this.mobile.show();
            }
            else {
                (angular.isDefined(stateMenuOptions.desktop) && stateMenuOptions.desktop=== false)? this.desktop.hide() : this.desktop.show();
                (angular.isDefined(stateMenuOptions.mobile) && stateMenuOptions.mobile=== false)? this.mobile.hide() : this.mobile.show();
            }
        }
    };
}]);


angular.module('app')
.factory('Timezones',['$http','$rootScope','$translate',function($http,$rootScope,$translate){

    var timezones=[];

    var GetTimezones=function(locale){
        return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/timezones/' + locale + '.json');
    };

    var setTimezones=function(language){
        language = language || 'en';
        if(language.indexOf('_')>-1){
            language=language.split('_')[0];
        }
        GetTimezones(language)
        .then(function(res){
            res.data.forEach(function(timezone){
                timezones.push(timezone);
            });
        })
        .catch(function(err){
            console.log(err);
        });
    };

    var getTimezoneById=function(id){
        if(!id) return '';
        return _.find(timezones,function(timezone){
            return timezone.id===id;
        }).name;
    };

    $rootScope.$on('languageChange',function(e,args){
        setTimezones(args);
    });

    setTimezones($translate.proposedLanguage());

    return {
        all:timezones,
        timezoneById:getTimezoneById
    }
}]);

angular.module('app')
.factory('User',['$rootScope',function($rootScope) {

    var user = {
        entitlements: []
    };

    return {
        set : function(newUser) {
            user.cuid = newUser.cuid;
        },
        get : function() {
            return user.cuid || '[cuid]';
        },
        setEntitlements : function(newEntitlements){
            user.entitlements=newEntitlements;
        },
        getEntitlements : function(){
            return user.entitlements;
        }
    };

}]);

angular.module('app')
.controller('usersInviteCtrl',['localStorageService','$scope','$stateParams','API',
function(localStorageService,$scope,$stateParams,API){
    'use strict';

    var usersInvite = this;
    usersInvite.userToInvite = {};

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var sendInvitationEmail = function(invitation) {
        var message = "You've received an invitation to join our organization.<p>" +
            "<a href='localhost:9001/#/users/register?id=" + invitation.id + "&code=" + invitation.invitationCode + "'>Click here" +
            " to register</a>.", text;

        console.log(message);

        usersInvite.sending = false;
        usersInvite.sent = true;
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

    var build = {
        personInvitation:function(user, invitee) {
            return {
                email: invitee.email,
                invitor: {
                    id: user.id,
                    type: 'person'
                },
                invitee: {
                    id: invitee.id,
                    type: 'person'
                },
                targetOrganization: {
                    'id': user.organization.id,
                    'type': 'organization'
                }
            };
        }
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    API.cui.getPerson({personId: API.getUser(), useCuid:true})
    .then(function(res) {
        usersInvite.user = res;
        usersInvite.userToInvite.organization = res.organization;
    })
    .fail(function(error) {
        console.log(error);
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    usersInvite.saveUser = function(form) {
        // Sets every field to $touched, so that when the user
        // clicks on 'sent invitation' he gets the warnings
        // for each field that has an error.
        angular.forEach(form.$error, function (field) {
            angular.forEach(field, function(errorField) {
                errorField.$setTouched();
            });
        });

        if (form.$valid) {
            usersInvite.sending = true;
            usersInvite.sent = false;
            usersInvite.fail = false;

            usersInvite.userToInvite.timezone = 'EST5EDT';
            usersInvite.userToInvite.language = $scope.$parent.base.getLanguageCode();
            API.cui.createPerson({data:usersInvite.userToInvite})
            .then(function(res){
                return API.cui.createPersonInvitation({data:build.personInvitation(usersInvite.user, res)});
            })
            .then(function(res){
                sendInvitationEmail(res);
            })
            .fail(function(err) {
                usersInvite.sending = false;
                usersInvite.fail = true;
                $scope.$digest();
            });
        }
    };

    // ON CLICK END ----------------------------------------------------------------------------------

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


angular.module('app')
.controller('orgProfileCtrl',['$scope','$stateParams','API',
    function($scope,$stateParams,API) {

    var orgProfile = this;

    var handleError=function(err){
        console.log('Error', err);
    };

    orgProfile.organization = {};

    API.cui.getPerson({ personId: API.getUser(), useCuid:true })
    .then(function(res) {
        return API.cui.getOrganization({organizationId: res.organization.id});
    })
    .then(function(res) {
        orgProfile.organization = res;
        orgProfile.loadingDone = true;
        $scope.$digest();
    })
    .fail(function(err) {
        console.log(err);
    });

}]);


angular.module('app')
.controller('usersEditCtrl',['$scope','$timeout','API','$cuiI18n','Timezones',
function($scope,$timeout,API,$cuiI18n,Timezones){
    'use strict';

    var usersEdit = this;

    usersEdit.loading = true;
    usersEdit.saving = true;
    usersEdit.fail = false;
    usersEdit.success = false;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var selectTextsForQuestions = function() {
        usersEdit.challengeQuestionsTexts=[];
        angular.forEach(usersEdit.userSecurityQuestions.questions, function(userQuestion){
            var question = _.find(usersEdit.allSecurityQuestionsDup, function(question){return question.id === userQuestion.question.id});
            this.push(question.question[0].text);
        }, usersEdit.challengeQuestionsTexts);
    };

    var resetTempUser=function(){
        if(!angular.equals(usersEdit.tempUser,usersEdit.user)) angular.copy(usersEdit.user,usersEdit.tempUser);
    };

    usersEdit.resetTempObject = function(master, temp) {
        // Used to reset the temp object to the original when a user cancels their edit changes
        if(!angular.equals(master,temp)) angular.copy(master, temp);
    };

    usersEdit.resetPasswordFields = function() {
        // Used to set the password fields to empty when a user clicks cancel during password edit
        usersEdit.userPasswordAccount.currentPassword = '';
        usersEdit.userPasswordAccount.password = '';
        usersEdit.passwordRe = '';
    };

    usersEdit.checkIfRepeatedSecurityAnswer = function(securityQuestions,formObject) {
        securityQuestions.forEach(function(secQuestion,i){
            var securityAnswerRepeatedIndex=_.findIndex(securityQuestions,function(secQuestionToCompareTo,z){
                return z!==i && secQuestion.answer && secQuestionToCompareTo.answer && secQuestion.answer.toUpperCase()===secQuestionToCompareTo.answer.toUpperCase();
            });
            if(securityAnswerRepeatedIndex>-1) {
                if(formObject['answer'+securityAnswerRepeatedIndex]) formObject['answer'+securityAnswerRepeatedIndex].$setValidity('securityAnswerRepeated',false);
                if(formObject['answer'+i]) formObject['answer'+i].$setValidity('securityAnswerRepeated',false);
            }
            else {
                if(formObject['answer'+i]) formObject['answer'+i].$setValidity('securityAnswerRepeated',true);
            }
        });
    };

    usersEdit.resetChallengeQuestion = function(index) {
        usersEdit.resetTempObject(usersEdit.userSecurityQuestions.questions[index], usersEdit.tempUserSecurityQuestions[index]);
    };

    usersEdit.timezoneById=Timezones.timezoneById;

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    usersEdit.toggleOffFunctions={};
    usersEdit.pushToggleOff=function(toggleOffObject){
        usersEdit.toggleOffFunctions[toggleOffObject.name]=toggleOffObject.function;
    };

    API.cui.getPerson({personId: API.getUser(), useCuid:true})
    .then(function(res) {
        if (!res.addresses) {
            // If the person has no addresses set we need to initialize it as an array
            // to follow the object structure
            res.addresses = [{}];
            res.addresses[0].streets = [[]];
        }
        usersEdit.user={};
        usersEdit.tempUser={};
        angular.copy(res,usersEdit.user);
        angular.copy(res,usersEdit.tempUser);
        return API.cui.getSecurityQuestionAccount({ personId: API.getUser(), useCuid:true });
    })
    .then(function(res) {
        console.log(res);
        usersEdit.userSecurityQuestions = res;
        usersEdit.tempUserSecurityQuestions = angular.copy(usersEdit.userSecurityQuestions.questions);
        return API.cui.getSecurityQuestions();
    })
    .then(function(res) {
        usersEdit.allSecurityQuestions = res;
        usersEdit.allSecurityQuestionsDup = angular.copy(res);
        usersEdit.allSecurityQuestions.splice(0,1);

        // Splits questions to use between both dropdowns
        var numberOfQuestions = usersEdit.allSecurityQuestions.length,
        numberOfQuestionsFloor = Math.floor(numberOfQuestions/3);
        //Allocating options to three questions
        usersEdit.allChallengeQuestions0 = usersEdit.allSecurityQuestions.splice(0,numberOfQuestionsFloor);
        usersEdit.allChallengeQuestions1 = usersEdit.allSecurityQuestions.splice(0,numberOfQuestionsFloor);
        usersEdit.allChallengeQuestions2 = usersEdit.allSecurityQuestions.splice(0,numberOfQuestionsFloor);

        selectTextsForQuestions();
        return API.cui.getPersonPassword({ personId: API.getUser(), useCuid:true });
    })
    .then(function(res) {
        usersEdit.userPasswordAccount = res;
        usersEdit.loading = false;
        $scope.$digest();
    })
    .fail(function(err) {
        console.log(err);
        usersEdit.loading = false;
        $scope.$digest();
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    usersEdit.toggleAllOff=function(){
        angular.forEach(usersEdit.toggleOffFunctions,function(toggleOff){
            toggleOff();
        });
        resetTempUser();
    };

    // ON CLICK END ----------------------------------------------------------------------------------

    // UPDATE FUNCTIONS START ------------------------------------------------------------------------

    usersEdit.updatePerson = function(section,toggleOff) {
        if(angular.equals(usersEdit.tempUser, usersEdit.user)){
            if(toggleOff) toggleOff();
            return;
        }
        if(section) usersEdit[section]={
            submitting:true
        };
        if (!usersEdit.userCountry) {
            usersEdit.tempUser.addresses[0].country = usersEdit.user.addresses[0].country;
        }
        else {
            usersEdit.tempUser.addresses[0].country = usersEdit.userCountry.description.code;
        }

        API.cui.updatePerson({ personId: API.getUser(), useCuid:true , data:usersEdit.tempUser})
        .then(function() {
            angular.copy(usersEdit.tempUser, usersEdit.user);
            if(section) usersEdit[section].submitting=false;
            if(toggleOff) toggleOff();
            $scope.$digest();
        })
        .fail(function(error) {
            console.log(error);
            if(section) usersEdit[section].submitting=false;
            if(section) usersEdit[section].error=true;
            $scope.$digest();
        });
    };

    usersEdit.updatePassword = function(section,toggleOff) {
        if(section) usersEdit[section]={
            submitting:true
        };

        API.cui.updatePersonPassword({personId: API.getUser(), data: usersEdit.userPasswordAccount})
        .then(function(res) {
            if(section) usersEdit[section].submitting=false;
            if(toggleOff) toggleOff();
            usersEdit.resetPasswordFields();
            $scope.$digest();
        })
        .fail(function(err) {
            console.log(err);
            if(section) usersEdit[section].submitting=false;
            if(section) usersEdit[section].error=true;
            $scope.$digest();
        });
    };

    usersEdit.updatePersonSecurityAccount = function() {
        // Updates user's Security Account in IDM
        // Currently API has issue when updating
    };

   usersEdit.saveChallengeQuestions = function(section,toggleOff) {
        if(section) usersEdit[section]={
            submitting:true
        };
        usersEdit.userSecurityQuestions.questions = angular.copy(usersEdit.tempUserSecurityQuestions);
        selectTextsForQuestions();

        API.cui.updateSecurityQuestionAccount({
          personId: API.getUser(),
          data: {
            version: '1',
            id: API.getUser(),
            questions: usersEdit.userSecurityQuestions.questions
            }
        })
        .then(function(res) {
            if(section) usersEdit[section].submitting=false;
            if(toggleOff) toggleOff();
            $scope.$digest();
        })
        .fail(function(err) {
            console.log(err);
            if(section) usersEdit[section].submitting=false;
            if(section) usersEdit[section].error=true;
            $scope.$digest();
        });
    };
    // UPDATE FUNCTIONS END --------------------------------------------------------------------------

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

    API.cui.getSecurityQuestions()
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


  API.cui.getSecurityQuestions()
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
    'use strict';

    var usersRegister=this;

    usersRegister.loading = true;
    usersRegister.registrationError = false;
    usersRegister.showCovisintInfo = false;
    usersRegister.submitting = false;

    usersRegister.userLogin = {};        
    usersRegister.applications = {};
    usersRegister.targetOrganization = {};

    usersRegister.applications.numberOfSelected = 0;

    usersRegister.passwordPolicies = [
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
            'disallowedWords':['password','admin']
        }
    ];
            
    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var getUser = function(id) {
        return API.cui.getPerson({personId:id});
    };

    var getOrganization = function(id) {
        return API.cui.getOrganization({organizationId: id});
    };

    var build = {
        // Collection of helper functions to build necessaru calls on this controller
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
            var packages = [];
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

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if(!$stateParams.id || !$stateParams.code) {
        console.log('Invited user reg requires 2 url params: id (invitationId) and code (invitatioCode)');
            // TODO : ADD MESSAGE IF USER HAS TAMPERED WITH THE URL
    }
    else {
        API.cui.getPersonInvitation({invitationId: $stateParams.id})
        .then(function(res){
            if (res.invitationCode !== $stateParams.code) {
                // TODO : ADD MESSAGE IF USER HAS TAMPERED WITH THE
                console.log('Wrong invitation code.');
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
            return API.cui.getSecurityQuestions(); // Load security questions for login form
        })
        .then(function(res) {
            res.splice(0,1); // Removes first question as it is blank

            // Splits questions to use between both dropdowns
            var numberOfQuestions = res.length,
            numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);
            usersRegister.userLogin.challengeQuestions1 = res.slice(0,numberOfQuestionsFloor);
            usersRegister.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);

            // Preload question into input
            usersRegister.userLogin.question1 = usersRegister.userLogin.challengeQuestions1[0];
            usersRegister.userLogin.question2 = usersRegister.userLogin.challengeQuestions2[0];
        })
        .then(function() {
            // Populate Applications List
            return API.cui.getOrganizationPackages({'organizationId':usersRegister.targetOrganization.id});
        })
        .then(function(res) {
            var listOfApps = [];

            res.forEach(function(packageGrant) {
                var i = 0;
                API.cui.getPackageServices({'packageId':packageGrant.servicePackage.id})
                .then(function(res){
                    i++;

                    res.forEach(function(service) {
                        service.packageId=packageGrant.servicePackage.id;
                        listOfApps.push(service);
                    });

                    if(i === res.length) {
                        usersRegister.applications.list = listOfApps;
                        $scope.$digest();
                    }
                });
            });
        })
        .fail(function(err) {
            console.log(err);
        });
    }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    usersRegister.applications.updateNumberOfSelected = function(a) {
        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        if (a !== null) { usersRegister.applications.numberOfSelected++; }
        else { usersRegister.applications.numberOfSelected--; }
    };

    usersRegister.applications.process = function() {
        // Process the selected apps when you click next after selecting the apps you need
        if (usersRegister.applications.processedSelected) {
            var oldSelected = usersRegister.applications.processedSelected;
        }
        usersRegister.applications.processedSelected = [];

        angular.forEach(usersRegister.applications.selected,function(app, i) {
            if (app !== null) {
                usersRegister.applications.processedSelected.push({
                    packageId:app.split(',')[0],
                    name:app.split(',')[1],
                    acceptedTos:((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false)
                });
            }
        });
        return usersRegister.applications.processedSelected.length;
    };

    usersRegister.applications.searchApplications = function() {
        // Search apps by name
        API.cui.getPackages({'qs': [['name', usersRegister.applications.search]]})
        .then(function(res){
            usersRegister.applications.list = res;
            $scope.$digest();
        })
        .fail(function(err){
            console.log(err);
        });
    };

    usersRegister.applications.toggleCovisintInfo = function() {
        usersRegister.showCovisintInfo = !usersRegister.showCovisintInfo;
    };

    usersRegister.submit = function() {
        usersRegister.submitting = true;
        var user;

        API.cui.updatePerson({personId: usersRegister.invitedUser.id, data: build.user()})
        .then(function(res) {
            user = res;
            return API.cui.createPersonPassword(build.personPassword(user, usersRegister.targetOrganization));
        })
        .then(function() {
            // Create Security Account
            return API.cui.createSecurityQuestionAccount(build.userSecurityQuestionAccount(user));
        })
        .then(function() {
            // Activate Person
            return API.cui.activatePerson({qs: [['personId', user.id]] });
        })
        .then(function() {
            // Get Selected Packages
            return build.packagesSelected();
        })
        .then(function(res) {
            // Create Package Requests
            if (res.length === 0) {
                // No Packages Selected
                return;
            }
            angular.forEach(res, function(servicePackage) {
                var i = 0;
                API.cui.createPackageRequest(build.packageRequest(servicePackage))
                .then(function(res) {
                    i++;
                    if (i === res.length) {
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

    // ON CLICK END ----------------------------------------------------------------------------------

}]);


angular.module('app')
.controller('usersWalkupCtrl',['localStorageService','$scope','Person','$stateParams', 'API','LocaleService','$state',
function(localStorageService,$scope,Person,$stateParams,API,LocaleService,$state) {
    'use strict';

    var usersWalkup = this;
    usersWalkup.userLogin = {};
    usersWalkup.applications = {};
    usersWalkup.errorMessage = '';
    usersWalkup.registering = false;
    usersWalkup.userNameExistsError = false;
    usersWalkup.applications.numberOfSelected = 0;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    function handleError(err) {
        console.log('Error!\n');
        console.log(err);
    }

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

    // collection of helper functions to build necessary calls on this controller
    var build = {
        personRequest:function(user) {
            return {
                data: {
                    id: user.id,
                    registrant: {
                        id: user.id,
                        type: 'person',
                        realm: user.realm
                    },
                    justification: 'User walkup registration',
                    servicePackageRequest: this.packageRequests()
                }
            };
        },
        packageRequests:function() {
            var packages = [];
            angular.forEach(usersWalkup.applications.selected,function(servicePackage) {
                // usersWalkup.applications.selected is an array of strings that looks like
                // ['<appId>,<appName>','<app2Id>,<app2Name>',etc]
                packages.push({packageId:servicePackage.split(',')[0]}); 
            });
            return packages;
        },
        personPassword:function() {
            return {
                version: '1',
                username: usersWalkup.userLogin.username,
                password: usersWalkup.userLogin.password,
                passwordPolicy: usersWalkup.organization.passwordPolicy,
                authenticationPolicy: usersWalkup.organization.authenticationPolicy
            };
        },
        userSecurityQuestionAccount:function() {
            return {
                version: '1',
                questions: this.userSecurityQuestions()
            };
        },
        user:function() {
            // Get title of selected country object
            usersWalkup.user.addresses[0].country = usersWalkup.userCountry.title;
            usersWalkup.user.organization = {id: usersWalkup.organization.id};
            usersWalkup.user.timezone = 'EST5EDT';
            if(usersWalkup.user.phones[0]) usersWalkup.user.phones[0].type = 'main';
            // Get current used language
            usersWalkup.user.language = $scope.$parent.base.getLanguageCode();
            return usersWalkup.user;
        },
        userSecurityQuestions:function() {
            return [
                {
                    question: {
                        id: usersWalkup.userLogin.question1.id,
                        type: 'question',
                        realm: usersWalkup.organization.realm
                    },
                    answer: usersWalkup.userLogin.challengeAnswer1,
                    index: 1
                },
                {
                    question: {
                        id: usersWalkup.userLogin.question2.id,
                        type: 'question',
                        realm: usersWalkup.organization.realm
                    },
                    answer: usersWalkup.userLogin.challengeAnswer2,
                    index: 2
                }
            ];
        },
        submitData:function() {
            var submitData = {};
            submitData.person = this.user();
            submitData.passwordAccount = this.personPassword();
            submitData.securityQuestionAccount = this.userSecurityQuestionAccount();
            return submitData;
        }
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if (!localStorageService.get('usersWalkup.user')) {
        // If it's not in the localstorage already
        // We need to initialize these arrays so ng-model treats them as arrays
        // Rather than objects
        usersWalkup.user = { addresses:[] };
        usersWalkup.user.addresses[0] = { streets:[] };
        usersWalkup.user.phones = [];
    }
    else usersWalkup.user = localStorageService.get('usersWalkup.user');

    // Get all security questions
    API.cui.getSecurityQuestions()
    .then(function(res) { 
        res.splice(0,1);
        // Splits questions to use between both dropdowns
        var numberOfQuestions = res.length,
        numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);
        usersWalkup.userLogin.challengeQuestions1 = res.slice(0, numberOfQuestionsFloor);
        usersWalkup.userLogin.challengeQuestions2 = res.slice(numberOfQuestionsFloor);

        // Preload question into input
        usersWalkup.userLogin.question1 = usersWalkup.userLogin.challengeQuestions1[0];
        usersWalkup.userLogin.question2 = usersWalkup.userLogin.challengeQuestions2[0];
        return API.cui.getOrganizations();
    })
    .then(function(res){
        // Populate organization list
        usersWalkup.organizationList = res;
    })
    .fail(handleError);

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    usersWalkup.applications.updateNumberOfSelected = function(checkboxValue) {
        // Update the number of selected apps everytime on of the boxes is checked/unchecked
        if (checkboxValue !== null) usersWalkup.applications.numberOfSelected++;
        else usersWalkup.applications.numberOfSelected--;
    };

    usersWalkup.applications.process = function() {
        // Process the selected apps when you click next after selecting the apps you need
        // returns number of apps selected
        if (usersWalkup.applications.processedSelected) {
            var oldSelected = usersWalkup.applications.processedSelected;
        }
        usersWalkup.applications.processedSelected = [];
        angular.forEach(usersWalkup.applications.selected,function(app, i) {
            if (app !== null) {
                usersWalkup.applications.processedSelected.push({
                    id: app.split(',')[0],
                    name: app.split(',')[1],
                    // this fixes an issue
                    // where removing an app from the selected list that the user had accepted the terms for
                    // would carry over that acceptance to the next app on the list
                    acceptedTos: ((oldSelected && oldSelected[i])? oldSelected[i].acceptedTos : false) 
                });
            }
        });
        return usersWalkup.applications.processedSelected.length;
    };

    usersWalkup.applications.searchApplications=function() {
        // Search apps by name
        API.cui.getPackages({'qs': [['name', usersWalkup.applications.search],['owningOrganization.id', usersWalkup.organization.id]]})
        .then(function(res) {
             usersWalkup.applications.list = res;
            $scope.$apply();
        })
        .fail(handleError);
    };

    usersWalkup.submit = function() {
        usersWalkup.submitting = true;
        usersWalkup.registrationError = false;
        var user = build.submitData();

        API.cui.registerPerson({data: user})
        .then(function(res) {
            if (usersWalkup.applications.selected) {
                return API.cui.createPersonRequest(build.personRequest(res.person));
            }
            else {
                return;
            }
        })
        .then(function(res) {
            usersWalkup.submitting = false;
            usersWalkup.success = true;
            $state.go('misc.success');
        })
        .fail(function(err) {
            if (err.responseJSON.apiMessage === 'Username already exists') {
                usersWalkup.registrationError = true;
                usersWalkup.errorMessage = 'cui-error-username-exists';
            }
            usersWalkup.success = false;
            usersWalkup.submitting = false;
            $scope.$digest();
        });
    };

    // ON CLICK END ----------------------------------------------------------------------------------

    // WATCHERS START --------------------------------------------------------------------------------

    $scope.$watch('usersWalkup.user',function(a) {
        if (a && Object.keys(a).length!==0) localStorageService.set('usersWalkup.user',a);
    }, true);

    $scope.$watchCollection('usersWalkup.orgSearch', searchOrganizations);

    // Populate Applications List based on the current organization
    $scope.$watch('usersWalkup.organization', function(newOrgSelected) {
        if (newOrgSelected) {
            // If the organization selected changes reset all the apps 
            usersWalkup.applications.numberOfSelected = 0; // Restart applications count
            usersWalkup.applications.processedSelected = undefined; // Restart applications selected

            API.cui.getOrganizationPackages({organizationId : newOrgSelected.id})
            .then(function(grants) {
                usersWalkup.applications.list = [];
                if (grants.length === 0) {
                    usersWalkup.applications.list = undefined;
                    $scope.$digest();
                }
                var i = 0;
                grants.forEach(function(grant) {
                    API.cui.getPackageServices({'packageId':grant.servicePackage.id})
                    .then(function(res) {
                        usersWalkup.applications.list.push(res[0]);
                        i++;
                        if (i === grants.length) {
                            $scope.$digest();
                        }
                    });
                });
            })
            .fail(handleError);
        }
    });

    // WATCHERS END ----------------------------------------------------------------------------------

}]);


angular.module('app').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('assets/app/applications/applications.html',
    "<div ui-view class=cui-applications></div>"
  );


  $templateCache.put('assets/app/applications/my-applications/my-application-details.html',
    "<div>\n" +
    "\n" +
    "  <div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/my-applications target=blank>here</a></div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-action>\n" +
    "    <span class=cui-action__title ui-sref=applications.myApplications>{{'my-applications' | translate}}</span>\n" +
    "    \n" +
    "    <div class=cui-action__actions>\n" +
    "      <svg ui-sref=applications.newRequest xmlns=http://www.w3.org/2000/svg class=\"cui-action__icon cui-action__icon--new\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "        <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#new></use>\n" +
    "      </svg>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=\"cui-applications__main-container cui-applications__main-container--full\">\n" +
    "    \n" +
    "    <div class=cui-loading__container ng-if=!myApplicationDetails.doneLoading>\n" +
    "      <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=myApplicationDetails.doneLoading>\n" +
    "      \n" +
    "      <div class=\"cui-media cui-media--vertical\">\n" +
    "        \n" +
    "        <div class=cui-media__image-container>\n" +
    "          <a ng-href={{myApplicationDetails.app.mangledUrl}} target=_blank><img class=cui-media__image ng-src={{myApplicationDetails.iconUrl}} alt=\"\"></a>\n" +
    "        </div>\n" +
    "        \n" +
    "        <div>\n" +
    "          <h3 class=cui-media__title>{{myApplicationDetails.app.name | cuiI18n}}</h3>\n" +
    "          <span class=cui-media__content>{{ 'granted' | translate }}: {{myApplicationDetails.app.grantedDate}}</span>\n" +
    "          <span ng-class=\"'cui-status--'+myApplicationDetails.app.status\">{{myApplicationDetails.app.status | uppercase}}</span>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div class=\"cui-tabs class-toggle\">\n" +
    "        <ul class=cui-tabs__nav>\n" +
    "          <li class=cui-tabs__tab-container><a class=cui-tabs__tab data-pane=tab1 ng-class=\"{'cui-tabs__tab--active':!myApplicationDetails.inClaims}\" ng-click=\"myApplicationDetails.inClaims=false\">{{'application-details' | translate}}</a></li>\n" +
    "          <li class=cui-tabs__tab-container><a class=cui-tabs__tab data-pane=tab2 ng-class=\"{'cui-tabs__tab--active':myApplicationDetails.inClaims}\" ng-click=\"myApplicationDetails.inClaims=true\">{{'my-claims' | translate}}</a></li>\n" +
    "        </ul>\n" +
    "        <div class=cui-tabs__content>\n" +
    "          \n" +
    "          <div id=tab1 class=cui-tabs__tab-pane ng-class=\"{'cui-tabs__tab-pane--active':!myApplicationDetails.inClaims}\">\n" +
    "            <div class=cui-applications__details>\n" +
    "              \n" +
    "              <div ng-if=\"myApplicationDetails.bundled.length===0 && myApplicationDetails.related.length===0\">\n" +
    "                <p>{{'cui-no-application-details' | translate}}</p>\n" +
    "              </div>\n" +
    "              \n" +
    "              <div ng-if=\"myApplicationDetails.bundled.length!==0\">\n" +
    "                <h4 class=h6>{{'bundled-applications' | translate}}</h4>\n" +
    "                <div class=cui-media ng-repeat=\"application in myApplicationDetails.bundled\">\n" +
    "                  <div class=cui-media__body>\n" +
    "                    <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n" +
    "                    <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n" +
    "                    <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate}}</span> \n" +
    "                    <span ng-if=!application.status>{{'request' | translate}}</span>\n" +
    "                  </div>\n" +
    "                  <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n" +
    "                </div>\n" +
    "              </div>\n" +
    "              \n" +
    "              <div ng-if=\"myApplicationDetails.related.length!==0\">\n" +
    "                <h4 class=h6>{{'related-applications' | translate}}</h4>\n" +
    "                <div class=cui-media ng-repeat=\"application in myApplicationDetails.related\">\n" +
    "                  <div class=cui-media__body>\n" +
    "                    <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n" +
    "                    <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n" +
    "                    <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate}}</span> \n" +
    "                    <span ng-if=!application.status>{{'request' | translate}}</span>\n" +
    "                  </div>\n" +
    "                  <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "          \n" +
    "          <div id=tab2 class=cui-tabs__tab-pane ng-class=\"{'cui-tabs__tab-pane--active':myApplicationDetails.inClaims}\">\n" +
    "            \n" +
    "            <p>{{'cui-no-claims' | translate}}</p>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div class=cui-applications__desktop-tabs>\n" +
    "\n" +
    "        \n" +
    "        <div class=\"cui-tile cui-applications__left\">\n" +
    "          <h4 class=\"cui-tile__title cui-applications__title\">Application Details</h4>\n" +
    "          <div class=\"cui-tile__body cui-applications__details\">\n" +
    "            \n" +
    "            <div ng-if=\"myApplicationDetails.bundled.length===0 && myApplicationDetails.related.length===0\">\n" +
    "              <p>{{'cui-no-application-details' | translate}}</p>\n" +
    "            </div>\n" +
    "            \n" +
    "            <div ng-if=\"myApplicationDetails.bundled.length!==0\">\n" +
    "              <h4 class=h6>{{'bundled-applications' | translate}}</h4>\n" +
    "              <div class=cui-media ng-repeat=\"application in myApplicationDetails.bundled\">\n" +
    "                <div class=cui-media__body>\n" +
    "                  <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n" +
    "                  <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n" +
    "                  <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate}}</span> \n" +
    "                  <span ng-if=!application.status>{{'request' | translate}}</span>\n" +
    "                </div>\n" +
    "                <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n" +
    "              </div>\n" +
    "            </div>\n" +
    "            \n" +
    "            <div ng-if=\"myApplicationDetails.related.length!==0\">\n" +
    "              <h4 class=h6>{{'related-applications' | translate}}</h4>\n" +
    "                <div class=cui-media ng-repeat=\"application in myApplicationDetails.related\">\n" +
    "                  <div class=cui-media__body>\n" +
    "                    <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n" +
    "                    <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n" +
    "                    <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate}}</span> \n" +
    "                    <span class=cui-button ng-if=!application.status>{{'request' | translate}}</span>\n" +
    "                  </div>\n" +
    "                  <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "          \n" +
    "          <div class=\"cui-tile cui-applications__right\">\n" +
    "            <h4 class=\"cui-tile__title cui-tile__title--bg-light cui-applications__title\">My Claims</h4>\n" +
    "            <div class=cui-tile__body>\n" +
    "              \n" +
    "              <p>{{'cui-no-claims' | translate}}</p>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n"
  );


  $templateCache.put('assets/app/applications/my-applications/my-applications.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/my-applications target=blank>here</a></div>\n" +
    "\n" +
    "<div class=cui-action>\n" +
    "  <span class=cui-action__title ui-sref=applications.myApplications>{{'my-applications' | translate}}</span>\n" +
    "  <div class=cui-action__actions>\n" +
    "    \n" +
    "    <div class=cui-action__action-container ng-click=\"myApplications.sortClicked =! myApplications.sortClicked\" id=sort-button off-click=\"myApplications.sortClicked=false\">\n" +
    "      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "        <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#sort14></use>\n" +
    "      </svg>\n" +
    "      <span class=cui-action__action-label>Sort</span>\n" +
    "      \n" +
    "      <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#sort-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=myApplications.sortClicked>\n" +
    "        <p ng-click=\"myApplications.sort('alphabetically')\">Alphabetically</p>\n" +
    "        <p ng-click=\"myApplications.sort('date'); \">By Date Added</p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    \n" +
    "    <div class=cui-action__action-container>\n" +
    "      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "        <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#filter10></use>\n" +
    "      </svg>\n" +
    "      <span class=cui-action__action-label>Refine</span>\n" +
    "    </div>\n" +
    "    \n" +
    "    <div class=cui-action__action-container ng-click=\"myApplications.categoriesClicked =! myApplications.categoriesClicked\" id=categories-button off-click=\"myApplications.categoriesClicked=false\">\n" +
    "      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 48\">\n" +
    "        <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#categories></use>\n" +
    "      </svg>\n" +
    "      <span class=cui-action__action-label>Categories</span>\n" +
    "      \n" +
    "      <div class=\"cui-popover cui-popover--top cui-popover__categories-popover\" tether target=#categories-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=myApplications.categoriesClicked>\n" +
    "        <p ng-click=\"myApplications.parseAppsByCategory('all')\">{{'all' | translate}} ({{myApplications.categoryCount[0]}})</p>\n" +
    "        <div ng-repeat=\"category in myApplications.categoryList\">\n" +
    "          <p ng-click=myApplications.parseAppsByCategory(category)>{{category| cuiI18n}} ({{myApplications.categoryCount[$index+1]}})</p>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <svg ui-sref=applications.newRequest xmlns=http://www.w3.org/2000/svg class=\"cui-action__icon cui-action__icon--new\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "      <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#new></use>\n" +
    "    </svg>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=cui-applications__main-container>\n" +
    "  <div class=cui-loading__container ng-if=!myApplications.doneLoading>\n" +
    "    <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "  </div>\n" +
    "  <div class=sorting>\n" +
    "    \n" +
    "  </div>\n" +
    "  <div ng-if=myApplications.doneLoading>\n" +
    "    <div class=\"cui-media cui-media--border\" ng-repeat=\"application in myApplications.list track by application.id\" ng-click=myApplications.goToDetails(application)>\n" +
    "      <div class=cui-media__image-container>\n" +
    "        <a ng-href={{application.mangledUrl}} target=_blank><img class=cui-media__image ng-src={{application.iconUrl}} alt=\"\"></a>\n" +
    "      </div>\n" +
    "      <div class=\"cui-media__body cui-media__body--full\">\n" +
    "        <h3 class=cui-media__title ng-bind=\"application.name | cuiI18n\"></h3>\n" +
    "        <span class=cui-media__content ng-if=application.category> {{application.category | cuiI18n}}</span>\n" +
    "        <span class=cui-status ng-class=\"'cui-status--'+application.status\" ng-bind=\"application.status | lowercase\"></span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/applications/new-request&review/new-request.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/new-request%26review target=blank>here</a> and the layout styles <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/applications.scss class=cui-link target=blank>here</a></div>\n" +
    "<div class=cui-applications__new-request>\n" +
    "    <div class=cui-action>\n" +
    "        <div class=cui-action__title>{{'new-request' | translate}}</div>\n" +
    "        <div class=cui-action__actions>\n" +
    "            <svg ui-sref=applications.myApplications xmlns=http://www.w3.org/2000/svg class=\"cui-action__icon cui-action__icon--close\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "              <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close></use>\n" +
    "            </svg>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cui-action cui-action--alt\">\n" +
    "        <h3 class=cui-action__title>{{'select-applications' | translate}}</h3>\n" +
    "        <div class=cui-action__actions>\n" +
    "            <svg ng-click=\"newAppRequest.requestPopover=!newAppRequest.requestPopover\" off-click=\"newAppRequest.requestPopover=false\" xmlns=http://www.w3.org/2000/svg id=cui-applications__requested-apps class=\"cui-icon cui-icon--folder\" ng-class=\"{'cui-action__icon--active': newAppRequest.numberOfRequests != 0}\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 40 33\">\n" +
    "              <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#folder></use>\n" +
    "            </svg>\n" +
    "            <sup class=cui-action__icon-counter ng-class=\"{'cui-action__icon-counter--active': newAppRequest.numberOfRequests != 0}\">{{newAppRequest.numberOfRequests}}</sup>\n" +
    "            \n" +
    "            <div tether class=cui-action__popover target=#cui-applications__requested-apps attachment=\"top middle\" targetattachment=\"bottom left\" offset=\"-20px 50px\" ng-class=\"{'hide--opacity': !newAppRequest.requestPopover}\">\n" +
    "              <span class=cui-action__popover-title>{{'collected-items-for-request' | translate}}</span>\n" +
    "              <div class=cui-action__popover-section>\n" +
    "                <span ng-if=\"newAppRequest.appsBeingRequested.length===0\">{{'no-selected-apps' | translate}}<br></span>\n" +
    "                <ul ng-if=\"newAppRequest.appsBeingRequested.length > 0\">\n" +
    "                    <li ng-repeat=\"application in newAppRequest.appsBeingRequested\">{{application.name | cuiI18n}}</li>\n" +
    "                </ul>\n" +
    "              </div>\n" +
    "              <span ng-if=\"newAppRequest.appsBeingRequested.length > 0\" class=cui-action__popover-button ui-sref=applications.reviewRequest>{{'submit-request' | translate}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=cui-applications__main-container>\n" +
    "        <div>\n" +
    "            <div class=cui-applications__search-options>\n" +
    "                <div class=cui-input-button>\n" +
    "                    <input type=text class=cui-input-button__input ng-model=newAppRequest.search placeholder=\"{{'search-by-app-name' | translate}}\">\n" +
    "                    <button class=cui-input-button__button ui-sref=applications.search({name:newAppRequest.search})>{{'go' | translate}}</button>\n" +
    "                </div>\n" +
    "                <div class=cui-applications__center-text>or</div>\n" +
    "                <button class=\"cui-button cui-button--full-width\" ui-sref=applications.search>{{'browse-applications' | translate}}</button>\n" +
    "                \n" +
    "            </div>\n" +
    "            <div ng-if=!newAppRequest.loadingDone> \n" +
    "                <div class=cui-loading__container ng-if=!myApplicationDetails.doneLoading>\n" +
    "                    <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-repeat=\"category in newAppRequest.categories\" ng-if=newAppRequest.loadingDone>\n" +
    "                \n" +
    "                <div class=cui-applications__categories ui-sref=\"applications.search({category:'{{ category | cuiI18n }}' })\">\n" +
    "                    <h4 class=cui-applications__category>{{ category | cuiI18n }}</h4>\n" +
    "                    <svg xmlns=http://www.w3.org/2000/svg class=\"cui-icon cui-icon--light-grey\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n" +
    "                      <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#chevron18></use>\n" +
    "                    </svg>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/applications/new-request&review/review.html',
    "<div class=\"class-toggle cui-modal\" ng-if=\"applicationReview.success\" toggled-class=\"cui-modal--hide\" ng-click=\"toggleClass()\">\n" +
    "    <div class=\"cui-modal__pane\">\n" +
    "        <cui-icon cui-svg-icon=\"cui:check_with_border\" class=\"cui-modal__icon\"></cui-icon>\n" +
    "        <span class=\"cui-modal__primary-message\">{{'cui-success' | translate}}</span>\n" +
    "        <span class=\"cui-modal__secondary-message\">{{'your-app-request-in-review' | translate}}</span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"code-info\">Code for this page can be found <a class=\"cui-link\" href=\"https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/mew-request&review\" target=\"blank\">here</a> and the layout styles <a href=\"https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/applications.scss\" class=\"cui-link\" target=\"blank\">here</a></div>\n" +
    "<div class=\"cui-applications__review\">\n" +
    "    <div class=\"cui-action\">\n" +
    "        <div class=\"cui-action__title\">{{'new-request' | translate}}</div>\n" +
    "        <div class=\"cui-action__actions\">\n" +
    "            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-action__icon cui-action__icon--close\" ui-sref=\"applications.myApplications\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#close\"></use>\n" +
    "            </svg>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cui-action cui-action--alt\">\n" +
    "        <div class=\"cui-action__title\" ng-if=\"!applicationSearch.category\" ng-click=\"base.goBack()\">< {{'new-request' | translate}}</div>\n" +
    "        <span class=\"cui-action__title\" ng-if=\"applicationSearch.category\" ng-click=\"base.goBack()\">< {{applicationSearch.category}}</span>\n" +
    "        <div class=\"cui-input-button cui-input-button--alt-bg\">\n" +
    "            <input class=\"cui-input-button__input\" ng-model=\"applicationSearch.nameSearch\" ng-keypress=\"applicationSearch.listenForEnter($event)\" placeholder=\"{{'filter-list' | translate}}\"/>\n" +
    "            <button class=\"cui-input-button__button\" ng-click=\"applicationSearch.parseAppsByCategoryAndName()\">{{'filter' | translate}}</button>\n" +
    "        </div>\n" +
    "        <div class=\"cui-action__actions\">\n" +
    "            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-icon--folder\" ng-class=\"{'cui-action__icon--active': applicationReview.numberOfRequests != 0}\"preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 40 33\">\n" +
    "              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#folder\"></use>\n" +
    "            </svg>\n" +
    "            <sup class=\"cui-action__icon-counter\" ng-class=\"{'cui-action__icon-counter--active': applicationReview.numberOfRequests != 0}\">{{applicationReview.numberOfRequests}}</sup>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cui-applications__main-container\" style=\"position:relative\">\n" +
    "        <div class=\"cui-loading__container\" ng-if=\"applicationReview.attempting\">\n" +
    "          <div class=\"cui-loading cui-loading--center\" ></div>\n" +
    "        </div>\n" +
    "            <div>\n" +
    "                <h3 class=\"h4 h4--bold\">{{'requested-items' | translate}}:</h3>\n" +
    "                <div class=\"cui-applications__review-apps\">\n" +
    "                 <div class=\"cui-tile--headless\" ng-repeat=\"applicationGroup in applicationReview.appRequests\">\n" +
    "                    <div ng-repeat=\"application in applicationGroup\" ng-if=\"application.name\"> <!-- Put the flex wrapper here @shane -->\n" +
    "                        <div class=\"cui-media\">\n" +
    "                          <!-- Image container to be added when images are available\n" +
    "                          <div class=\"cui-media__image-container\">\n" +
    "                            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-media__image\">\n" +
    "                              <use xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#user\"></use>\n" +
    "                            </svg>\n" +
    "                          </div> -->\n" +
    "                          <div class=\"cui-media__body\">\n" +
    "                            <h3 class=\"cui-media__title\">{{application.name | cuiI18n}}</h3>\n" +
    "                            <span class=\"cui-media__content\">{{'owning-org' | translate}}: {{application.owningOrganization.name}}</span>\n" +
    "                          </div>\n" +
    "                        </div>\n" +
    "                        <!-- Terms and conditions is not provided by the API, leaving it out for now -->\n" +
    "                        <div class=\"cui-applications__review-text-input\">\n" +
    "                            <label class=\"cui-text-area__label\">{{'request-reason' | translate}}</label>\n" +
    "                            <span class=\"cui-error h6\" ng-if=\"application.reasonRequired\">{{'you-must-enter-a-reason' | translate}}</span>\n" +
    "                            <textarea class=\"cui-text-area\" ng-model=\"application.reason\" ng-class=\"{'<!-- @shane textarea invalid class here -->' : application.reasonRequired}\"></textarea>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                </div>\n" +
    "                <div class=\"cui-applications__submit-options\">\n" +
    "                    <a class=\"cui-link\" ng-click=\"base.goBack()\">{{'cui-cancel' | translate}}</a>\n" +
    "                    <button class=\"cui-button\" ng-click=\"applicationReview.submit()\">\n" +
    "                        <span ng-if=\"!applicationReview.error\">{{'submit-request' | translate}}</span>\n" +
    "                        <span ng-if=\"applicationReview.error===true\">Error! Try again?</span>\n" +
    "                    </button>\n" +
    "                </div>\n" +
    "                <!-- @shane ng-if=\"applicationReview.attempting\" is when submit gets pressed and it's trying to submit the requests  ^ put a spinner on the button-->\n" +
    "                <!-- if there's an error ng-if=\"applicationReview.error\" -->\n" +
    "                <!-- if it's successful ng-if=\"applicationReview.success\" -->\n" +
    "\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/applications/search/search.html',
    "<div class=\"code-info\">Markup for this page can be found <a class=\"cui-link\" href=\"https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/search\" target=\"blank\">here</a> and the layout styles <a href=\"https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/applications.scss\" class=\"cui-link\" target=\"blank\">here</a></div>\n" +
    "<div class=\"cui-applications__search\">\n" +
    "    <div class=\"cui-action\">\n" +
    "        <div class=\"cui-action__title\">{{'new-request' | translate}}</div>\n" +
    "        <div class=\"cui-action__actions\">\n" +
    "            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-action__icon cui-action__icon--close\" ui-sref=\"applications.myApplications\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#close\"></use>\n" +
    "            </svg>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cui-action cui-action--alt\">\n" +
    "        <div class=\"cui-action__title\" ng-if=\"!applicationSearch.category\" ui-sref=\"applications.newRequest\"><\n" +
    "            {{'categories' | translate}}</div>\n" +
    "        <span class=\"cui-action__title\" ng-if=\"applicationSearch.category\" ui-sref=\"applications.newRequest\">< {{applicationSearch.category}}</span>\n" +
    "        <div class=\"cui-input-button cui-input-button--alt-bg\">\n" +
    "            <input class=\"cui-input-button__input\" ng-model=\"applicationSearch.nameSearch\" ng-keypress=\"applicationSearch.listenForEnter($event)\" placeholder=\"{{'filter-list' | translate}}\"/>\n" +
    "            <button class=\"cui-input-button__button\" ng-click=\"applicationSearch.parseAppsByCategoryAndName()\">{{'filter' | translate}}</button>\n" +
    "        </div>\n" +
    "        <div class=\"cui-action__actions\">\n" +
    "            <svg ng-click=\"applicationSearch.requestPopover=!applicationSearch.requestPopover\" off-click=\"applicationSearch.requestPopover=false\" xmlns=\"http://www.w3.org/2000/svg\" id=\"cui-applications__requested-apps\" class=\"cui-icon--folder\" ng-class=\"{'cui-action__icon--active': applicationSearch.numberOfRequests != 0}\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 40 33\">\n" +
    "              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#folder\"></use>\n" +
    "            </svg>\n" +
    "            <sup class=\"cui-action__icon-counter\" ng-class=\"{'cui-action__icon-counter--active': applicationSearch.numberOfRequests != 0}\">{{applicationSearch.numberOfRequests}} </sup>\n" +
    "\n" +
    "            <div tether class=\"cui-action__popover\" target=\"#cui-applications__requested-apps\" attachment=\"top middle\" targetAttachment=\"bottom left\" offset=\"-20px 50px\" ng-class=\"{'hide--opacity': !applicationSearch.requestPopover}\">\n" +
    "              <span class=\"cui-action__popover-title\">{{'collected-items-for-request' | translate}}</span>\n" +
    "              <div class=\"cui-action__popover-section\">\n" +
    "                <span ng-if=\"applicationSearch.numberOfRequests === 0\">{{'no-selected-apps' | translate}}<br/></span>\n" +
    "                <ul ng-if=\"applicationSearch.numberOfRequests > 0\">\n" +
    "                    <li ng-repeat=\"(key,value) in applicationSearch.packageRequests\">{{value.name | cuiI18n}}</li>\n" +
    "                </ul>\n" +
    "              </div>\n" +
    "              <span ng-if=\"applicationSearch.numberOfRequests > 0\" class=\"cui-action__popover-button\" ui-sref=\"applications.reviewRequest\">{{'submit-request' | translate}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cui-applications__main-container\">\n" +
    "        <div class=\"cui-loading__container\" ng-if=\"!applicationSearch.doneLoading\">\n" +
    "            <div class=\"cui-loading--center\"><div class=\"cui-loading\"></div></div>\n" +
    "        </div>\n" +
    "        <cui-expandable class=\"cui-expandable\" ng-repeat=\"application in applicationSearch.list track by application.id\" ng-if=\"applicationSearch.doneLoading\" transition-speed=\"150\">\n" +
    "            <cui-expandable-title class=\"cui-expandable__title cui-expandable__title--flex\" >\n" +
    "                <!-- @Shane, right now the above ng-click triggers when you click the checkbox, move that ng-click wherever you see appropriate -->\n" +
    "                <!-- application image -->\n" +
    "                <div class=\"cui-applications__expandable-info\" ng-click=\"toggleExpand();!applicationSearch.detailsLoadingDone[application.id] && applicationSearch.getRelatedAndBundled($index,application);\">\n" +
    "                    <h3 class=\"cui-expandable__title-left\">{{application.name | cuiI18n}}</h3>\n" +
    "                    <span class=\"cui-expandable__title-middle\" ng-if=\"application.orgHasGrants\">{{'granted-to-my-org' | translate}}</span>\n" +
    "                    <div></div>\n" +
    "                </div>\n" +
    "                <!-- Not sure what the exclamation mark bubble means or what triggers it, but you can put it in here @Shane, I'll come back to this once we get an answer -->\n" +
    "                <!-- TODO Figure out above ^  (leave this so I can find it later)-->\n" +
    "                <div class=\"cui-expandable__title-end\">\n" +
    "                    <span class=\"cui-checkbox__container\">\n" +
    "                        <input class=\"cui-checkbox\" type=\"checkbox\" ng-model=\"applicationSearch.appCheckbox[application.id]\" />\n" +
    "                        <label class=\"cui-checkbox__label\" ng-click=\"applicationSearch.appCheckbox[application.id]=!applicationSearch.appCheckbox[application.id]; applicationSearch.toggleRequest(application)\"></label>\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "            </cui-expandable-title>\n" +
    "            <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "                <div class=\"cui-expandable__body-pane\">\n" +
    "                    <span class=\"cui-expandable__body-close\" ng-click=\"collapse()\">\n" +
    "                        <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-icon\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n" +
    "                          <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#close\"></use>\n" +
    "                        </svg>\n" +
    "                    </span>\n" +
    "                    <div class=\"cui-loading__container\" ng-if=\"!applicationSearch.detailsLoadingDone[application.id]\"> <!-- @Shane, this loading seems to be overlapping the expandable title -->\n" +
    "                        <div class=\"cui-loading--center\"><div class=\"cui-loading\"></div></div>\n" +
    "                    </div>\n" +
    "                    <div class=\"cui-expandable__pane-col\" ng-if=\"application.details.bundled.length!==0\">\n" +
    "                        <h4 class=\"cui-expandable__pane-title\">{{'bundled-applications' | translate}}</h4>\n" +
    "                        <div class=\"cui-expandable__pane-content\">\n" +
    "                            <span ng-repeat=\"bundledApp in application.details.bundled\" ng-if=\"application.details.bundled.length!==0\">\n" +
    "                                {{bundledApp.name | cuiI18n}}\n" +
    "                            </span>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"cui-expandable__pane-col\" ng-if=\"application.details.related.length!==0\">\n" +
    "                        <h4 class=\"cui-expandable__pane-title\">{{'related-applications' | translate}}</h4>\n" +
    "                        <div class=\"cui-expandable__pane-content\">\n" +
    "                            <span class=\"cui-expandable__pane-content-item\" ng-repeat=\"relatedApp in application.details.related\">\n" +
    "                                <span class=\"\">{{relatedApp.name | cuiI18n}} </span>\n" +
    "                                <span class=\"cui-checkbox__container\">\n" +
    "                                    <input class=\"cui-checkbox\" type=\"checkbox\" ng-model=\"applicationSearch.appCheckbox[relatedApp.id]\" />\n" +
    "                                    <label class=\"cui-checkbox__label\" ng-click=\"applicationSearch.appCheckbox[relatedApp.id]=!applicationSearch.appCheckbox[relatedApp.id]; applicationSearch.toggleRequest(relatedApp)\"></label>\n" +
    "                                </span>\n" +
    "                            </span>\n" +
    "\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </cui-expandable-body>\n" +
    "        </cui-expandable>\n" +
    "        <div class=\"cui-applications__search-button\">\n" +
    "            <button class=\"cui-button\" ng-class=\"{'cui-button--error' : applicationSearch.numberOfRequests===0}\" ng-click=\"applicationSearch.numberOfRequests != 0 && applicationSearch.saveRequestsAndCheckout()\">{{'review-request' | translate}}</button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('assets/app/base/base.html',
    ""
  );


  $templateCache.put('assets/app/common-templates/messages.html',
    "<div class=cui-error__message ng-message=required>{{'cui-this-field-is-required' | translate}}</div>\n" +
    "<div class=cui-error__message ng-message=minlength>{{'cui-this-field-needs-to-be-longer' | translate}}</div>\n" +
    "<div class=cui-error__message ng-message=tosRequired>{{'cui-you-need-to-agree-to-toc' | translate}}</div>\n" +
    "<div class=cui-error__message ng-message=email>{{'cui-this-is-not-valid-email' | translate}}</div>\n" +
    "<div class=cui-error__message ng-message=securityAnswerRepeated>{{'security-question-repeated' | translate}}</div>"
  );


  $templateCache.put('assets/app/empty/empty.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/misc/invitations/invite/users.invite.html',
    "<h2 ng-click=base.goBack()>Go Back</h2>\n" +
    "<div class=cui-tile>\n" +
    "  <div class=cui-tile__title>Invite User</div>\n" +
    "    <div class=cui-tile__body>\n" +
    "      <cui-wizard class=cui-wizard step=1 clickable-indicators minimum-padding=30>\n" +
    "        <indicator-container class=indicator-container></indicator-container>\n" +
    "        <step title=\"User details\">\n" +
    "          <form name=invite novalidate>\n" +
    "\n" +
    "            \n" +
    "            <label for=user-email>{{'cui-email' | translate}}</label>\n" +
    "            <div class=cui-error ng-messages=invite.email.$error ng-if=invite.email.$touched>\n" +
    "              <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "            </div>\n" +
    "            <input type=text name=email class=cui-input ng-required=true ng-model=\"usersInvite.userToInvite.email\">\n" +
    "\n" +
    "            <div class=cui-wizard__field-row>\n" +
    "              \n" +
    "              <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "                <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n" +
    "                <div class=cui-error ng-messages=invite.firstName.$error ng-if=invite.firstName.$touched>\n" +
    "                  <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "                </div>\n" +
    "                <input type=text name=firstName class=cui-input ng-required=true ng-model=\"usersInvite.userToInvite.name.given\">\n" +
    "              </div>\n" +
    "\n" +
    "              \n" +
    "              <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "                <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n" +
    "                <div class=cui-error ng-messages=invite.lastName.$error ng-if=invite.lastName.$touched>\n" +
    "                  <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "                </div>\n" +
    "                <input type=text ng-model=usersInvite.userToInvite.name.surname name=lastName class=cui-input ng-required=\"true\">\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            \n" +
    "            <label for=custom-message>Custom message</label>\n" +
    "            <textarea ng-model=usersInvite.message class=cui-input style=resize:vertical;height:100px></textarea>\n" +
    "\n" +
    "        </form>\n" +
    "\n" +
    "        <div class=cui-wizard__controls>\n" +
    "          <button class=cui-wizard__next ng-click=usersInvite.saveUser(invite) ng-class=\"invite.$invalid? 'cui-wizard__next--error' : usersInvite.sent? 'success' : usersInvite.fail? 'fail' : ''\" style=position:relative>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=\"usersInvite.sending && !usersInvite.sent\"></div>\n" +
    "            <span ng-if=\"(!usersInvite.sending && !usersInvite.sent && !usersInvite.fail)\">Send invite</span>\n" +
    "            <span ng-if=usersInvite.sent>Invite sent!</span>\n" +
    "            <span ng-if=usersInvite.fail>Error! Try again?</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </step>\n" +
    "    </cui-wizard>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/invitations/search/users.invitations.search.html',
    "<div class=cui-tile>\n" +
    "  <div class=cui-tile__title>User Invitations</div>\n" +
    "    <div class=cui-tile__body>\n" +
    "        <div class=cui-loading__container ng-if=usersInvitations.listLoading>\n" +
    "            <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "        </div>\n" +
    "        <a ui-sref=users.invite class=cui-link>Invite new user</a><br><br>\n" +
    "\n" +
    "        <div class=cui-expandable__container>\n" +
    "            <div class=cui-expandable__tr>\n" +
    "              <span class=cui-expandable__td>Invitation ID</span>\n" +
    "              <span class=cui-expandable__td>Email</span>\n" +
    "              <span class=cui-expandable__td></span>\n" +
    "            </div>\n" +
    "            <cui-expandable class=cui-expandable ng-repeat=\"invitation in usersInvitations.list\">\n" +
    "                <cui-expandable-title class=cui-expandable__title ng-click=usersInvitations.getInfo(invitation.invitor.id,invitation.invitee.id,$index);toggleExpand()>\n" +
    "                    <div class=cui-expandable__tr>\n" +
    "                        <span class=cui-expandable__td>{{invitation.id}}</span>\n" +
    "                        <span class=cui-expandable__td>{{invitation.email}}</span>\n" +
    "                        <span class=cui-expandable__td><a class=cui-link>View</a></span>\n" +
    "                    </div>\n" +
    "                </cui-expandable-title>\n" +
    "                <cui-expandable-body class=cui-expandable__body style=position:relative>\n" +
    "                    <div class=cui-loading ng-if=\"usersInvitations.invitorLoading[$index] || usersInvitations.inviteeLoading[$index]\"></div>\n" +
    "                    \n" +
    "                    <div ng-if=\"!usersInvitations.invitorLoading[$index] && !usersInvitations.inviteeLoading[$index]\">\n" +
    "                        <ul>\n" +
    "                            <li class=cui-expandable__review-item>\n" +
    "                                Invitor: {{usersInvitations.invitor[$index].name.given}} {{usersInvitations.invitor[$index].name.surname}}\n" +
    "                            </li>\n" +
    "                            <li class=cui-expandable__review-item>\n" +
    "                                Invitee: {{usersInvitations.invitee[$index].name.given}} {{usersInvitations.invitee[$index].name.surname}} ({{invitation.email}})\n" +
    "                            </li>\n" +
    "                        </ul>\n" +
    "                    </div>\n" +
    "                    \n" +
    "                </cui-expandable-body>\n" +
    "            </cui-expandable>\n" +
    "\n" +
    "    </div>\n" +
    "</div></div>"
  );


  $templateCache.put('assets/app/misc/invitations/users.invitations.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/misc/misc.404.html',
    "<div class=cui-tile>\n" +
    "	<div class=cui-tile__title>{{'cui-page-not-found' | translate}}</div>\n" +
    "	<div class=cui-tile__body>\n" +
    "		<div class=misc-body>\n" +
    "			<h1>{{'cui-page-not-found' | translate}}.</h1>\n" +
    "			<div class=cui-card__image-container>\n" +
    "      	<svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#ask-file></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "			<p>{{'cui-page-not-found-content' | translate}}</p>\n" +
    "		</div>\n" +
    "		<button class=cui-card__button ui-sref=welcome.screen>{{ 'cui-home' | translate }}</button>\n" +
    "	</div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/misc.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/misc/misc.notAuth.html',
    "<div class=cui-tile>\n" +
    "	<div class=cui-tile__title>{{'cui-access-denied' | translate}}</div>\n" +
    "	<div class=cui-tile__body>\n" +
    "		<div class=misc-body>\n" +
    "			<h1>{{'cui-access-denied' | translate}}.</h1>\n" +
    "			<div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#not-authorized></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "			<p>{{'cui-access-denied-content' | translate}}</p>\n" +
    "		</div>\n" +
    "		<button class=cui-card__button ui-sref=welcome.screen>{{ 'cui-home' | translate }}</button>\n" +
    "	</div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/misc.pendingStatus.html',
    "<div class=cui-tile>\n" +
    "	<div class=cui-tile__title>{{'cui-registration-status' | translate}}</div>\n" +
    "	<div class=cui-tile__body>\n" +
    "		<div class=misc-body>\n" +
    "			<h1>{{'cui-pending-status' | translate}}...</h1>\n" +
    "			<div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#status-pending></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "			<p>{{'cui-pending-status-content' | translate}}</p>\n" +
    "			<p>{{'cui-thank-you' | translate}}!</p>\n" +
    "		</div>\n" +
    "		<button class=cui-card__button ui-sref=welcome.screen>{{ 'cui-home' | translate }}</button>\n" +
    "	</div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/misc.success.html',
    "<div class=cui-tile>\n" +
    "	<div class=cui-tile__title>{{'cui-request-submitted' | translate}}</div>\n" +
    "	<div class=cui-tile__body>\n" +
    "		<div class=misc-body>\n" +
    "			<h1>{{'cui-success' | translate}}!</h1>\n" +
    "			<div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#success></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "			<p>{{'cui-success-content' | translate}}</p>\n" +
    "			<p>{{'cui-check-your' | translate}} <a href=\"\">{{'cui-registration-status-lower' | translate}}</a>.</p>\n" +
    "		</div>\n" +
    "		<button class=cui-card__button ui-sref=welcome.screen>{{ 'cui-home' | translate }}</button>\n" +
    "	</div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/users/activate/users.activate.html',
    ""
  );


  $templateCache.put('assets/app/misc/users/search/users.search.html',
    "<div class=cui-tile>\n" +
    "  <div class=cui-tile__title>Organization Users</div>\n" +
    "    <div class=cui-tile__body>\n" +
    "        <div class=cui-loading__container ng-if=usersSearch.listLoading>\n" +
    "            <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "        </div>\n" +
    "        <input class=cui-input placeholder=\"{{'cui-search-user-name' | translate}}\" ng-model=\"usersSearch.search['name.given']\">\n" +
    "        <input class=cui-input placeholder=\"{{'cui-num-results-page' | translate}}\" ng-model=usersSearch.search.pageSize>\n" +
    "        <input class=cui-input placeholder=\"{{'page' | translate}}\" ng-model=usersSearch.search.page>\n" +
    "        <table class=\"cui-table cui-table--borderless\">\n" +
    "            <thead>\n" +
    "                <tr>\n" +
    "                    <th>User ID</th>\n" +
    "                    <th>Name</th>\n" +
    "                    <th>Title</th>\n" +
    "                    <th></th>\n" +
    "                </tr>\n" +
    "            </thead>\n" +
    "            <tbody>\n" +
    "                <tr ng-repeat=\"user in usersSearch.list\">\n" +
    "                    <td>{{user.id}}</td>\n" +
    "                    <td>{{user.name.given}} {{user.name.surname}}</td>\n" +
    "                    <td>{{user.title}}</td>\n" +
    "                    <td>{{user.status}}\n" +
    "                        <div ng-if=\"user.status==='pending'\"><a class=cui-link ui-sref=\"users.activate({id: user.id})\">Activate!</a></div>\n" +
    "                    </td>\n" +
    "                    <td><a class=cui-link ui-sref=\"profile.user({id: user.id})\">Edit</a></td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "    </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/misc/users/users.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/misc/welcome/welcome.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/misc/welcome/welcome.screen.html',
    "<div class=welcome-wrapper>\n" +
    "\n" +
    "  \n" +
    "  <div class=welcome-title>\n" +
    "    <h1>{{ 'welcome-title' | translate }}:</h1>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=cui-card__container>\n" +
    "    \n" +
    "    <div class=cui-card>\n" +
    "      <div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#skyscraper></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "      <div class=cui-card__content>\n" +
    "        <p class=cui-card__content-header>{{ 'cui-new-TLO' | translate }}</p>\n" +
    "        <p>{{ 'cui-new-TLO-description' | translate }}</p>\n" +
    "      </div>\n" +
    "      <button class=cui-card__button ui-sref=registration.tlo>{{ 'cui-sign-up' | translate }}</button>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=cui-card>\n" +
    "      <div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#division></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "      <div class=cui-card__content>\n" +
    "        <p class=cui-card__content-header>{{ 'cui-new-division' | translate }}</p>\n" +
    "        <p>{{ 'cui-new-division-description-start' | translate }} <a href=\"\" class=cui-link--medium-light ng-click=\"welcome.divisionPopover=true\">{{ 'cui-security-administrator' | translate }}</a>* {{ 'cui-new-division-description-end' | translate }}</p>\n" +
    "      </div>\n" +
    "      <button class=cui-card__button ui-sref=registration.division>{{ 'cui-sign-up' | translate }}</button>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=cui-styeguide__popover-container ng-show=welcome.divisionPopover off-click=\"welcome.divisionPopover = false\" off-click-if=welcome.divisionPopover>\n" +
    "      <div class=\"cui-popover cui-popover--dark cui-popover--top cui-popover__new-division\">\n" +
    "        <p>{{ 'cui-welcome-popover' | translate }}</p>\n" +
    "        <p class=cui-popover_link><a href=\"\" ng-click=\"welcome.divisionPopover=false\">Cool, got it!</a></p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=cui-card>\n" +
    "      <div class=cui-card__image-container>\n" +
    "        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n" +
    "          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#user></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "      <div class=cui-card__content>\n" +
    "        <p class=cui-card__content-header>{{ 'cui-new-user' | translate }}</p>\n" +
    "        <p>{{ 'cui-new-user-description' | translate }}</p>\n" +
    "      </div>\n" +
    "      <button class=cui-card__button ui-sref=registration.walkup>{{ 'cui-sign-up' | translate }}</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/profile/organization/organization.profile.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/profile/organization target=blank>here</a> and the layout styles <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/organization.scss class=cui-link target=blank>here</a></div>\n" +
    "<div class=cui-organization>\n" +
    "  <div class=cui-action>\n" +
    "    <div class=cui-action__title>\n" +
    "      {{'cui-org-profile' | translate}}\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=cui-organization__main-container>\n" +
    "\n" +
    "    \n" +
    "    <div class=cui-loading__container ng-if=!orgProfile.loadingDone> \n" +
    "        <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div ng-if=orgProfile.loadingDone>\n" +
    "      <h3 class=cui-organization__page-title>{{orgProfile.organization.name}}</h3>\n" +
    "\n" +
    "      \n" +
    "      <div class=\"cui-field-val cui-field-val--stack cui-organization__info-block\">\n" +
    "      <h4 class=cui-field-val__field>{{'cui-address' | translate}}: </h4>\n" +
    "        <span class=cui-field-val__val>{{orgProfile.organization.addresses[0].streets[0]}}</span>\n" +
    "        <span class=cui-field-val__val>{{orgProfile.organization.addresses[0].city}}</span>\n" +
    "        <span class=cui-field-val__val>{{orgProfile.organization.addresses[0].state}}, {{orgProfile.organization.addresses[0].postal}}</span>\n" +
    "        <span class=cui-field-val__val>{{orgProfile.organization.phones[0].number}}</span>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div class=cui-organization__info-block>\n" +
    "        <h4 class=cui-field-val__field>{{'cui-info' | translate}}: </h4>\n" +
    "        <div>\n" +
    "          <span>Url: </span>\n" +
    "          <span class=cui-field-val__val><a ng-href={{orgProfile.organization.url}}>{{orgProfile.organization.url}}</a></span>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/profile/profile.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/profile/user/password-validation.html',
    "<p>{{'passwords-must' | translate}}</p>\n" +
    "\n" +
    "<div class=cui-error__message ng-message=disallowedWords>\n" +
    "  <div class=cui-error__status ng-class=\"password.newPassword.$error.disallowedWords ? '': 'cui-error__status--pass'\"></div>\n" +
    "  not contain any of the disallowed words\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=lowercaseNotAllowed>\n" +
    "  <div class=cui-error__status ng-class=\"password.newPassword.$error.lowercaseNotAllowed ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'lowercase-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=uppercaseNotAllowed>\n" +
    "  <div class=cui-error__status ng-class=\"password.newPassword.$error.uppercaseNotAllowed ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'uppercase-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=numberNotAllowed>\n" +
    "  <div class=cui-error__status ng-class=\"password.newPassword.$error.numberNotAllowed ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'numbers-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=specialNotAllowed>\n" +
    "  <div class=cui-error__status ng-class=\"password.newPassword.$error.specialNotAllowed ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'special-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=disallowedChars>\n" +
    "  <div class=cui-error__status ng-class=\"password.newPassword.$error.disallowedChars ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'char-not-allowed' | translate}}\n" +
    "</div>\n" +
    "\n" +
    "<div class=cui-error__message>\n" +
    "  <div class=cui-error__status ng-class=\"password.newPassword.$error.length ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'password-length' | translate}}<br><br>\n" +
    "</div>\n" +
    "<div class=cui-error__message>{{'password-rules' | translate}}<br>\n" +
    "  <div class=cui-error__message>\n" +
    "    <div class=cui-error__status ng-class=\"password.newPassword.$error.lowercase ? '': 'cui-error__status--pass'\"></div>\n" +
    "    {{'password-lowercase' | translate}}\n" +
    "  </div>\n" +
    "  <div class=cui-error__message>\n" +
    "    <div class=cui-error__status ng-class=\"password.newPassword.$error.uppercase ? '': 'cui-error__status--pass'\"></div>\n" +
    "    {{'password-uppercase' | translate}}\n" +
    "  </div>\n" +
    "  <div class=cui-error__message>\n" +
    "    <div class=cui-error__status ng-class=\"password.newPassword.$error.number ? '': 'cui-error__status--pass'\"></div>\n" +
    "    {{'password-number' | translate}}\n" +
    "  </div>\n" +
    "  <div class=cui-error__message>\n" +
    "    <div class=cui-error__status ng-class=\"password.newPassword.$error.special ? '': 'cui-error__status--pass'\"></div>\n" +
    "    {{'password-special' | translate}}\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/profile/user/sections/address.html',
    "<div class=cui-users__field>\n" +
    "  <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "    <div class=cui-users__field>\n" +
    "      <span class=cui-field-val__field>{{'cui-address' | translate}}</span>\n" +
    "      <span class=cui-link href=\"\" ng-if=!toggled ng-click=usersEdit.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "        <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close></use>\n" +
    "      </svg>\n" +
    "    </div>\n" +
    "    \n" +
    "    <div ng-if=!toggled>\n" +
    "      <div class=cui-field-val__val>{{usersEdit.tempUser.addresses[0].streets[0]}} </div>\n" +
    "      <div class=cui-field-val__val ng-if=usersEdit.tempUser.addresses[0].streets[1]>{{usersEdit.tempUser.addresses[0].streets[1]}}</div>\n" +
    "      <div class=cui-field-val__val>{{usersEdit.tempUser.addresses[0].city}}</div>\n" +
    "      <div class=cui-field-val__val>{{usersEdit.tempUser.addresses[0].state}} {{usersEdit.tempUser.addresses[0].postal}}</div>\n" +
    "      <div class=cui-field-val__val>{{usersEdit.tempUser.addresses[0].country}}</div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div ng-if=toggled ng-init=\"usersEdit.pushToggleOff({'name':'address','function':toggleOff})\">\n" +
    "      \n" +
    "      <label for=\"{{'cui-street-address' | translate}}\">{{'cui-street-address' | translate}}</label>\n" +
    "      <input type=text name=\"{{'cui-street-address' | translate}}\" class=cui-input ng-model=usersEdit.tempUser.addresses[0].streets[0]>\n" +
    "      \n" +
    "      <label for=\"{{'cui-address-2' | translate}}\">{{'cui-address-2' | translate}}</label>\n" +
    "      <input type=text name=\"{{'cui-address-2' | translate}}\" ng-model=usersEdit.tempUser.addresses[0].streets[1] class=cui-input>\n" +
    "      <div class=cui-form__field-row>\n" +
    "        \n" +
    "        <div class=\"cui-form__field-container cui-form__field-container--half\">\n" +
    "          <label for=\"{{'cui-city' | translate}}\">{{'cui-city' | translate}}</label>\n" +
    "          <input type=text name=\"{{'cui-city' | translate}}\" class=cui-input ng-model=usersEdit.tempUser.addresses[0].city>\n" +
    "        </div>\n" +
    "        \n" +
    "        <div class=\"cui-form__field-container cui-form__field-container--half\">\n" +
    "          <label for=\"{{'cui-zip' | translate}}\">{{'cui-zip' | translate}}</label>\n" +
    "          <input type=text name=\"{{'cui-zip' | translate}}\" class=cui-input ng-model=usersEdit.tempUser.addresses[0].postal>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div class=cui-wizard__field-container>\n" +
    "        <label for=country>{{\"cui-country\" | translate}}</label>\n" +
    "        <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n" +
    "          <div ng-messages-include=assets/angular-templates/messages.html></div>\n" +
    "        </div>\n" +
    "        <div auto-complete input-name=country pause=100 selected-object=usersEdit.userCountry initial-value=usersEdit.tempUser.addresses[0].country local-data=base.countries search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true></div>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div class=cui-users__address-submit>\n" +
    "        <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=\"usersEdit.resetTempObject(usersEdit.user, usersEdit.tempUser); toggleOff()\">cancel</a>\n" +
    "        <button class=cui-button ng-click=\"usersEdit.updatePerson(); toggleOff()\">{{'cui-update' | translate}}</button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/profile/user/sections/basic-info.html',
    "<ng-form name=basicInfo>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>{{'basic-info' | translate}}</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=usersEdit.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-if=!toggled>\n" +
    "        <span class=cui-field-val__field>{{'cui-name' | translate}}:</span>\n" +
    "        <span class=cui-field-val__val>{{usersEdit.user.name.given}} {{usersEdit.user.name.surname}}</span><br>\n" +
    "        <span class=cui-field-val__field>{{'cui-email' | translate}}:</span>\n" +
    "        <span class=cui-field-val__val>{{usersEdit.user.email}} </span>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div ng-if=toggled ng-init=\"usersEdit.pushToggleOff({'name':'basicInfo','function':toggleOff})\">\n" +
    "        \n" +
    "        <label for=firstName>{{'cui-first-name' | translate}}</label>\n" +
    "        <div class=cui-error ng-messages=basicInfo.firstName.$error>\n" +
    "          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "        </div>\n" +
    "        <input type=text name=firstName class=cui-input ng-model=usersEdit.tempUser.name.given ng-required=true focus-if=toggled>\n" +
    "        \n" +
    "        <label for=lastName>{{'cui-last-name' | translate}}</label>\n" +
    "        <div class=cui-error ng-messages=basicInfo.lastName.$error>\n" +
    "          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "        </div>\n" +
    "        <input type=text name=lastName class=cui-input ng-model=usersEdit.tempUser.name.surname ng-required=true>\n" +
    "        \n" +
    "        <label for=email>{{'cui-email' | translate}}</label>\n" +
    "        <div class=cui-error ng-messages=basicInfo.email.$error>\n" +
    "          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "        </div>\n" +
    "        <input type=email name=email class=cui-input ng-model=usersEdit.tempUser.email ng-required=true>\n" +
    "        \n" +
    "        <div class=cui-users__address-submit>\n" +
    "          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n" +
    "          <button class=cui-button ng-click=\"basicInfo.$valid && usersEdit.updatePerson('basicInfo',toggleOff);\" ng-class=\"{'cui-button--error':!basicInfo.$valid}\">\n" +
    "            <span ng-if=\"!usersEdit.basicInfo || !usersEdit.basicInfo.submitting\">{{'cui-update' | translate}}</span>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=usersEdit.basicInfo.submitting></div>\n" +
    "            <span ng-if=usersEdit.basicInfo.error>{{'cui-error-try-again'| translate}}</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/profile/user/sections/challenge-questions.html',
    "<ng-form name=challengeQuestions>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>{{'challenge-questions' | translate}}</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=usersEdit.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "      <div ng-if=!toggled>\n" +
    "        <div ng-repeat=\"question in usersEdit.challengeQuestionsTexts\">\n" +
    "          <span class=cui-field-val__field>{{$index+1}}:</span>\n" +
    "          <span class=cui-field-val__val>{{question}}</span>\n" +
    "          \n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div ng-if=toggled ng-init=\"usersEdit.pushToggleOff({'name':'challengeQuestions','function':toggleOff})\">\n" +
    "        <div ng-repeat=\"question in usersEdit.tempUserSecurityQuestions\">\n" +
    "          <b>{{'cui-challenge-question' | translate}} {{$index+1}}</b>\n" +
    "          <select class=\"cui-input cui-input--full cui-select\" ng-model=question.question.id ng-options=\"question.id as (question.question | cuiI18n) for question in usersEdit['allChallengeQuestions' + $index]\"></select>\n" +
    "          {{'cui-answer' | translate}}\n" +
    "          <div class=cui-error ng-messages=\"challengeQuestions['answer' + $index].$error\">\n" +
    "            <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "          </div>\n" +
    "          <input type=text ng-model=question.answer class=cui-input ng-class=\"{'cui-input--error':!challengeQuestions['answer'+$index].$valid}\" name=answer{{$index}} ng-change=usersEdit.checkIfRepeatedSecurityAnswer(usersEdit.tempUserSecurityQuestions,challengeQuestions) ng-required=\"true\">\n" +
    "          <br><br>\n" +
    "        </div>\n" +
    "        \n" +
    "        <div class=cui-users__address-submit>\n" +
    "          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n" +
    "          <button class=cui-button ng-click=\"usersEdit.saveChallengeQuestions('challengeQuestions',toggleOff);\" ng-class=\"{'cui-button--error':!challengeQuestions.$valid}\">\n" +
    "            <span ng-if=\"( !usersEdit.challengeQuestions || !usersEdit.challengeQuestions.submitting ) && !usersEdit.challengeQuestions.error\">{{'cui-update' | translate}}</span>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=usersEdit.challengeQuestions.submitting></div>\n" +
    "            <span ng-if=usersEdit.challengeQuestions.error>{{'cui-error-try-again'| translate}}</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/profile/user/sections/header.html',
    "<div class=cui-users__profile-media ng-if=!usersEdit.loading>\n" +
    "  <div class=cui-media>\n" +
    "    <div class=cui-media__image-container>\n" +
    "      <svg xmlns=http://www.w3.org/2000/svg class=cui-media__image>\n" +
    "        \n" +
    "        <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#user></use>\n" +
    "      </svg>\n" +
    "    </div>\n" +
    "    <div class=cui-media__body>\n" +
    "      \n" +
    "      <h3 class=cui-media__title>{{usersEdit.user.name.given}} {{usersEdit.user.name.surname}}</h3>\n" +
    "      \n" +
    "      <p class=cui-media__content--small>{{'cui-registered' | translate}}:</p>\n" +
    "      <p class=cui-media__content--small>{{'cui-user-id' | translate}}: {{usersEdit.user.id}}</p>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/profile/user/sections/password.html',
    "<ng-form name=password>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>{{'password-reset' | translate}}</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=usersEdit.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=usersEdit.resetPasswordFields();toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div ng-if=toggled ng-init=\"usersEdit.pushToggleOff({'name':'password','function':toggleOff})\">\n" +
    "        \n" +
    "        <label for=currentPassword>{{'current-password' | translate}}</label>\n" +
    "        <div class=cui-error ng-messages=password.currentPassword.$error ng-if=password.currentPassword.$touched>\n" +
    "          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "        </div>\n" +
    "        <input type=password name=currentPassword class=cui-input ng-model=usersEdit.userPasswordAccount.currentPassword ng-required=true focus-if=\"toggled\">\n" +
    "        \n" +
    "        <div class=cui-input__password-holder>\n" +
    "          <label for=newPassword>{{'cui-enter-new-password' | translate}}: </label>\n" +
    "          <input class=cui-input type=password ng-model=usersEdit.userPasswordAccount.password name=newPassword ng-required=true ng-class=\"{'cui-input--error': password.newPassword.$touched && password.newPassword.$invalid}\" password-validation=\"base.passwordPolicies\">\n" +
    "          <div ng-messages=password.newPassword.$error ng-messages-multiple ng-if=password.newPassword.$invalid class=cui-error__password>\n" +
    "            <div ng-messages-include=assets/app/profile/user/password-validation.html></div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        \n" +
    "        <label for=newPasswordRe>{{'cui-re-enter-new-password' | translate}}: </label>\n" +
    "        <div class=cui-error ng-if=\"password.newPasswordRe.$touched && password.newPasswordRe.$error.match\">\n" +
    "          <div class=cui-error__message>{{'password-mismatch' | translate}}</div>\n" +
    "        </div>\n" +
    "        <input class=\"cui-input cui-field-val__val\" type=password ng-model=usersEdit.passwordRe name=newPasswordRe match=\"usersEdit.userPasswordAccount.password\">\n" +
    "        \n" +
    "        <div class=cui-users__address-submit>\n" +
    "          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=usersEdit.resetPasswordFields();toggleOff()>{{'cui-cancel' | translate}}</a>\n" +
    "          <button class=cui-button ng-click=\"password.$valid && usersEdit.updatePassword('password',toggleOff);\" ng-class=\"{'cui-button--error':!password.$valid}\">\n" +
    "            <span ng-if=\"(!usersEdit.password || !usersEdit.password.submitting) && !usersEdit.password.error\">{{'cui-update' | translate}}</span>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=usersEdit.password.submitting></div>\n" +
    "            <span ng-if=usersEdit.password.error>{{'cui-error-try-again'| translate}}</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/profile/user/sections/phone-fax.html',
    "<ng-form name=phoneFax>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>{{'cui-phone-fax' | translate}}</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=usersEdit.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-if=!toggled ng-repeat=\"phone in usersEdit.user.phones\">\n" +
    "        <span class=cui-field-val__field>{{phone.type}}:</span>\n" +
    "        <span class=cui-field-val__val>{{phone.number}}</span>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div ng-if=toggled>\n" +
    "        \n" +
    "        <div ng-repeat=\"phone in usersEdit.tempUser.phones\">\n" +
    "          <label>{{phone.type}}</label>\n" +
    "          <div ng-messages=\"phoneFax['phone'+$index].$error\" class=cui-error>\n" +
    "            <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "          </div>\n" +
    "          <input class=cui-input type=text ng-model=phone.number name=phone{{$index}} ng-required=\"true\">\n" +
    "        </div>\n" +
    "        \n" +
    "        <div class=cui-users__address-submit>\n" +
    "          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n" +
    "          <button class=cui-button ng-click=\"phoneFax.$valid && usersEdit.updatePerson('phoneFax',toggleOff);\" ng-class=\"{'cui-button--error':!phoneFax.$valid}\">\n" +
    "            <span ng-if=\"!usersEdit.phoneFax || !usersEdit.phoneFax.submitting\">{{'cui-update' | translate}}</span>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=usersEdit.phoneFax.submitting></div>\n" +
    "            <span ng-if=usersEdit.phoneFax.error>{{'cui-error-try-again'| translate}}</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/profile/user/sections/timezone-language.html',
    "<ng-form name=timezoneLanguage>\n" +
    "  <div class=cui-users__field>\n" +
    "    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n" +
    "      <div class=cui-users__field>\n" +
    "        <span class=cui-field-val__field>{{'timezone-and-language' | translate}}</span>\n" +
    "        <span class=cui-link href=\"\" ng-if=!toggled ng-click=usersEdit.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n" +
    "        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n" +
    "          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close></use>\n" +
    "        </svg>\n" +
    "      </div>\n" +
    "      <div ng-if=!toggled>\n" +
    "        <span class=cui-field-val__field>{{'cui-timezone' | translate}}:</span>\n" +
    "        <span class=cui-field-val__val>{{usersEdit.timezoneById(usersEdit.user.timezone)}}</span>\n" +
    "        <span class=cui-field-val__field>{{'cui-language' | translate}}:</span>\n" +
    "        <span class=cui-field-val__val>{{base.languages[usersEdit.user.language]}}</span>\n" +
    "      </div>\n" +
    "\n" +
    "      \n" +
    "      <div ng-if=toggled ng-init=\"usersEdit.pushToggleOff({'name':'timezoneLangauge','function':toggleOff})\">\n" +
    "        \n" +
    "        <label for=timezone>{{'cui-timezone' | translate}}</label>\n" +
    "        <select class=\"cui-input cui-select\" ng-model=usersEdit.tempUser.timezone ng-options=\"timezone.id as timezone.name for timezone in base.timezones\"></select>\n" +
    "        \n" +
    "        <label for=language>{{'cui-language' | translate}}</label>\n" +
    "        <select class=\"cui-input cui-select\" ng-model=usersEdit.tempUser.language ng-options=\"languageCode as languageName for (languageCode,languageName) in base.languages\"></select>\n" +
    "        \n" +
    "        <div class=cui-users__address-submit>\n" +
    "          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n" +
    "          <button class=cui-button ng-click=\"usersEdit.updatePerson('timezoneLanguage',toggleOff);\">\n" +
    "            <span ng-if=\"!usersEdit.timezoneLanguage || !usersEdit.timezoneLanguage.submitting\">{{'cui-update' | translate}}</span>\n" +
    "            <div class=cui-loading--medium-ctr ng-if=usersEdit.timezoneLanguage.submitting></div>\n" +
    "            <span ng-if=usersEdit.timezoneLanguage.error>{{'cui-error-try-again'| translate}}</span>\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/profile/user/users.edit.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/profile/user target=blank>here</a> and the layout styles <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/users.scss class=cui-link target=blank>here</a></div>\n" +
    "\n" +
    "<ng-form name=edit novalidate>\n" +
    "  <div class=cui-users__edit>\n" +
    "\n" +
    "    \n" +
    "    <div class=cui-action>\n" +
    "      <div class=cui-action__title>\n" +
    "        {{'cui-my-profile' | translate}}\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=cui-users__main-container>\n" +
    "\n" +
    "      \n" +
    "      <div class=cui-loading__container ng-if=usersEdit.loading>\n" +
    "        <div class=cui-loading--center><div class=cui-loading></div></div>\n" +
    "      </div>\n" +
    "\n" +
    "      <div ng-include=\"'assets/app/profile/user/sections/header.html'\"></div>\n" +
    "\n" +
    "      <div class=cui-users__profile>\n" +
    "        <div class=cui-users__profile-info>\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/profile/user/sections/basic-info.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/profile/user/sections/password.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/profile/user/sections/challenge-questions.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/profile/user/sections/timezone-language.html'\"></div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=cui-users__profile-info>\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/profile/user/sections/address.html'\"></div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=cui-users__info-block>\n" +
    "            \n" +
    "            <div ng-include=\"'assets/app/profile/user/sections/phone-fax.html'\"></div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/registration/newDivision/division.registration-steps/division.login.html',
    "<form name=\"userLogin\" novalidate>\n" +
    "\n" +
    "	<!-- First Row -->\n" +
    "	<!-- User ID -->\n" +
    "	<label for=\"userID\">{{'cui-user-id' | translate}}</label>\n" +
    "	<div class=\"cui-error\" ng-messages=\"userLogin.name.$error\" ng-if=\"userLogin.name.$touched\">\n" +
    "		<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "	</div>\n" +
    "	<input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.username\">\n" +
    "\n" +
    "	<!-- Second row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<div class=\"cui-input__password-holder\">\n" +
    "				<label>{{'cui-password' | translate}}</label>\n" +
    "				<div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n" +
    "					<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "				</div>\n" +
    "				<input type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.password\" ng-class=\"{'cui-input--error': userLogin.password.$touched && userLogin.password.$invalid}\" password-validation=\"newDivision.passwordPolicies\">\n" +
    "				<div ng-messages=\"userLogin.password.$error\" ng-messages-multiple ng-if=\"userLogin.password.$invalid\" class=\"cui-error__password\">\n" +
    "					<div ng-messages-include=\"assets/app/registration/password-validation.html\"></div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Re-enter Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-password-re' | translate}}</label>\n" +
    "			<div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n" +
    "				<div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n" +
    "			</div>\n" +
    "			<input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.passwordRe\" match=\"newDivision.userLogin.password\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Third row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 1</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.challenge1.$error\" ng-if=\"userLogin.challenge1.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<select ng-model=\"newDivision.userLogin.question1\" name=\"challenge1\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge1.$touched && userLogin.challenge1.$invalid }\" ng-options=\"question as question.question[0].text for question in newDivision.userLogin.challengeQuestions1\">\n" +
    "			</select>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 1</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.challengeAnswer1\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Fourth row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<select ng-model=\"newDivision.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as question.question[0].text for question in newDivision.userLogin.challengeQuestions2\">\n" +
    "			</select>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.challengeAnswer2\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "	<button class=\"cui-wizard__next\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newDivision/division.registration-steps/division.organization.html',
    "<form name=\"organizationSelect\" novalidate>\n" +
    "  <p>{{'cui-all-organizations' | translate}}</p>\n" +
    "  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-org-name' | translate}}\" ng-model=\"newDivision.orgSearch.name\">\n" +
    "\n" +
    "  <cui-expandable class=\"cui-expandable\" ng-repeat=\"organization in newDivision.organizationList\">\n" +
    "    <cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "      {{organization.name}}\n" +
    "      <span class=\"chevron\">></span>\n" +
    "    </cui-expandable-title>\n" +
    "    \n" +
    "    <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "      <p>{{organization.id}}</p>\n" +
    "      <p>{{organization.url}}</p>\n" +
    "      <p>{{organization.phones[0].number}}</p>\n" +
    "\n" +
    "      <div class=\"cui-wizard__controls\">\n" +
    "        <button class=\"cui-wizard__next\"  ng-click=\"next(); $parent.newDivision.organizationSelect.organization = organization\">{{'cui-select-org' | translate}}</button>\n" +
    "      </div>\n" +
    "    </cui-expandable-body>\n" +
    "  </cui-expandable>\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "  <button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newDivision/division.registration-steps/division.review.html',
    "<!-- User Information -->\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "  	{{'cui-user-information' | translate}}\n" +
    "    <span class=\"chevron\">></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "  	<!-- First Name -->\n" +
    "  	<inline-edit label=\"cui-first-name\" model=\"newDivision.user.name.given\"></inline-edit>\n" +
    "		<!-- Last Name -->\n" +
    "		<inline-edit label=\"cui-last-name\" model=\"newDivision.user.name.surname\"></inline-edit>\n" +
    "		<!-- Email -->\n" +
    "		<inline-edit label=\"cui-email\" model=\"newDivision.user.email\"></inline-edit>\n" +
    "		<!-- Country -->\n" +
    "		<inline-edit type=\"auto-complete\" model=\"newDivision.user.addresses[0].country\" display=\"newDivision.user.addresses[0].country.title || newDivision.user.addresses[0].country\" label=\"cui-country\" selected-object=\"newDivision.user.addresses[0].country\" model=\"newDivision.user.addresses[0].country\" local-data=\"base.countries\" search-fields=\"name\" title-field=\"name\"></inline-edit>\n" +
    "		<!-- Address 1 -->\n" +
    "		<inline-edit label=\"cui-address-1\" model=\"newDivision.user.addresses[0].streets[0]\"></inline-edit>\n" +
    "		<!-- Address 2 -->\n" +
    "		<inline-edit label=\"cui-address-2\" model=\"newDivision.user.addresses[0].streets[1]\"></inline-edit>\n" +
    "		<!-- City -->\n" +
    "		<inline-edit label=\"cui-city\" model=\"newDivision.user.addresses[0].city\"></inline-edit>\n" +
    "		<!-- State -->\n" +
    "		<inline-edit label=\"cui-state\" model=\"newDivision.user.addresses[0].state\"></inline-edit>\n" +
    "	  <!-- Postal -->\n" +
    "	  <inline-edit label=\"cui-postal\" model=\"newDivision.user.addresses[0].postal\"></inline-edit>\n" +
    "	  <!-- Phone Number -->\n" +
    "	  <inline-edit label=\"cui-telephone\" model=\"newDivision.user.phones[0].number\"></inline-edit>\n" +
    "	</cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<!-- Organization Information -->\n" +
    "<cui-expandable class=\"cui-expandable\">\n" +
    "  <cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "      {{'cui-organization-information' | translate}}\n" +
    "      <span class=\"chevron\">></span>\n" +
    "    </cui-expandable-title>\n" +
    "\n" +
    "    <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "      <!-- Company/Division -->\n" +
    "      <inline-edit type=\"dropdown\" display=\"newDivision.organizationSelect.organization.name\" label=\"cui-org\" options=\"newDivision.organizationList\" options-expression=\"organization as organization.name for organization in options\" model=\"newDivision.organizationSelect.organization\"></inline-edit>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<!-- Sign In Information -->\n" +
    "<cui-expandable class=\"cui-expandable\">\n" +
    "  <cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "    {{'cui-sign-in-information' | translate}}\n" +
    "    <span class=\"chevron\">></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "    <!-- User ID -->\n" +
    "    <inline-edit label=\"cui-user-id\" model=\"newDivision.userLogin.username\"></inline-edit>\n" +
    "    <!-- Password -->\n" +
    "    <inline-edit label=\"cui-password\" model=\"newDivision.userLogin.password\"></inline-edit>\n" +
    "    <!-- Re-Enter Password -->\n" +
    "    <inline-edit label=\"cui-password-re\" model=\"newDivision.userLogin.passwordRe\"></inline-edit>\n" +
    "    <!-- Challenge Question 1 -->\n" +
    "    test\n" +
    "    <inline-edit type=\"dropdown\" display=\"newDivision.userLogin.question1.question | cuiI18n\" label=\"cui-challenge-question\" options=\"newDivision.userLogin.challengeQuestions1\" options-expression=\"question as (question.question | cuiI18n) for question in options\" model=\"newDivision.userLogin.question1\"></inline-edit>\n" +
    "    <!-- Challenge Answer 1 -->\n" +
    "    <inline-edit label=\"cui-challenge-answer\" model=\"newDivision.userLogin.challengeAnswer1\"></inline-edit>\n" +
    "    <!-- Challenge Question 2 -->\n" +
    "    <inline-edit type=\"dropdown\" display=\"newDivision.userLogin.question2.question[0].text\" label=\"cui-challenge-question\" options=\"newDivision.userLogin.challengeQuestions2\" options-expression=\"question as question.question[0].text for question in options\" model=\"newDivision.userLogin.question2\"></inline-edit>\n" +
    "    <!-- Challenge Answer 2 -->\n" +
    "    <inline-edit label=\"cui-challenge-answer\" model=\"newDivision.userLogin.challengeAnswer2\"></inline-edit>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "  <button class=\"cui-wizard__next\" ng-click=\"\">{{'cui-submit' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newDivision/division.registration-steps/division.userProfile.html',
    "<form name=user novalidate>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"newDivision.user.name.given\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=newDivision.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.email.$error ng-if=user.email.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=email name=email class=cui-input ng-required=true ng-model=\"newDivision.user.email\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email-re' | translate}}</label>\n" +
    "      <div class=cui-error ng-if=\"user.emailRe.$touched && user.emailRe.$error.match\">\n" +
    "        <div class=cui-error__message>{{'email-mismatch' | translate}}</div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=newDivision.emailRe name=emailRe class=cui-input ng-required=true match=\"newDivision.user.email\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=country>{{\"cui-country\" | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <div auto-complete input-name=country pause=100 selected-object=newDivision.user.addresses[0].country local-data=base.countries search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=newDivision.user.addresses[0].country></div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 1</label>\n" +
    "      <input type=text ng-model=newDivision.user.addresses[0].streets[0] class=cui-input name=address1>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 2</label>\n" +
    "      <input type=text ng-model=newDivision.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-city\" | translate}}</label>\n" +
    "      <input type=text ng-model=newDivision.user.addresses[0].city class=cui-input name=city>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-state\" | translate}}</label>\n" +
    "      <input type=text ng-model=newDivision.user.addresses[0].state class=cui-input name=state>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n" +
    "      <input type=text ng-model=newDivision.user.addresses[0].postal class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-telephone\" | translate}}</label>\n" +
    "      <input type=text ng-model=newDivision.user.phones[0].number class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "   <div class=cui-tos-container>\n" +
    "    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n" +
    "    <label for=TOS class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n" +
    "    </label>\n" +
    "    <span class=cui-wizard__step-error ng-if=\"user.TOS.$error.required && user.TOS.$touched\"><br><br> {{'cui-tos-agree' | translate}} </span>\n" +
    "  </div>\n" +
    "\n" +
    "\n" +
    "  <div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n" +
    "    <button class=cui-wizard__next ng-click=nextWithErrorChecking(user) ng-class=\"{'cui-wizard__next--error':!user.$valid}\">{{'cui-next' | translate}}</button>\n" +
    "  </div>\n" +
    "</form>"
  );


  $templateCache.put('assets/app/registration/newDivision/division.registration.html',
    "<div class=code-info>Markup for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/angular-templates/registration/newDivision/division.registration target=blank>here</a> and the javascript <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/js/app/registration/newDivision class=cui-link target=blank>here</a></div>\n" +
    "\n" +
    "<div class=cui-form--mobile-steps>\n" +
    "  <div class=cui-form__title>{{'create-account' | translate}}</div>\n" +
    "  <div class=cui-form__body>\n" +
    "    <cui-wizard bar mobile-stack class=cui-wizard step=1 minimum-padding=30>\n" +
    "      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n" +
    "\n" +
    "      <step title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n" +
    "        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.userProfile.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step title=\"{{'cui-org' | translate}}\" icon=cui:skyscraper>\n" +
    "        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.organization.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step title=\"{{'cui-login' | translate}}\" icon=cui:login>\n" +
    "        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.login.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step title=\"{{'cui-review' | translate}}\" icon=cui:review>\n" +
    "        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.review.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "    </cui-wizard>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.login.html',
    "<form name=\"userLogin\" novalidate>\n" +
    "\n" +
    "	<!-- First Row -->\n" +
    "	<!-- User ID -->\n" +
    "	<label for=\"userID\">{{'cui-user-id' | translate}}</label>\n" +
    "	<div class=\"cui-error\" ng-messages=\"userLogin.name.$error\" ng-if=\"userLogin.name.$touched\">\n" +
    "		<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "	</div>\n" +
    "	<input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.username\">\n" +
    "\n" +
    "	<!-- Second row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<div class=\"cui-input__password-holder\">\n" +
    "				<label>{{'cui-password' | translate}}</label>\n" +
    "				<div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n" +
    "					<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "				</div>\n" +
    "				<input type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.password\" ng-class=\"{'cui-input--error': userLogin.password.$touched && userLogin.password.$invalid}\" password-validation=\"newTlo.passwordPolicies\">\n" +
    "				<div ng-messages=\"userLogin.password.$error\" ng-messages-multiple ng-if=\"userLogin.password.$invalid\" class=\"cui-error__password\">\n" +
    "					<div ng-messages-include=\"assets/app/registration/password-validation.html\"></div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Re-enter Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-password-re' | translate}}</label>\n" +
    "			<div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n" +
    "				<div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n" +
    "			</div>\n" +
    "			<input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.passwordRe\" match=\"newTlo.userLogin.password\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Third row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 1</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.challenge1.$error\" ng-if=\"userLogin.challenge1.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<select ng-model=\"newTlo.userLogin.question1\" name=\"challenge1\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge1.$touched && userLogin.challenge1.$invalid }\" ng-options=\"question as question.question[0].text for question in newTlo.userLogin.challengeQuestions1\">\n" +
    "			</select>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 1</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.challengeAnswer1\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Fourth row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<select ng-model=\"newTlo.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as question.question[0].text for question in newTlo.userLogin.challengeQuestions2\">\n" +
    "			</select>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.challengeAnswer2\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "	<button class=\"cui-wizard__next\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.organization.html',
    "<form name=\"organization\" novalidate>\n" +
    "\n" +
    "  <!-- First Row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Company/Division -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-name\">{{'cui-organization-name' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.name.$error\" ng-if=\"organization.name.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"name\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.name\">\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Phone -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-phone\">{{'cui-telephone' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.phone.$error\" ng-if=\"organization.phone.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"phone\" class=\"cui-input\" ng-model=\"newTLO.organization.phones[0].number\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Second Row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Address 1 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-address1\">{{'cui-address' | translate}} 1</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.address1.$error\" ng-if=\"organization.address1.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"address1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.addresses[0].streets[0]\">\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Address 2 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-address2\">{{'cui-address' | translate}} 2</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.address2.$error\" ng-if=\"organization.address2.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"address2\" class=\"cui-input\" ng-model=\"newTLO.organization.addresses[0].streets[1]\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Third Row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- City -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-city\">{{'cui-city' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.city.$error\" ng-if=\"organization.city.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"city\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.addresses[0].city\">\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- State/Province -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-state\">{{'cui-state' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.state.$error\" ng-if=\"organization.state.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"state\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.addresses[0].state\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Fourth Row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Postal Code -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "    <label for=\"organization-postal\">{{'cui-postal' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.postal.$error\" ng-if=\"organization.postal.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"postal\" class=\"cui-input\" ng-model=\"newTLO.organization.addresses.postal\">\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Country -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=\"organization-country\">{{\"cui-country\" | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"organization.country.$error\" ng-if=\"organization.country.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <div auto-complete input-name=\"country\" pause=\"100\" selected-object=\"newTLO.organization.addresses[0].country\" local-data=\"base.countries\" search-fields=\"name\" title-field=\"name\" input-class=\"cui-input\" match-class=\"highlight\" auto-match=\"true\" field-required=\"newTLO.organization.addresses[0].country\">\n" +
    "        <input type=\"text\" name=\"country\" class=\"cui-input\" ng-model=\"newTLO.organization.addresses[0].country\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "  <button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "  <button class=\"cui-wizard__next\" ng-click=\"nextWithErrorChecking(organization)\" ng-class=\"(organization.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.review.html',
    "<!-- User Information -->\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "		{{'cui-user-information' | translate}}\n" +
    "		<span class=\"chevron\">></span>\n" +
    "	</cui-expandable-title>\n" +
    "\n" +
    "	<cui-expandable-body class=\"cui-expandable__body\">\n" +
    "		<!-- First Name -->\n" +
    "		<inline-edit label=\"cui-first-name\" model=\"newTLO.user.name.given\"></inline-edit>\n" +
    "		<!-- Last Name -->\n" +
    "		<inline-edit label=\"cui-last-name\" model=\"newTLO.user.name.surname\"></inline-edit>\n" +
    "		<!-- Email -->\n" +
    "		<inline-edit label=\"cui-email\" model=\"newTLO.user.email\"></inline-edit>\n" +
    "		<!-- Country -->\n" +
    "		<inline-edit type=\"auto-complete\" model=\"newTLO.user.addresses[0].country\" display=\"newTLO.user.addresses[0].country.title || newTLO.user.addresses[0].country\" label=\"cui-country\" selected-object=\"newTLO.user.addresses[0].country\" model=\"newTLO.user.addresses[0].country\" local-data=\"base.countries\" search-fields=\"name\" title-field=\"name\"></inline-edit>\n" +
    "		<!-- Address 1 -->\n" +
    "		<inline-edit label=\"cui-address-1\" model=\"newTLO.user.addresses[0].streets[0]\"></inline-edit>\n" +
    "		<!-- Address 2 -->\n" +
    "		<inline-edit label=\"cui-address-2\" model=\"newTLO.user.addresses[0].streets[1]\"></inline-edit>\n" +
    "		<!-- City -->\n" +
    "		<inline-edit label=\"cui-city\" model=\"newTLO.user.addresses[0].city\"></inline-edit>\n" +
    "		<!-- State -->\n" +
    "		<inline-edit label=\"cui-state\" model=\"newTLO.user.addresses[0].state\"></inline-edit>\n" +
    "		<!-- Postal -->\n" +
    "		<inline-edit label=\"cui-postal\" model=\"newTLO.user.addresses[0].postal\"></inline-edit>\n" +
    "		<!-- Phone Number -->\n" +
    "		<inline-edit label=\"cui-telephone\" model=\"newTLO.user.phones[0].number\"></inline-edit>\n" +
    "	</cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<!-- Organization Information -->\n" +
    "<cui-expandable class=\"cui-expandable\">\n" +
    "	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "		{{'cui-organization-information' | translate}}\n" +
    "		<span class=\"chevron\">></span>\n" +
    "	</cui-expandable-title>\n" +
    "\n" +
    "	<cui-expandable-body class=\"cui-expandable__body\">\n" +
    "		<!-- Company/Division -->\n" +
    "		<inline-edit label=\"cui-organization-name\" model=\"newTLO.organization.name\"></inline-edit>\n" +
    "		<!-- Telephone -->\n" +
    "		<inline-edit label=\"cui-telephone\" model=\"newTLO.organization.phones[0].number\"></inline-edit>\n" +
    "		<!-- Address 1 -->\n" +
    "		<inline-edit label=\"cui-address-1\" model=\"newTLO.organization.addresses[0].streets[0]\"></inline-edit>\n" +
    "		<!-- Address 2 -->\n" +
    "		<inline-edit label=\"cui-address-2\" model=\"newTLO.organization.addresses[0].streets[1]\"></inline-edit>\n" +
    "		<!-- City -->\n" +
    "		<inline-edit label=\"cui-city\" model=\"newTLO.organization.addresses[0].city\"></inline-edit>\n" +
    "		<!-- State -->\n" +
    "		<inline-edit label=\"cui-state\" model=\"newTLO.organization.addresses[0].state\"></inline-edit>\n" +
    "		<!-- Postal -->\n" +
    "		<inline-edit label=\"cui-postal\" model=\"newTLO.organization.addresses[0].postal\"></inline-edit>\n" +
    "		<!-- Country -->\n" +
    "		<inline-edit label=\"cui-country\" model=\"newTLO.organization.addresses[0].country.title\"></inline-edit>\n" +
    "	</cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<!-- Sign In Information -->\n" +
    "<cui-expandable class=\"cui-expandable\">\n" +
    "	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "		{{'cui-sign-in-information' | translate}}\n" +
    "		<span class=\"chevron\">></span>\n" +
    "	</cui-expandable-title>\n" +
    "\n" +
    "	<cui-expandable-body class=\"cui-expandable__body\">\n" +
    "		<!-- User ID -->\n" +
    "		<inline-edit label=\"cui-user-id\" model=\"newTLO.userLogin.username\"></inline-edit>\n" +
    "		<!-- Password -->\n" +
    "		<inline-edit label=\"cui-password\" model=\"newTLO.userLogin.password\"></inline-edit>\n" +
    "		<!-- Re-Enter Password -->\n" +
    "		<inline-edit label=\"cui-password-re\" model=\"newTLO.userLogin.passwordRe\"></inline-edit>\n" +
    "		<!-- Challenge Question 1 -->\n" +
    "		<inline-edit type=\"dropdown\" display=\"newTLO.userLogin.question1.question[0].text\" label=\"cui-challenge-question\" options=\"newTLO.userLogin.challengeQuestions1\" options-expression=\"question as question.question[0].text for question in options\" model=\"newTLO.userLogin.question1\"></inline-edit>\n" +
    "		<!-- Challenge Answer 1 -->\n" +
    "		<inline-edit label=\"cui-challenge-answer\" model=\"newTLO.userLogin.challengeAnswer1\"></inline-edit>\n" +
    "		<!-- Challenge Question 2 -->\n" +
    "		<inline-edit type=\"dropdown\" display=\"newTLO.userLogin.question2.question[0].text\" label=\"cui-challenge-question\" options=\"newTLO.userLogin.challengeQuestions2\" options-expression=\"question as question.question[0].text for question in options\" model=\"newTLO.userLogin.question2\"></inline-edit>\n" +
    "		<!-- Challenge Answer 2 -->\n" +
    "		<inline-edit label=\"cui-challenge-answer\" model=\"newTLO.userLogin.challengeAnswer2\"></inline-edit>\n" +
    "	</cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "	<button class=\"cui-wizard__next\" ng-click=\"\">{{'cui-submit' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.userProfile.html',
    "<form name=user novalidate>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"newTLO.user.name.given\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=newTLO.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.email.$error ng-if=user.email.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=email name=email class=cui-input ng-required=true ng-model=\"newTLO.user.email\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email-re' | translate}}</label>\n" +
    "      <div class=cui-error ng-if=\"user.emailRe.$touched && user.emailRe.$error.match\">\n" +
    "        <div class=cui-error__message>{{'email-mismatch' | translate}}</div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=newTLO.emailRe name=emailRe class=cui-input ng-required=true match=\"newTLO.user.email\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=country>{{\"cui-country\" | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <div auto-complete input-name=country pause=100 selected-object=newTLO.user.addresses[0].country local-data=base.countries search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=newTLO.user.addresses[0].country></div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 1</label>\n" +
    "      <input type=text ng-model=newTLO.user.addresses[0].streets[0] class=cui-input name=address1>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 2</label>\n" +
    "      <input type=text ng-model=newTLO.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-city\" | translate}}</label>\n" +
    "      <input type=text ng-model=newTLO.user.addresses[0].city class=cui-input name=city>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-state\" | translate}}</label>\n" +
    "      <input type=text ng-model=newTLO.user.addresses[0].state class=cui-input name=state>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n" +
    "      <input type=text ng-model=newTLO.user.addresses[0].postal class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-telephone\" | translate}}</label>\n" +
    "      <input type=text ng-model=newTLO.user.phones[0].number class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-tos-container>\n" +
    "    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n" +
    "    <label for=TOS class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n" +
    "    </label>\n" +
    "    <span class=cui-wizard__step-error ng-if=\"user.TOS.$error.required && user.TOS.$touched\"><br><br> {{'cui-tos-agree' | translate}} </span>\n" +
    "  </div>\n" +
    "\n" +
    "</form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n" +
    "  <button class=cui-wizard__next ng-click=nextWithErrorChecking(user) ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/newTopLevelOrg/topLevelOrg.registration.html',
    "<div class=code-info>Markup for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/angular-templates/registration/newTopLevelOrg/topLevelOrg.registration target=blank>here</a> and the javascript <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/js/app/registration/newTopLevelOrg class=cui-link target=blank>here</a></div>\n" +
    "\n" +
    "<div class=cui-form--mobile-steps>\n" +
    "  <div class=cui-form__title>{{'create-account' | translate}}</div>\n" +
    "  <div class=cui-form__body>\n" +
    "    <cui-wizard bar mobile-stack class=cui-wizard step=1 minimum-padding=30>\n" +
    "      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n" +
    "\n" +
    "      <step title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n" +
    "        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.userProfile.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step title=\"{{'cui-org' | translate}}\" icon=cui:skyscraper>\n" +
    "        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.organization.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step title=\"{{'cui-login' | translate}}\" icon=cui:login>\n" +
    "        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.login.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "      <step title=\"{{'cui-review' | translate}}\" icon=cui:review>\n" +
    "        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.review.html'\"></div>\n" +
    "      </step>\n" +
    "\n" +
    "    </cui-wizard>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/password-validation.html',
    "<p>{{'passwords-must' | translate}}</p>\n" +
    "\n" +
    "<div class=cui-error__message ng-message=disallowedWords>\n" +
    "  <div class=cui-error__status ng-class=\"userLogin.password.$error.disallowedWords ? '': 'cui-error__status--pass'\"></div>\n" +
    "  not contain any of the disallowed words\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=lowercaseNotAllowed>\n" +
    "  <div class=cui-error__status ng-class=\"userLogin.password.$error.lowercaseNotAllowed ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'lowercase-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=uppercaseNotAllowed>\n" +
    "  <div class=cui-error__status ng-class=\"userLogin.password.$error.uppercaseNotAllowed ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'uppercase-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=numberNotAllowed>\n" +
    "  <div class=cui-error__status ng-class=\"userLogin.password.$error.numberNotAllowed ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'numbers-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=specialNotAllowed>\n" +
    "  <div class=cui-error__status ng-class=\"userLogin.password.$error.specialNotAllowed ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'special-not-allowed' | translate}}\n" +
    "</div>\n" +
    "<div class=cui-error__message ng-message=disallowedChars>\n" +
    "  <div class=cui-error__status ng-class=\"userLogin.password.$error.disallowedChars ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'char-not-allowed' | translate}}\n" +
    "</div>\n" +
    "\n" +
    "<div class=cui-error__message>\n" +
    "  <div class=cui-error__status ng-class=\"userLogin.password.$error.length ? '': 'cui-error__status--pass'\"></div>\n" +
    "  {{'password-length' | translate}}<br><br>\n" +
    "</div>\n" +
    "<div class=cui-error__message>{{'password-rules' | translate}}<br>\n" +
    "  <div class=cui-error__message>\n" +
    "    <div class=cui-error__status ng-class=\"userLogin.password.$error.lowercase ? '': 'cui-error__status--pass'\"></div>\n" +
    "    {{'password-lowercase' | translate}}\n" +
    "  </div>\n" +
    "  <div class=cui-error__message>\n" +
    "    <div class=cui-error__status ng-class=\"userLogin.password.$error.uppercase ? '': 'cui-error__status--pass'\"></div>\n" +
    "    {{'password-uppercase' | translate}}\n" +
    "  </div>\n" +
    "  <div class=cui-error__message>\n" +
    "    <div class=cui-error__status ng-class=\"userLogin.password.$error.number ? '': 'cui-error__status--pass'\"></div>\n" +
    "    {{'password-number' | translate}}\n" +
    "  </div>\n" +
    "  <div class=cui-error__message>\n" +
    "    <div class=cui-error__status ng-class=\"userLogin.password.$error.special ? '': 'cui-error__status--pass'\"></div>\n" +
    "    {{'password-special' | translate}}\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/registration.html',
    "<div ui-view></div>"
  );


  $templateCache.put('assets/app/registration/userInvited/complete-registration-popover.html',
    "<div class=cui-popover-container--relative ng-if=usersRegister.showCovisintInfo off-click=\"usersRegister.showCovisintInfo = false\" off-click-if=usersRegister.showCovisintInfo>\n" +
    "  <div class=cui-styeguide__popover-container>\n" +
    "    <div class=\"cui-popover cui-popover--top\">\n" +
    "      <p>{{usersRegister.targetOrganization.name}}<br>\n" +
    "      {{usersRegister.targetOrganization.phones[0].number}}<br>\n" +
    "      {{usersRegister.targetOrganization.addresses[0].streets[0]}}<br>\n" +
    "      {{usersRegister.targetOrganization.addresses[0].city}}, {{usersRegister.targetOrganization.addresses[0].state}} \n" +
    "      {{usersRegister.targetOrganization.addresses[0].postal}}<br>\n" +
    "      {{usersRegister.targetOrganization.addresses[0].country}}</p>\n" +
    "\n" +
    "      <p>{{'cui-inv-user-popover-info' | translate}}</p>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userInvited/users.register-steps/users.register.applications.html',
    "<!-- No Organization Applications -->\n" +
    "<div ng-if=\"!usersRegister.applications.list\">\n" +
    "  {{'cui-org-no-applications' | translate}}\n" +
    "  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n" +
    "    <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"next()\">{{'cui-next' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"goToStep(4)\">{{'cui-back-to-review' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- Organization Applications -->\n" +
    "<div ng-if=\"usersRegister.applications.list && (!usersRegister.applications.step || usersRegister.applications.step===1)\" ng-init=\"usersRegister.applications.step=1\">\n" +
    "  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-app-name' | translate}}\" style=\"margin-bottom:20px;\" ng-model=\"usersRegister.applications.search\" ng-change=\"usersRegister.applications.searchApplications()\"/>\n" +
    "  <div style=\"float:right\" class=\"cui-link\">\n" +
    "    {{'cui-selections' | translate }}\n" +
    "    <div class=\"cui-badge\" ng-bind=\"usersRegister.applications.numberOfSelected\"></div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-repeat=\"application in usersRegister.applications.list | orderBy:'name' track by application.id\" style=\"margin-bottom:10px\">\n" +
    "    <input id=\"application{{$index}}\" type=\"checkbox\" ng-model=\"usersRegister.applications.selected[$index]\" ng-true-value=\"'{{application.packageId}},{{application.name | cuiI18n}}'\" ng-false-value=\"null\" ng-change=\"usersRegister.applications.updateNumberOfSelected(usersRegister.applications.selected[$index])\" style=\"margin-right:10px\"/>\n" +
    "    <label for=\"application{{$index}}\" ng-bind=\"application.name | cuiI18n\"></label>\n" +
    "    <span style=\"float:right;clear:both;\">{{'cui-more-information' | translate }}</span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n" +
    "    <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-click=\"usersRegister.applications.process()===0? next() : usersRegister.applications.step=2\">{{'cui-next' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- Checkout Applications -->\n" +
    "<div ng-if=\"usersRegister.applications.step===2\">\n" +
    "  <span ng-click=\"usersRegister.applications.step=1\" translate>< {{'cui-all-applications'}}</span>\n" +
    "  <div style=\"float:right\" class=\"cui-link\">\n" +
    "    {{'cui-selections' | translate }}\n" +
    "    <div class=\"cui-badge\" ng-bind=\"usersRegister.applications.numberOfSelected\"></div>\n" +
    "  </div>\n" +
    "  <ng-form name=\"selectApps\" class=\"application-review\">\n" +
    "    <div class=\"application-review__name application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-name' }}</span>\n" +
    "    </div>\n" +
    "    <div class=\"application-review__tos-link application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-tos' }}</span>\n" +
    "    </div>\n" +
    "    <div class=\"application-review__tos-agreement application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-tos-agreement' }}</span>\n" +
    "    </div>\n" +
    "    <div ng-repeat=\"application in usersRegister.applications.processedSelected\" class=\"application-review__list\">\n" +
    "      <div class=\"application-review__name\">\n" +
    "        <span>{{application.name}}</span>\n" +
    "      </div>\n" +
    "      <div class=\"application-review__tos-link\">\n" +
    "        <a class=\"cui-link\" translate>{{'cui-view-tos'}}</a>\n" +
    "      </div>\n" +
    "      <div class=\"application-review__tos-agreement\">\n" +
    "        <div class=\"cui-switch\">\n" +
    "          <input class=\"cui-switch__input\" ng-model=\"usersRegister.applications.processedSelected[$index].acceptedTos\" name=\"application{{$index}}\" id=\"application{{$index}}\" type=\"checkbox\" ng-required=\"true\"/>\n" +
    "          <label class=\"cui-switch__label\" for=\"application{{$index}}\">\n" +
    "            <div class=\"cui-switch__container\">\n" +
    "              <span class=\"cui-switch__checked-message\">Accept</span>\n" +
    "              <span class=\"cui-switch__unchecked-message\">Don't Accept</span>\n" +
    "            </div>\n" +
    "          </label>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </ng-form>\n" +
    "\n" +
    "  <div class=\"cui-wizard__step-error\" ng-if=\"!selectApps.$valid && usersRegister.applications.formTouched\">{{ 'cui-package-tos' | translate }}</div>\n" +
    "  <div class=\"cui-wizard__controls\">\n" +
    "    <button class=\"cui-wizard__previous\" ng-click=\"usersRegister.applications.step=usersRegister.applications.step-1\"><< {{'cui-all-applications' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"usersRegister.applications.formTouched=true;nextWithErrorChecking(selectApps)\" ng-class=\"{'cui-wizard__next--error' : !selectApps.$valid }\">{{'cui-next' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"selectApps.$valid && goToStep(4)\" ng-class=\"{'cui-wizard__next--error': !selectApps.$valid}\">{{'cui-back-to-review' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/userInvited/users.register-steps/users.register.login.html',
    "<ng-form name=\"userLogin\" novalidate>\n" +
    "\n" +
    "  <!-- First Row -->\n" +
    "  <!-- User ID -->\n" +
    "  <label for=\"userID\">{{'cui-user-id' | translate}}</label>\n" +
    "  <div class=\"cui-error\" ng-messages=\"userLogin.userID.$error\" ng-if=\"userLogin.userID.$touched\">\n" +
    "    <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "  </div>\n" +
    "  <input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.username\">\n" +
    "\n" +
    "  <!-- Second row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Password -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <div class=\"cui-input__password-holder\">\n" +
    "        <label>{{'cui-password' | translate}}</label>\n" +
    "        <div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n" +
    "          <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "        </div>\n" +
    "        <input type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.password\" ng-class=\"{'cui-input--error': usersRegister.password.$touched && usersRegister.password.$invalid}\" password-validation=\"base.passwordPolicies\" ng-model-options=\"{allowInvalid:true}\" ng-change=\"usersRegister.userLogin.hiddenPassword=base.generateHiddenPassword(usersRegister.userLogin.password)\">\n" +
    "        <div ng-messages=\"userLogin.password.$error\" ng-messages-multiple ng-if=\"userLogin.password.$invalid\" class=\"cui-error__password\">\n" +
    "          <div ng-messages-include=\"assets/app/registration/password-validation.html\"></div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Re-enter Password -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-password-re' | translate}}</label>\n" +
    "      <div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n" +
    "        <div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n" +
    "      </div>\n" +
    "      <input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.passwordRe\" match=\"usersRegister.userLogin.password\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Third row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Challenge Question 1 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-challenge-question' | translate}} 1</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"userLogin.challenge1.$error\" ng-if=\"userLogin.challenge1.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <select ng-model=\"usersRegister.userLogin.question1\" name=\"challenge1\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge1.$touched && userLogin.challenge1.$invalid }\" ng-options=\"question as question.question[0].text for question in usersRegister.userLogin.challengeQuestions1\">\n" +
    "      </select>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Challenge Answer 1 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-challenge-answer' | translate}} 1</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.challengeAnswer1\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- Fourth row -->\n" +
    "  <div class=\"cui-wizard__field-row\">\n" +
    "    <!-- Challenge Question 2 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-challenge-question' | translate}} 2</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <select ng-model=\"usersRegister.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as question.question[0].text for question in usersRegister.userLogin.challengeQuestions2\">\n" +
    "      </select>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Challenge Answer 2 -->\n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-challenge-answer' | translate}} 2</label>\n" +
    "      <div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n" +
    "        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "      </div>\n" +
    "      <input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.challengeAnswer2\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</ng-form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "  <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "  <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "  <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"userLogin.$valid && goToStep(4)\" ng-class=\"!userLogin.$valid? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/userInvited/users.register-steps/users.register.review.html',
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(1)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-user-information' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-first-name' | translate}}: <span class=review-item__value>{{usersRegister.user.name.given}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-last-name' | translate}}: <span class=review-item__value>{{usersRegister.user.name.surname}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-country' | translate}}: <span class=review-item__value>{{usersRegister.userCountry.title || usersRegister.userCountry}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].streets[0] && usersRegister.user.addresses[0].streets[0]!==''\">{{'cui-address-1' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].streets[0]}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].streets[1] && usersRegister.user.addresses[0].streets[1]!==''\">{{'cui-address-2' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].streets[1]}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].city && usersRegister.user.addresses[0].city!==''\">{{'cui-city' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].city}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].state && usersRegister.user.addresses[0].state!==''\">{{'cui-state' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].state}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].postal && usersRegister.user.addresses[0].postal!==''\">{{'cui-postal' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].postal}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.phones[0].number && usersRegister.user.phones[0].number!==''\">{{'cui-telephone' | translate}}: <span class=review-item__value>{{usersRegister.user.phones[0].number}}</span></div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(2)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-sign-in-information' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "    \n" +
    "     <div class=cui-expandable__review-item>{{'cui-user-id' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.username}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-password' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.hiddenPassword}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.question1.question[0].text}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.challengeAnswer1}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.question2.question[0].text}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.challengeAnswer2}}</span></div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(3)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-application-selection' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersRegister.applications.processedSelected.length===0 || !usersRegister.applications.processedSelected.length\">\n" +
    "      <span class=cui-link ng-click=goToStep(3)>{{'no-applications-selected' | translate}}</span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=cui-expandable__review-item ng-repeat=\"application in usersRegister.applications.processedSelected\">{{application.name}}</div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<div class=cui-wizard__controls>\n" +
    "  <button class=cui-wizard__next ng-click=\"userInvitedRegForm.$valid && usersRegister.submit()\" ng-class=\"(!userInvitedRegForm.$valid)? 'cui-wizard__next--error' : usersRegister.sucess? 'success' : usersInvite.success===false? 'fail' : ''\" style=position:relative>\n" +
    "    <div class=cui-loading--medium-ctr ng-if=usersRegister.submitting></div>\n" +
    "    <span ng-if=\"!usersRegister.submitting && usersRegister.success!=false\">{{'cui-submit' | translate}}</span>\n" +
    "    <span ng-if=\"usersRegister.success===false\">Error! Try again?</span>\n" +
    "  </button>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userInvited/users.register-steps/users.register.userProfile.html',
    "<ng-form name=user novalidate>\n" +
    "\n" +
    "  \n" +
    "  <p>{{\"cui-all-fields-required\" | translate}}. {{\"cui-complete-registration\" | translate}}\n" +
    "    <a href class=\"cui-link--medium-light cui-link--no-decoration\" ng-click=usersRegister.applications.toggleCovisintInfo()>{{usersRegister.targetOrganization.name}}\n" +
    "      <div ng-include=\"'assets/app/registration/userInvited/complete-registration-popover.html'\"></div>\n" +
    "    </a>\n" +
    "  </p>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"usersRegister.user.name.given\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=usersRegister.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=country>{{\"cui-country\" | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <div auto-complete input-name=country pause=100 selected-object=usersRegister.userCountry local-data=base.countries search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=usersRegister.userCountry></div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 1</label>\n" +
    "      <input type=text ng-model=usersRegister.user.addresses[0].streets[0] class=cui-input name=address1>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 2</label>\n" +
    "      <input type=text ng-model=usersRegister.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-city\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersRegister.user.addresses[0].city class=cui-input name=city>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-state\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersRegister.user.addresses[0].state class=cui-input name=state>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersRegister.user.addresses[0].postal class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-telephone\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersRegister.user.phones[0].number class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-tos-container>\n" +
    "    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n" +
    "    <label for=TOS class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n" +
    "    </label>\n" +
    "    <span class=cui-wizard__step-error ng-if=\"user.TOS.$error.required && user.TOS.$touched\"><br><br> {{'cui-tos-agree' | translate}} </span>\n" +
    "  </div>\n" +
    "</ng-form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n" +
    "  <button class=cui-wizard__next ng-if=!wizardFinished ng-click=nextWithErrorChecking(user) ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "  <button class=cui-wizard__next ng-if=wizardFinished ng-click=\"user.$valid && goToStep(4)\" ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userInvited/users.register.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/registration/userInvited target=blank>here</a></div>\n" +
    "\n" +
    "<div class=cui-form--mobile-steps>\n" +
    "  <div class=cui-form__title>{{'create-account' | translate}}</div>\n" +
    "  <div class=cui-form__body>\n" +
    "    <cui-wizard bar mobile-stack class=cui-wizard step=1 clickable-indicators minimum-padding=30>\n" +
    "      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n" +
    "      <ng-form name=userInvitedRegForm novalidate>\n" +
    "\n" +
    "        \n" +
    "        <step title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n" +
    "          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.userProfile.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        \n" +
    "        <step title=\"{{'cui-login' | translate}}\" icon=cui:login>\n" +
    "          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.login.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        \n" +
    "        <step title=\"{{'cui-applications' | translate}}\" icon=cui:applications>\n" +
    "          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.applications.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        \n" +
    "        <step title=\"{{'cui-review' | translate}}\" icon=cui:review>\n" +
    "          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.review.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "      </ng-form>\n" +
    "    </cui-wizard>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup-steps/users.walkup.applications.html',
    "<!-- If there's no applications in that organization -->\n" +
    "<div ng-if=\"!usersWalkup.applications.list\">\n" +
    "  Seems like your organization doesn't have any applications. You can always try again after logging in.\n" +
    "  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n" +
    "    <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"next()\">{{'cui-next' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"goToStep(5)\">{{'cui-back-to-review' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- If there's applications -->\n" +
    "<div ng-if=\"usersWalkup.applications.list && (!usersWalkup.applications.step || usersWalkup.applications.step===1)\" ng-init=\"usersWalkup.applications.step=1\">\n" +
    "  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-app-name' | translate}}\" style=\"margin-bottom:20px;\" ng-model=\"usersWalkup.applications.search\" ng-change=\"usersWalkup.applications.searchApplications()\"/>\n" +
    "  <div style=\"float:right\" class=\"cui-link\">\n" +
    "    {{'cui-selections' | translate }}\n" +
    "    <div class=\"cui-badge\" ng-bind=\"usersWalkup.applications.numberOfSelected\"></div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-repeat=\"application in usersWalkup.applications.list | orderBy:'name' track by application.id\" style=\"margin-bottom:10px\">\n" +
    "    <input id=\"application{{$index}}\" type=\"checkbox\" ng-model=\"usersWalkup.applications.selected[$index]\" ng-true-value=\"'{{application.id}},{{application.name | cuiI18n}}'\" ng-false-value=\"null\" ng-change=\"usersWalkup.applications.updateNumberOfSelected(usersWalkup.applications.selected[$index])\" style=\"margin-right:10px\"/>\n" +
    "    <label for=\"application{{$index}}\" ng-bind=\"application.name | cuiI18n\"></label>\n" +
    "    <span style=\"float:right;clear:both;\">{{'cui-more-information' | translate }}</span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n" +
    "  	<button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-click=\"usersWalkup.applications.process()===0? next() : usersWalkup.applications.step=2\">{{'cui-next' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- Checkout Applications -->\n" +
    "<div ng-if=\"usersWalkup.applications.list && usersWalkup.applications.step===2\">\n" +
    "  <span ng-click=\"usersWalkup.applications.step=1\" translate>< {{'cui-all-applications'}}</span>\n" +
    "  <div style=\"float:right\" class=\"cui-link\">\n" +
    "    {{'cui-selections' | translate }}\n" +
    "    <div class=\"cui-badge\" ng-bind=\"usersWalkup.applications.numberOfSelected\"></div>\n" +
    "  </div>\n" +
    "  <ng-form name=\"selectApps\" class=\"application-review\">\n" +
    "    <div class=\"application-review__name application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-name' }}</span>\n" +
    "    </div>\n" +
    "    <div class=\"application-review__tos-link application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-tos' }}</span>\n" +
    "    </div>\n" +
    "    <div class=\"application-review__tos-agreement application-review__label\">\n" +
    "      <span translate>{{ 'cui-application-tos-agreement' }}</span>\n" +
    "    </div>\n" +
    "    <div ng-repeat=\"application in usersWalkup.applications.processedSelected\" class=\"application-review__list\">\n" +
    "      <div class=\"application-review__name\">\n" +
    "        <span>{{application.name}}</span>\n" +
    "      </div>\n" +
    "      <div class=\"application-review__tos-link\">\n" +
    "        <a class=\"cui-link\" translate>{{'cui-view-tos'}}</a>\n" +
    "      </div>\n" +
    "      <div class=\"application-review__tos-agreement\">\n" +
    "        <div class=\"cui-switch\">\n" +
    "          <input class=\"cui-switch__input\" ng-model=\"usersWalkup.applications.processedSelected[$index].acceptedTos\" name=\"application{{$index}}\" id=\"application{{$index}}\" type=\"checkbox\" ng-required=\"true\"/>\n" +
    "          <label class=\"cui-switch__label\" for=\"application{{$index}}\">\n" +
    "            <div class=\"cui-switch__container\">\n" +
    "              <span class=\"cui-switch__checked-message\">Accept</span>\n" +
    "              <span class=\"cui-switch__unchecked-message\">Don't Accept</span>\n" +
    "            </div>\n" +
    "          </label>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </ng-form>\n" +
    "\n" +
    "  <div class=\"cui-wizard__step-error\" ng-if=\"!selectApps.$valid && usersWalkup.applications.formTouched\">{{ 'cui-package-tos' | translate }}</div>\n" +
    "  <div class=\"cui-wizard__controls\">\n" +
    "    <button class=\"cui-wizard__previous\" ng-click=\"usersWalkup.applications.step=usersWalkup.applications.step-1\"><< {{'cui-all-applications' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"usersWalkup.applications.formTouched=true;nextWithErrorChecking(selectApps)\" ng-class=\"{'cui-wizard__next--error' : !selectApps.$valid }\">{{'cui-next' | translate}}</button>\n" +
    "    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"selectApps.$valid && goToStep(5)\" ng-class=\"{'cui-wizard__next--error': !selectApps.$valid}\">{{'cui-back-to-review' | translate}}</button>\n" +
    "  </div>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup-steps/users.walkup.login.html',
    "<ng-form name=\"userLogin\" novalidate>\n" +
    "\n" +
    "	<!-- First Row -->\n" +
    "	<!-- User ID -->\n" +
    "	<label for=\"userID\">{{'cui-user-id' | translate}}</label>\n" +
    "	<div class=\"cui-error\" ng-messages=\"userLogin.userID.$error\" ng-if=\"userLogin.userID.$touched\">\n" +
    "		<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "	</div>\n" +
    "	<input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersWalkup.userLogin.username\" ng-class=\"{'cui-input--error' : userLogin.userID.$touched &&  userLogin.userID.$touched}\">\n" +
    "\n" +
    "	<!-- Second row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<div class=\"cui-input__password-holder\">\n" +
    "				<label>{{'cui-password' | translate}}</label>\n" +
    "				<div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n" +
    "					<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "				</div>\n" +
    "				<input id=\"test-input\" type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersWalkup.userLogin.password\" ng-class=\"{'cui-input--error': userLogin.password.$touched && userLogin.password.$invalid}\" password-validation=\"base.passwordPolicies\" ng-model-options=\"{allowInvalid:true}\" ng-change=\"usersWalkup.userLogin.hiddenPassword=base.generateHiddenPassword(usersWalkup.userLogin.password)\">\n" +
    "				<div ng-messages=\"userLogin.password.$error\" ng-messages-multiple ng-if=\"userLogin.password.$invalid\" class=\"cui-error__password\">\n" +
    "					<div ng-messages-include=\"assets/app/registration/password-validation.html\"></div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Re-enter Password -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-password-re' | translate}}</label>\n" +
    "			<div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n" +
    "				<div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n" +
    "			</div>\n" +
    "			<input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersWalkup.userLogin.passwordRe\" match=\"usersWalkup.userLogin.password\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Third row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 1</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.challenge1.$error\" ng-if=\"userLogin.challenge1.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<select ng-model=\"usersWalkup.userLogin.question1\" name=\"challenge1\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge1.$touched && userLogin.challenge1.$invalid }\" ng-options=\"question as (question.question | cuiI18n) for question in usersWalkup.userLogin.challengeQuestions1\">\n" +
    "			</select>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 1 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 1</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersWalkup.userLogin.challengeAnswer1\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- Fourth row -->\n" +
    "	<div class=\"cui-wizard__field-row\">\n" +
    "		<!-- Challenge Question 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-question' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<select ng-model=\"usersWalkup.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as (question.question | cuiI18n) for question in usersWalkup.userLogin.challengeQuestions2\">\n" +
    "			</select>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- Challenge Answer 2 -->\n" +
    "		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "			<label>{{'cui-challenge-answer' | translate}} 2</label>\n" +
    "			<div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n" +
    "				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n" +
    "			</div>\n" +
    "			<input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersWalkup.userLogin.challengeAnswer2\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</ng-form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "	<button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n" +
    "	<button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "	<button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"userLogin.$valid && goToStep(5)\" ng-class=\"!userLogin.$valid? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup-steps/users.walkup.organization.html',
    "<ng-form name=\"organizationSelect\" novalidate>\n" +
    "  <p>{{'cui-all-organizations' | translate}}</p>\n" +
    "  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-org-name' | translate}}\" ng-model=\"usersWalkup.orgSearch.name\">\n" +
    "\n" +
    "  <cui-expandable class=\"cui-expandable\" ng-repeat=\"organization in usersWalkup.organizationList | orderBy:'name' track by organization.id\">\n" +
    "    <cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n" +
    "      {{organization.name}}\n" +
    "      <span class=\"chevron\">></span>\n" +
    "    </cui-expandable-title>\n" +
    "\n" +
    "    <cui-expandable-body class=\"cui-expandable__body\">\n" +
    "      <p>{{organization.id}}</p>\n" +
    "      <p>{{organization.url}}</p>\n" +
    "      <p>{{organization.phones[0].number}}</p>\n" +
    "\n" +
    "      <div class=\"cui-wizard__controls\">\n" +
    "        <button class=\"cui-wizard__next\" ng-click=\"usersWalkup.organization=organization;next()\">{{'cui-select-org' | translate}}</button>\n" +
    "      </div>\n" +
    "    </cui-expandable-body>\n" +
    "  </cui-expandable>\n" +
    "</ng-form>\n" +
    "\n" +
    "<div class=\"cui-wizard__controls\">\n" +
    "  <button class=\"cui-wizard__previous\" ng-click=\"previous()\" style=\"margin-right:0\"><< {{'cui-previous' | translate}}</button>\n" +
    "</div>\n"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup-steps/users.walkup.review.html',
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(1)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-user-information' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-first-name' | translate}}:<span class=review-item__value>{{usersWalkup.user.name.given}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-last-name' | translate}}:<span class=review-item__value>{{usersWalkup.user.name.surname}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-email' | translate}}:<span class=review-item__value>{{usersWalkup.user.email}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-country' | translate}}:<span class=review-item__value>{{usersWalkup.userCountry.title || usersWalkup.userCountry}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.addresses[0].streets[0] && usersWalkup.user.addresses[0].streets[0]!==''\">{{'cui-address-1' | translate}}:<span class=review-item__value>{{usersWalkup.user.addresses[0].streets[0]}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.addresses[0].streets[1] && usersWalkup.user.addresses[0].streets[1]!==''\">{{'cui-address-2' | translate}}:<span class=review-item__value>{{usersWalkup.user.addresses[0].streets[1]}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.addresses[0].city && usersWalkup.user.addresses[0].city!==''\">{{'cui-city' | translate}}:<span class=review-item__value>{{usersWalkup.user.addresses[0].city}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.addresses[0].state && usersWalkup.user.addresses[0].state!==''\">{{'cui-state' | translate}}:<span class=review-item__value>{{usersWalkup.user.addresses[0].state}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.addresses[0].postal && usersWalkup.user.addresses[0].postal!==''\">{{'cui-postal' | translate}}:<span class=review-item__value>{{usersWalkup.user.addresses[0].postal}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.user.phones[0].number && usersWalkup.user.phones[0].number!==''\">{{'cui-telephone' | translate}}:<span class=review-item__value>{{usersWalkup.user.phones[0].number}}</span></div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "      {{'cui-organization-information' | translate}}\n" +
    "      <span class=chevron>></span>\n" +
    "    </cui-expandable-title>\n" +
    "\n" +
    "    <cui-expandable-body class=cui-expandable__body>\n" +
    "      \n" +
    "      <div class=cui-expandable__review-item>{{'cui-org' | translate}}:<span class=review-item__value>{{usersWalkup.organization.name}}</span></div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(3)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-sign-in-information' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "    \n" +
    "     <div class=cui-expandable__review-item>{{'cui-user-id' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.username}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-password' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.hiddenPassword}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.question1.question | cuiI18n}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.challengeAnswer1}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.question2.question | cuiI18n}}</span></div>\n" +
    "    \n" +
    "    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}:<span class=review-item__value>{{usersWalkup.userLogin.challengeAnswer2}}</span></div>\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "\n" +
    "<cui-expandable class=\"cui-expandable expanded\">\n" +
    "  <div class=cui-expandable__edit-button ng-click=goToStep(4)>\n" +
    "    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n" +
    "  </div>\n" +
    "  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n" +
    "    {{'cui-application-selection' | translate}}\n" +
    "    <span class=chevron>></span>\n" +
    "  </cui-expandable-title>\n" +
    "\n" +
    "  <cui-expandable-body class=cui-expandable__body>\n" +
    "\n" +
    "    <div class=cui-expandable__review-item ng-if=\"usersWalkup.applications.processedSelected.length===0 || !usersWalkup.applications.processedSelected.length\">\n" +
    "      <span class=cui-link ng-click=goToStep(4)>{{'no-applications-selected' | translate}}</span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=cui-expandable__review-item ng-repeat=\"application in usersWalkup.applications.processedSelected\">{{application.name}}</div>\n" +
    "\n" +
    "  </cui-expandable-body>\n" +
    "</cui-expandable>\n" +
    "\n" +
    "<div class=cui-wizard__controls>\n" +
    "\n" +
    "  <div class=cui-error ng-if=usersWalkup.registrationError><label>{{usersWalkup.errorMessage | translate}}</label></div>\n" +
    "\n" +
    "  <button class=cui-wizard__next ng-click=\"userWalkupRegForm.$valid && usersWalkup.submit()\" ng-class=\"(!userWalkupRegForm.$valid)? 'cui-wizard__next--error' : usersWalkup.sucess? 'success' : usersInvite.success===false? 'fail' : ''\" style=position:relative>\n" +
    "    <div class=cui-loading--medium-ctr ng-if=usersWalkup.submitting></div>\n" +
    "    <span ng-if=\"!usersWalkup.submitting && usersWalkup.success!=false\">{{'cui-submit' | translate}}</span>\n" +
    "    <span ng-if=\"usersWalkup.success===false\" name=review.btnError>Error! Try again?</span>\n" +
    "  </button>\n" +
    "</div>"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup-steps/users.walkup.userProfile.html',
    "<ng-form name=user novalidate>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"usersWalkup.user.name.given\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=usersWalkup.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email' | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.email.$error ng-if=user.email.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <input type=email name=email class=cui-input ng-required=true ng-model=\"usersWalkup.user.email\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{'cui-email-re' | translate}}</label>\n" +
    "      <div class=cui-error ng-if=\"user.emailRe.$touched && user.emailRe.$error.match\">\n" +
    "        <div class=cui-error__message>{{'email-mismatch' | translate}}</div>\n" +
    "      </div>\n" +
    "      <input type=text ng-model=usersWalkup.emailRe name=emailRe class=cui-input ng-required=true match=\"usersWalkup.user.email\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=country>{{\"cui-country\" | translate}}</label>\n" +
    "      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n" +
    "        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n" +
    "      </div>\n" +
    "      <div auto-complete input-name=country pause=100 selected-object=usersWalkup.userCountry local-data=base.countries search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=usersWalkup.userCountry></div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 1</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.addresses[0].streets[0] class=cui-input name=address1>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-address\" | translate}} 2</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-city\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.addresses[0].city class=cui-input name=\"city\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-state\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.addresses[0].state class=cui-input name=\"state\">\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.addresses[0].postal class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-wizard__field-row>\n" +
    "    \n" +
    "    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n" +
    "      <label>{{\"cui-telephone\" | translate}}</label>\n" +
    "      <input type=text ng-model=usersWalkup.user.phones[0].number class=cui-input name=\"postal\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  \n" +
    "  <div class=cui-tos-container>\n" +
    "    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n" +
    "    <label ng-click=\"usersRegister.tos=!usersRegister.tos\" class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n" +
    "      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n" +
    "    </label>\n" +
    "    <span class=cui-wizard__step-error ng-if=\"user.TOS.$touched && user.TOS.$error.required\"><br><br> {{'cui-tos-agree' | translate}} </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n" +
    "    <button class=cui-wizard__next ng-if=!wizardFinished ng-click=nextWithErrorChecking(user) ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n" +
    "    <button class=cui-wizard__next ng-if=wizardFinished ng-click=\"user.$valid && goToStep(5)\" ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n" +
    "  </div>\n" +
    "</ng-form>"
  );


  $templateCache.put('assets/app/registration/userWalkup/users.walkup.html',
    "<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/registration/userWalkup target=blank>here</a></div>\n" +
    "<div class=cui-form--mobile-steps>\n" +
    "  <div class=cui-form__title>{{'create-account' | translate}}</div>\n" +
    "  <div class=cui-form__body>\n" +
    "    <cui-wizard bar mobile-stack=700 class=cui-wizard step=1 minimum-padding=100 clickable-indicators>\n" +
    "      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n" +
    "\n" +
    "      <ng-form name=userWalkupRegForm novalidate>\n" +
    "        <step title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n" +
    "          <div ng-include=\"'assets/app/registration/userWalkup/users.walkup-steps/users.walkup.userProfile.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        <step title=\"{{'cui-org' | translate}}\" icon=cui:skyscraper>\n" +
    "          <div ng-include=\"'assets/app/registration/userWalkup/users.walkup-steps/users.walkup.organization.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        <step title=\"{{'cui-login' | translate}}\" icon=cui:login>\n" +
    "          <div ng-include=\"'assets/app/registration/userWalkup/users.walkup-steps/users.walkup.login.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        <step title=\"{{'cui-applications' | translate}}\" icon=cui:applications>\n" +
    "          <div ng-include=\"'assets/app/registration/userWalkup/users.walkup-steps/users.walkup.applications.html'\"></div>\n" +
    "        </step>\n" +
    "\n" +
    "        <step title=\"{{'cui-review' | translate}}\" icon=cui:review>\n" +
    "          <div ng-include=\"'assets/app/registration/userWalkup/users.walkup-steps/users.walkup.review.html'\"></div>\n" +
    "        </step>\n" +
    "      </ng-form>\n" +
    "    </cui-wizard>\n" +
    "  </div>\n" +
    "</div>"
  );

}]);


})(angular);