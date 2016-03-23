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
