angular.module('app')
.controller('applicationSearchCtrl',['API','$scope','$stateParams','$state','$filter',
function(API,$scope,$stateParams,$state,$filter){
    var applicationSearch = this;
    var userId='RN3BJI54'; // this will be replaced with the current user ID
    var nameSearch=$stateParams.name;
    var categorySearch=$stateParams.category;
    var orgPackageList=[],
        userPackageList=[], // WORKAROUND CASE #1
        packageRequests=[];

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

    var getApplications=function(orgPackageListPassed){
        var listOfAvailabeApps=[],i=0;
        var listOfOrgPackages=orgPackageListPassed || orgPackageList; // so we can call this without passing the orgPackageList again
        listOfOrgPackages.forEach(function(orgPackage){
            if(orgPackage.requestable){
                API.cui.getServices({'packageId':orgPackage.id})
                .then(function(res){
                    i++
                    res.forEach(function(service){
                        service.packageId=orgPackage.id;
                        service.owningOrganization=orgPackage.owningOrganization;
                        listOfAvailabeApps.push(service);
                    });
                    if(i===listOfOrgPackages.length){
                        applicationSearch.unparsedListOfAvailabeApps=listOfAvailabeApps;
                        applicationSearch.parseAppsByCategoryAndName()
                        $scope.$digest();
                    }
                })
                .fail(handleError);
            }
            else i++;
            if(i===listOfOrgPackages.length){
                applicationSearch.unparsedListOfAvailabeApps=listOfAvailabeApps;
                applicationSearch.parseAppsByCategoryAndName();
                $scope.$digest();
            }
        });
    };

    var getAvailableApplications=function(userPackageGrantList){ // get apps that the user can request and doesn't already have grants to
        orgPackageList.forEach(function(orgPackage,i){
            var userGrantInPackageList = _.some(userPackageList,function(userPackageGrant){ // if the user has grants to a package in the list of
                return orgPackage.id===userPackageGrant.servicePackage.id; // packages granted to an org, remove that package from the list.
            });
            if(userGrantInPackageList) orgPackageList.splice(i,1);
        });
        var i=0;
        orgPackageList.forEach(function(orgPackage){
            API.cui.getOrganization({'organizationId':orgPackage.owningOrganization.id})
            .then(function(res){
                i++;
                orgPackage.owningOrganization=res; // WORKAROUND CASE # 8
                if(i===orgPackageList.length){
                    getApplications(orgPackageList);
                }
            })
            .fail(handleError);
        })
    };

    var getUserPackageGrants=function(){ // gets applications that are available for request
        API.cui.getPersonPackages({personId:userId})
        .then(function(res){
            userPackageList=res;
            getAvailableApplications(userPackageList);
        })
        .fail(handleError);
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
            API.cui.getPackage({'packageId':pkgGrant.servicePackage.id})
            .then(function(res){
                i++;
                orgPackageList.push(res);
                if(i===packageGrants.length){
                    getUserPackageGrants();
                }
            })
            .fail(handleError);
        });
    })
   .fail(handleError);

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    applicationSearch.listenForEnter=function($event){
        if($event.keyCode===13) applicationSearch.parseAppsByCategoryAndName();
    };

    var pkgRequestCount=applicationSearch.numberOfRequest=0;

    var processNumberOfRequiredApps=function(pkgRequest){
        if(pkgRequest) pkgRequestCount++;
        else pkgRequestCount--;
        applicationSearch.numberOfRequest=pkgRequestCount;
    }

    applicationSearch.toggleRequest=function(i,application){
        if(!packageRequests[i]) packageRequests[i]=application;
        else packageRequests[i]=undefined;
        processNumberOfRequiredApps(packageRequests[i]);
    };

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);
