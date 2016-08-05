angular.module('applications')
.controller('orgApplicationDetailsCtrl', function(API,APIHelpers,APIError,Loader,Sort,User,$q,$scope,$state,$stateParams) {

    const orgApplicationDetails = this;
    const organizationId = User.user.organization.id;
    const serviceId = $stateParams.appId;
    const loaderName = 'orgApplicationDetails.';

    orgApplicationDetails.sortFlag = true;

    /* ---------------------------------------- HELPER FUNCTIONS START ---------------------------------------- */

    const checkIfRequestable = (organizationId, relatedAppsArray) => {
    	if (relatedAppsArray) {
	    	API.cui.getOrganizationRequestableApps({organizationId: organizationId})
	    	.then((res) => {
	    		relatedAppsArray.forEach((app) => {
	    			let requestable = _.find(res, (id) => { return app.id = id });
	    			if (requestable) {
	    				app.requestable = true;
	    			}
	    		});
	    	})
            .then(() => {
                $scope.$digest();
            });
    	}
    };

    const getGrantArrayData = (grantArray) => {
        let promises = [];

        Loader.onFor(loaderName + 'loadingPageData');

        grantArray.forEach((grant) => {
            promises.push(
                API.cui.getPerson({personId: grant.grantee.id})
                .then((res) => {
                    grant.person = res;
                    return API.cui.getOrganization({organizationId: grant.person.organization.id});
                })
                .then((res) => {
                    grant.organization = res;
                    return API.cui.getPersonPackageClaims({grantee: grant.person.organization.id, packageId: grant.servicePackage.id});
                })
                .then((res) => {
                    grant.claims = res.packageClaims;
                })
            );
        });

        $q.all(promises)
        .then((res) => {
            orgApplicationDetails.grantList = grantArray;
            Loader.offFor(loaderName + 'loadingPageData');
        })
        .catch((error) => {
            Loader.offFor(loaderName + 'loadingPageData');
            APIError.onFor(loaderName + 'grants: ', error);
        });
    };

    /* ----------------------------------------- HELPER FUNCTIONS END ----------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(loaderName + 'loadingPageData');

    API.cui.getOrganizationHierarchy({organizationId: User.user.organization.id})
    .then((res) => {
        orgApplicationDetails.organizationList = APIHelpers.flattenOrgHierarchy(res);
        return API.cui.getOrganizationGrantedApps({organizationId: organizationId, qs: [['service.id', serviceId]]});
    })
    .then((res) => {
    	orgApplicationDetails.application = res;
    	return API.cui.getOrganizationRequestableApps({organizationId: organizationId, qs: [['service.id', serviceId]]});
    })
    .then((res) => {
    	orgApplicationDetails.application.bundledApps = res.bundledApps;
    	orgApplicationDetails.application.relatedApps = res.relatedApps;
    	return API.cui.getGrants({qs: [
    		['grantedPackageId', orgApplicationDetails.application.servicePackage.id],
    		['granteeType', 'person']
    	]});
    })
    .then((res) => {
        orgApplicationDetails.unparsedGrantList = res;
        getGrantArrayData(orgApplicationDetails.unparsedGrantList);
        checkIfRequestable(organizationId, orgApplicationDetails.application.relatedApps);
        Loader.offFor(loaderName + 'loadingPageData');
    })
    .fail((error) => {
    	APIError.onFor(loaderName + 'grants: ', error);
        Loader.offFor(loaderName + 'loadingPageData');
    });

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgApplicationDetails.sort = (sortValue) => { 
        Sort.listSort(orgApplicationDetails.userList, sortValue, orgApplicationDetails.sortFlag);
        orgApplicationDetails.sortFlag =! orgApplicationDetails.sortFlag;
    };

    orgApplicationDetails.parseGrantUsersByStatus = (status) => {
        if (status === 'all') {
            orgApplicationDetails.grantList = orgApplicationDetails.unparsedGrantList;
        }
        else {
            let filteredGrantUsers = _.filter(orgApplicationDetails.unparsedGrantList, function(grant) {
                return grant.person.status === status;
            });
            orgApplicationDetails.grantList = filteredGrantUsers;
        }
    };

    orgApplicationDetails.newGrants = () => {
        $state.go('applications.orgApplications.newGrant', {appId: serviceId});
    };

    orgApplicationDetails.switchDivision = (organization) => {
        Loader.onFor(loaderName + 'loadingPageData');

        API.cui.getGrants({qs: [
            ['grantedPackageId', orgApplicationDetails.application.servicePackage.id],
            ['granteeType', 'person'],
            ['organization.id', organization.id]
        ]})
        .then((res) => {
            orgApplicationDetails.unparsedGrantList = res;
            getGrantArrayData(orgApplicationDetails.unparsedGrantList);
            Loader.offFor(loaderName + 'loadingPageData');
        })
        .fail((error) => {
            APIError.onFor(loaderName + 'grants: ', error);
        });
    };

    orgApplicationDetails.requestRelatedApp = (service) => {
        let data = {
            requestor: {
                id: organizationId,
                type: 'organization'  
            } ,
            'servicePackage': {
                id: service.packageId
            }
        };

        Loader.onFor(loaderName + 'appRequest');

        API.cui.postRequest({data: data})
        .then(() => {
            service.requestable = false;
            Loader.offFor(loaderName + 'appRequest');
            $scope.$digest();
        })
        .fail((error) => {
            APIError.onFor(loaderName + 'appRequest')
            console.log(error);
            $scope.$digest();
        });
    };

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

});
