angular.module('app')
.controller('newAppRequestCtrl',['API','$scope','$state','AppRequests',
function(API,$scope,$state,AppRequests){
    var newAppRequest = this;
    var userId='RN3BJI54'; // this will be replaced with the current user ID
    var services=[];
    var handleError=function(err){
        console.log('Error\n',err);
    };

    // ON LOAD START ---------------------------------------------------------------------------------

    AppRequests.set({}); // This resets the package requests, in case the user had selected some and left the page unexpectedly

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

    API.doAuth()
    .then(function(res){
        return API.cui.getPerson({personId:userId});
    })
    .then(function(res){
        user=res;
        return API.cui.getPackages(); // WORKAROUND CASE #1
    })
    .then(function(res){
        var i=0;
        var packages=res;
        packages.forEach(function(pkg){
            API.cui.getServices({'packageId':pkg.id})
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
