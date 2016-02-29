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
