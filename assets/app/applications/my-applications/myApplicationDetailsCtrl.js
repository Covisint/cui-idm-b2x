angular.module('app')
.controller('myApplicationDetailsCtrl',['API','$scope','$stateParams','$state',
function(API,$scope,$stateParams,$state){
    var myApplicationDetails = this;

    var appId=$stateParams.appId; // get the appId from the url
    var packageId=$stateParams.packageId;  // get the packageId from the url

    var handleError=function(err){
        console.log('Error \n', err);
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
        API.cui.getPackageServices({ 'packageId':packageId })
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
        API.cui.getPersonPackages({ personId: API.getUser(), useCuid:true }) // Check if that child package has been granted to the user
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
        API.cui.getPersonPackage({ personId: API.getUser(), useCuid:true, packageId:packageId })
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
        API.cui.getService({ 'serviceId':appId })
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
