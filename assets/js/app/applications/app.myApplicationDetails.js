angular.module('app')
.controller('myApplicationDetailsCtrl',['API','$scope','$stateParams',
function(API,$scope,$state){
    var myApplicationDetails = this;
    var userId='RN3BJI54'; // this will be replaced with the current user ID

    var packageId=$stateParams.packageId; // get the packageId from the url

    var handleError=function(err){
        console.log('Error \n\n', err);
    };

    // ON LOAD START ---------------------------------------------------------------------------------

    if(packageId){
        API.doAuth()
        .then(function(res){
            return API.cui.getPersonPackages({'personId':userId,'packageId':packageId});
        })
        .then(function(res){
            getAppDetails(res);
        })
        .fail(handleError);
    }
    else {
        // message for no packageId in the state
    }

    var getAppDetails=function(grant){
        API.cui.getPackage({'packageId':grant.servicePackage.id})
        .then(function(res){
            res.status=grant.status;
            if(res.parent) getParentPackageDetails(); // if the package has a parent
            else $scope.$digest();
        })
        .fail(handleError);
    };

}]);
