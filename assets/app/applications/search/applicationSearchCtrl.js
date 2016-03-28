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

    var listOfAvailabeApps=[];
    API.cui.getRequestablePersonPackages({ personId: API.getUser(), useCuid:true })
    .then(function(res){
        var i=0;
        var listOfPackages=res;
        listOfPackages.forEach(function(pkg){
            API.cui.getPackageServices({'packageId':pkg.id})
            .then(function(res){
                i++
                res.forEach(function(service){
                    service.packageId=pkg.id;
                    listOfAvailabeApps.push(service);
                });
                if(i===listOfPackages.length){
                    applicationSearch.unparsedListOfAvailabeApps=listOfAvailabeApps;
                    applicationSearch.parseAppsByCategoryAndName()
                    $scope.$digest();
                }
            })
            .fail(function(){
                i++;
                if(i===listOfPackages.length){
                    applicationSearch.unparsedListOfAvailabeApps=listOfAvailabeApps;
                    applicationSearch.parseAppsByCategoryAndName()
                    $scope.$digest();
                }
            });
        });
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
