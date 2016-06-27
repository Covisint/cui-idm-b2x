angular.module('applications')
.controller('orgAppNewGrantCtrl', function(API,APIError,Loader,Sort,User,$q,$scope,$stateParams) {

    const orgAppNewGrant = this;
    const serviceId = $stateParams.appId;
    const loaderName = 'orgAppNewGrant.';

    orgAppNewGrant.sortFlag = false;
    orgAppNewGrant.userList = [];

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

    const flattenHierarchy = (orgChildrenArray) => {
        if (orgChildrenArray) {
            let childrenArray = orgChildrenArray;
            let orgList = [];

            childrenArray.forEach(function(childOrg) {
                if (childOrg.children) {
                    let newChildArray = childOrg.children;
                    delete childOrg['children'];
                    orgList.push(childOrg);
                    orgList.push(flattenHierarchy(newChildArray));
                }
                else {
                    orgList.push(childOrg);
                }
            });
            return _.flatten(orgList);
        }
    };

    /* ----------------------------------------- HELPER FUNCTIONS END ----------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(loaderName + 'data');

    // Get the logged in user's organization's grant for this service
    API.cui.getOrganizationGrantedApps({organizationId: User.user.organization.id, qs: [['service.id', serviceId]]})
    .then((res) => {
    	orgAppNewGrant.service = res;
    	// Get the logged in user's organization hierarchy
    	return API.cui.getOrganizationHierarchy({organizationId: User.user.organization.id})
    })
    .then((res) => {
    	orgAppNewGrant.currentOrganizationId = res.id;
        orgAppNewGrant.organizationList = flattenHierarchy(res.children);
    	// Get users who are granted the package
    	return getOrganizationUsersByPackage(orgAppNewGrant.service.servicePackage.id);
	})
	.then((res) => {
    	orgAppNewGrant.unparsedUserList = res;

    	let promises = [];

    	// For each grant get the person's user and organization information
    	orgAppNewGrant.unparsedUserList.forEach((grant) => {
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
			angular.copy(orgAppNewGrant.unparsedUserList, orgAppNewGrant.userList);
			Loader.offFor(loaderName + 'data');
		})
		.catch((error) => {
			APIError.onFor(loaderName + 'data');
		});
	})
	.fail((error) => {
		throw new Error('Error getting application data');
	});

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgAppNewGrant.sort = (sortValue) => { 
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

    orgAppNewGrant.switchDivision = (organization) => {
    	let organizationName;

    	Loader.onFor(loaderName + 'data');

    	orgAppNewGrant.currentOrganizationId = organization.id

    	API.cui.getOrganization({organizationId: orgAppNewGrant.currentOrganizationId})
    	.then((res) => {
    		organizationName = res.name;
    		return getOrganizationUsersByPackage(orgAppNewGrant.service.servicePackage.id, orgAppNewGrant.currentOrganizationId);
    	})
    	.then((res) => {
    		orgAppNewGrant.unparsedUserList = res;

    		let promises = [];

    		orgAppNewGrant.unparsedUserList.forEach((grant) => {
    			promises.push(
    				API.cui.getPerson({personId: grant.grantee.id})
    				.then((res) => {
    					grant.person = res;
    					grant.organization = {
    						name: organizationName
    					};
    				})
    			);
    		})

    		$q.all(promises)
    		.then((res) => {
    			angular.copy(orgAppNewGrant.unparsedUserList, orgAppNewGrant.userList);
    			Loader.offFor(loaderName + 'data');
    		})
    		.catch((error) => {
				APIError.onFor(loaderName + 'data');
			});
    	})
    	.fail((error) => {
			throw new Error('Error getting application data');
		});
    };

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

});
