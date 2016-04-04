angular.module('app')
.controller('myApplicationDetailsCtrl',['API','$scope','$stateParams','$state',
function(API,$scope,$stateParams,$state) {
    var myApplicationDetails = this;

    var appId = $stateParams.appId; // get the appId from the url
    var packageId = $stateParams.packageId;  // get the packageId from the url
    var stepsDone=0,
        stepsRequired=2;

    myApplicationDetails.bundled = [];

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function(err) {
        console.log('Error \n', err);
    };

    // var checkIfDone = function() {
    //     stepsDone++;
    //     if(stepsDone===stepsRequired){

    //     }
    // };


    // var checkIfAppIsGrantedToUser = function(childService, childPackage, packagesGrantedToUser){
    //     var pkgGrantThatMatches;

    //     packagesGrantedToUser.some(function(pkg, i) {
    //         return childPackage.id === pkg.servicePackage.id ? (pkgGrantThatMatches = packagesGrantedToUser[i], true) : false;
    //     });

    //     if (pkgGrantThatMatches) {
    //         childService.status = pkgGrantThatMatches.status;
    //         childService.grantedDate = pkgGrantThatMatches.creation;
    //     }

    //     childService.packageId = childPackage.id;
    //     return childService;
    // };

    // var getRelatedApps = function(app) {
    //     // WORKAROUND CASE #3
    //     myApplicationDetails.related = [];
    //     var packagesGrantedToUser = [];
    //     var childServices = [];

    //     API.cui.getPersonPackages({ personId: API.getUser(), useCuid:true }) // Get All Person Packages
    //     .then(function(res) {
    //         res.forEach(function(pkg) {
    //             packagesGrantedToUser.push(pkg);
    //         });
    //         // Return all child packages of package we are currently viewing
    //         return API.cui.getPackages({qs:[['parentPackage.id',packageId]]});
    //     })
    //     .then(function(res) {
    //         // No Children Packages
    //         if (res.length === 0) {
    //             checkIfDone();
    //         }

    //         var packagesThatAreChildrenOfMainPacakge = res;

    //         // Get services of each child package
    //         packagesThatAreChildrenOfMainPacakge.forEach(function(childPackage, z) {
    //             API.cui.getServices({'packageId':childPackage.id})
    //             .then(function(res) {
    //                 z++;

    //                 res.forEach(function(service) {
    //                     childServices.push(service);
    //                 });

    //                 if (z === packagesThatAreChildrenOfMainPacakge.length) {
    //                     childServices = _.uniq(childServices, function(x) {
    //                         return x.id;
    //                     });

    //                     childServices.forEach(function(service, z) {
    //                         app = checkIfAppIsGrantedToUser(service, childPackage, packagesGrantedToUser);
    //                         myApplicationDetails.related.push(app);
    //                     });

    //                     myApplicationDetails.doneLoading = true;
    //                     $scope.$digest();
    //                 }
    //             })
    //             .fail(handleError);
    //         });
    //     })
    //     .fail(handleError);
    // };

    var getPackageGrantDetails = function(app,bundled) {
        API.cui.getPersonPackage({ personId: API.getUser(), useCuid:true, packageId:packageId })
        .then(function(res) {
            app.grantedDate = res.creation;
            app.status = res.status;
            app.packageId = packageId;
            myApplicationDetails.app = app;
            bundled.forEach(function(app){
                app.grantedDate = res.creation;
                app.status = res.status;
                app.packageId = packageId;
                myApplicationDetails.bundled.push(app);
            });
            myApplicationDetails.doneLoading=true;
            $scope.$digest();
        })
        .fail(handleError);
    };

    var parseAppAndBundled=function(listOfBundledAndMainApp,callback){
        var mainApp;
        var bundledApps=[];
        listOfBundledAndMainApp.forEach(function(app){
            app.parentPackage=packageId;
            if(app.id === appId) mainApp=app;
            else bundledApps.push(app);
        });
        callback(mainApp,bundledApps);
    }

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if (appId) {
        API.cui.getPackageServices({packageId:packageId})
        .then(function(res){
            parseAppAndBundled(res,getPackageGrantDetails); // parseAppAndBundled returns the app we're trying to check
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
