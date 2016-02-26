angular.module('app')
.controller('myApplicationDetailsCtrl',['API','$scope','$stateParams','$state',
function(API,$scope,$stateParams,$state){
    var myApplicationDetails = this;
    var userId='RN3BJI54'; // this will be replaced with the current user ID

    var appId=$stateParams.appId; // get the appId from the url
    var packageId=$stateParams.packageId;  // get the packageId from the url

    var handleError=function(err){
        console.log('Error \n', err);
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

    var getRelatedApps=function(servicePackage){ // WORKAROUND CASE #3
        myApplicationDetails.related=[];
        API.cui.getPackages({ 'parentPackage.id':packageId }) // Get the packages that are children of the package that the app
        .then(function(res){                                  // we're checking the details of belongs to
            if(res.length===0) {
                i++;
                if(i===2) {
                    myApplicationDetails.doneLoading=true;
                    $scope.$digest();
                }
            }
            res.forEach(function(pkg,i){
                var status=[],grantedDate=[];
                API.cui.getPersonPackage({ 'packageId':pkg.id,'personId':userId }) // Check if that child package has been granted to the user
                .then(function(res){
                    if(Object.keys(res).length!==0) { // If the user has been granted the package
                        status[i]=res.status;         // put a status on it and a granted date
                        grantedDate[i]=getDateGranted(res.creation); // so that we can decide wether to show "Request" or the status in the UI
                    }
                    return API.cui.getServices({ 'packageId':packageId });
                })
                .then(function(res){
                    i++;
                    res.forEach(function(app){ // for each of the services in that child package
                        if(status[i]){ // if this status is defined then the user has been granted this service
                            app.status=status[i];
                            app.grantedDate=grantedDate[i];
                        }
                        app.parentPackage=pkg.id; // put the package ID on it so we can redirect the user to the right place when he clicks on the app's name
                        myApplicationDetails.related.push(app);
                    });
                    if(i===2) {
                        myApplicationDetails.doneLoading=true;
                        $scope.$digest();
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
