angular.module('applications')
.controller('orgApplicationDetailsCtrl', function(API,APIError,Loader,Sort,User,$q,$scope,$state,$stateParams) {

    // TODO:
    // Unparsed Array for Refine
    // Add Division List
    // Get data for changed division

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

    /* ----------------------------------------- HELPER FUNCTIONS END ----------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(loaderName + 'loadingPageData');

    API.cui.getOrganizationGrantedApps({organizationId: organizationId, qs: [['service.id', serviceId]]})
    .then((res) => {
    	orgApplicationDetails.application = res;
    	return API.cui.getOrganizationRequestableApps({organizationId: organizationId, qs: [['service.id', serviceId]]});
    })
    .then((res) => {
    	orgApplicationDetails.application.bundledApps = res.bundledApps;
    	orgApplicationDetails.application.relatedApps = res.relatedApps;
    	return API.cui.getGrants({qs: [
    		['grantedPackageId', orgApplicationDetails.application.servicePackage.id],
    		['granteeType', 'person'],
    	]});
    })
    .then((res) => {
    	orgApplicationDetails.grantList = res;
    	let promises = [];
    	res.forEach((grant) => {

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
		.then(() => {
			checkIfRequestable(organizationId, orgApplicationDetails.application.relatedApps);
			Loader.offFor(loaderName + 'loadingPageData');
		})
		.catch((error) => {
			APIError.onFor(loaderName + 'grantDetails: ', error);
		});

    })
    .fail((error) => {
    	APIError.onFor(loaderName + 'grants: ', error);
    });

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgApplicationDetails.sort = (sortValue) => { 
        Sort.listSort(orgApplicationDetails.userList, sortValue, orgApplicationDetails.sortFlag);
        orgApplicationDetails.sortFlag =! orgApplicationDetails.sortFlag;
    };

    orgApplicationDetails.parseUsersByStatus = function parseUsersByStatus(status) {
        if (status === 'all') {
            orgApplicationDetails.userList = orgApplicationDetails.unparsedUserList;
        }
        else {
            let filteredUsers = _.filter(orgApplicationDetails.unparsedUserList, function(user) {
                return user.status === status;
            });
            orgApplicationDetails.userList = filteredUsers;
        }
    };

    orgApplicationDetails.newGrants = () => {
        $state.go('applications.orgApplications.newGrant', {appId: serviceId});
    };

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

});
