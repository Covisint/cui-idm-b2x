angular.module('organization')
.controller('usersAppRequestsCtrl', 
		function($filter,$pagination,$q,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User) {

    const scopeName = 'usersAppRequests.'
		const usersAppRequests = this
    usersAppRequests.search = {}

    /* ---------------------------------------- HELPER FUNCTIONS START ---------------------------------------- */

    const switchBetween = (property, firstValue, secondValue) => {
        usersAppRequests.search[property] === firstValue
            ? usersAppRequests.search[property] = secondValue
            : usersAppRequests.search[property] = firstValue
    }

    /* ----------------------------------------- HELPER FUNCTIONS END ----------------------------------------- */


    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

  	var init = function(organizationId) {
  		// TODO... properly use the orgId param...
      usersAppRequests.search['organization.id'] = organizationId || $stateParams.orgId || User.user.organization.id
      usersAppRequests.search.pageSize = usersAppRequests.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

	    usersAppRequests.data = []

      Loader.onFor(scopeName + 'list')
      APIError.offFor(scopeName + 'list')

			var foundOrgs = [];
			var foundPersons = [];
			var foundPackages = [];

			var getOrg = function(orgId) {
				return $q(function (resolve, reject) {
					var cached = _.find(foundOrgs, {id: orgId});
					if (cached) {
						resolve(cached.name);
					} else {
						API.cui.getOrganizationSecured({ organizationId: orgId }).then(function(org) {
							foundOrgs.push(org);
							resolve(org);
						}).fail(function(err) {
							cui.log('getOrg error', orgId, err);
							resolve({});
						});
					}
				});
			};

			var getPerson = function(personId) {
				return $q(function (resolve, reject) {
					var cached = _.find(foundPersons, {id: personId});
					if (cached) {
						resolve(cached);
					} else {
						API.cui.getPerson({ personId: personId }).then(function(person) {
							foundPersons.push(person);
							resolve(person);
						}).fail(function(err) {
							cui.log('getPerson error', personId, err);
							resolve({});
						});
					}
				});
			};

			var getPackage = function(packageId) {
				return $q(function (resolve, reject) {
					var cached = _.find(foundPackages, {id: packageId});
					if (cached) {
						resolve(cached);
					} else {
						API.cui.getPackage({ packageId: packageId }).then(function(pkg) {
							foundPackages.push(pkg);
							resolve(pkg);
						}).fail(function(err) {
							cui.log('getPackage error', packageId, err);
							resolve({});
						});
					}
				});
			};

			// TODO figure out qs param creation, especially with respect to sort|refine
			API.cui.getPackageRequests(
				{ 'qs': [
					['isApprovable', true],
					['page', 1],
					['pageSize', 10]  
				]}
			).then(function(res) {
				//cui.log('getRegistrationRequests', res);
				_.each(res, function(pkgReq) {
					//cui.log('getRegistrationRequests each', pkgReq);
					
					// NB create an obj and bind it to scope...
					var data = {};
        	usersAppRequests.data.push(data);

        	// ..then populate obj asynchronously...
	        getPerson(pkgReq.requestor.id).then(function(person) {
	        	data.personData = person;
	          return getPackage(pkgReq.servicePackage.id);
					}).then(function(pkg) {
	        	data.packageData = pkg;
						return getOrg(data.personData.organization.id);
					}).then(function(org) {
						data.personData.organization.name = (! _.isEmpty(org)) ? org.name : '';	        	
						return;				
	      	}).then(function() {
	      		if (_.last(res) === pkgReq) {
			        Loader.offFor(scopeName + 'list')
	      		}
	      	});
				});
			}).fail(function(error) {
        APIError.onFor(scopeName + 'list')
      }).always(function() {
        //TODOD... what is this for?
        //CuiMobileNavFactory.setTitle($filter('cuiI18n')( ? ))
        usersAppRequests.reRenderPagination && usersAppRequests.reRenderPagination()
      });
    };

    init();

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */



    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    // TODO figure this out...
    usersAppRequests.updateSearchParams = (page) => {
        if (page) usersAppRequests.search.page = page
        $state.transitionTo('organization.requests.usersAppRequests', usersAppRequests.search, {notify: false})
        init(usersAppRequests.search['organization.id'])
    }

    usersAppRequests.actionCallbacks = {
        sort (sortType) {
            if (!usersAppRequests.search.hasOwnProperty('sortBy')) usersAppRequests.search['sortBy'] = '+' + sortType
            else if (usersAppRequests.search.sortBy.slice(1) !== sortType) usersAppRequests.search.sortBy = '+' + sortType
            else switchBetween('sortBy', '+' + sortType, '-' + sortType)
            usersAppRequests.updateSearchParams()
        },
        refine (refineType) {
            if (refineType === 'all') delete usersAppRequests.search['refine']
            else {
                if (!usersAppRequests.search.hasOwnProperty('refine')) usersAppRequests.search['refine'] = refineType
                else usersAppRequests.search.refine = refineType
            }
            usersAppRequests.updateSearchParams()
        }
    }

		usersAppRequests.goToDetails = function(request) {
			$state.go('organization.requests.pendingRequests', {
			 	'userId': request.personData.id, 
				'orgId': request.personData.organization.id,
				'packageId': request.packageData.id
			})
		}

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

	});
