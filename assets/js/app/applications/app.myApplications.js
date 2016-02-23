angular.module('app')
.controller('myApplicationsCtrl',['API','$scope',
function(API,$scope){
    var myApplications = this;
    var userId='RN3BJI54';

    myApplications.list=[];

    var handleError=function(err){
        console.log('Error \n\n', err);
    };

    API.doAuth()
    .then(function(res){
        return API.cui.getPersonPackages({'personId':userId}); // this returns a list of grants
    })
    .then(function(res){
        getApplicationsFromGrants(res);
    })
    .fail(handleError);

    var getApplicationsFromGrants=function(grants){
        var i=0;
        grants.forEach(function(grant){
            API.cui.getPackageServices({'packageId':grant.servicePackage.id})
            .then(function(res){
                i++;
                res.forEach(function(service){
                    service.status=grant.status; // attach the status of the package to the service
                    myApplications.list.push(service);
                });
                if(i===grants.length) $scope.$digest();
            })
            .fail(handleError);
        });
    };

}]);
