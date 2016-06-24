angular.module('applications')
.controller('orgAppNewGrantCtrl', function(API,APIError,Loader,Sort,User,$q,$scope,$stateParams) {

    const orgAppNewGrant = this;
    const serviceId = $stateParams.appId;
    const loaderName = 'orgAppNewGrant.';

    orgAppNewGrant.sortFlag = false;

    /* ---------------------------------------- HELPER FUNCTIONS START ---------------------------------------- */

    const getOrganizationUsersByPackage = (packageId, organizationId) => {
    	// Returns users who have been granted the specified packageId
    	// If organizationId is passed, returns users only of that organization

    	let query = [
    		['grantedPackageId', packageId],
    		['granteeType', 'person']
    	];

    	if (organizationId) {
    		query.push([['organization.id', organizationId]]);
    	}

    	return API.cui.getGrants({qs: query})
    	.fail((error) => {
    		throw new Error('Error getting users by package: ', error);
    	});
    };

    /* ----------------------------------------- HELPER FUNCTIONS END ----------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(loaderName + 'initialLoad');

    // Get the logged in user's organization's grant for this service
    API.cui.getOrganizationGrantedApps({organizationId: User.user.organization.id, qs: [['service.id', serviceId]]})
    .then((res) => {
    	orgAppNewGrant.service = res;
    	// Get users who are granted the package
    	return getOrganizationUsersByPackage(res.servicePackage.id);
    })
    .then((res) => {
    	orgAppNewGrant.userList = res;
    	orgAppNewGrant.unparsedUserList = res;
    	let promises = [];

    	// For each grant get the person's user and organization information
    	orgAppNewGrant.userList.forEach((grant) => {
    		promises.push(
    			API.cui.getPerson({personId: grant.grantee.id})
    			.then((res) => {
    				grant.person = res;
    				return API.cui.getOrganization({organizationId: grant.person.organization.id});
    			})
    			.then((res) => {
    				grant.organization = res;
    			})
    		);
    	});

    	$q.all(promises)
		.then((res) => {
			console.log('orgAppNewGrant.userList', orgAppNewGrant.userList);
			console.log('orgAppNewGrant.service', orgAppNewGrant.service);
			Loader.offFor(loaderName + 'initialLoad');
		})
		.catch((error) => {
			APIError.onFor(loaderName + 'initialLoad');
		});
	})
	.fail((error) => {
		throw new Error('Error getting application data');
	});

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgAppNewGrant.sort = function sort(sortValue) {
        Sort.listSort(orgAppNewGrant.userList, sortValue, orgAppNewGrant.sortFlag);
        orgAppNewGrant.sortFlag =! orgAppNewGrant.sortFlag;
    };

    orgAppNewGrant.parseUsersByStatus = function parseUsersByStatus(status) {
        if (status === 'all') {
            orgAppNewGrant.userList = orgAppNewGrant.unparsedUserList;
        }
        else {
            let filteredUsers = _.filter(orgAppNewGrant.unparsedUserList, function(user) {
                return user.status === status;
            });
            orgAppNewGrant.userList = filteredUsers;
        }
    };

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

});
