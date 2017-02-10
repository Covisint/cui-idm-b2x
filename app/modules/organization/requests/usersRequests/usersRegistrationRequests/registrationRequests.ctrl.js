angular.module('organization')
.controller('usersRegistrationRequestsCtrl', 
		function($filter,$pagination,$q,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User) {

    const scopeName = 'usersRegistrationRequests.'
		const usersRegistrationRequests = this
    usersRegistrationRequests.search = {}

    /* ---------------------------------------- HELPER FUNCTIONS START ---------------------------------------- */

    const switchBetween = (property, firstValue, secondValue) => {
        usersRegistrationRequests.search[property] === firstValue
            ? usersRegistrationRequests.search[property] = secondValue
            : usersRegistrationRequests.search[property] = firstValue
    }

    /* ----------------------------------------- HELPER FUNCTIONS END ----------------------------------------- */


    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

  	var init = function(organizationId) {
  		// TODO... properly use the orgId param...
      usersRegistrationRequests.search['organization.id'] = organizationId || $stateParams.orgId || User.user.organization.id
      usersRegistrationRequests.search.pageSize = usersRegistrationRequests.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

	    usersRegistrationRequests.data = []

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
			API.cui.getRegistrationRequests(
				{ 'qs': [
					['page', 1],
					['pageSize', 10]  
				]}
			).then(function(res) {
				//cui.log('getRegistrationRequests', res);
				_.each(res, function(regReq) {
					//cui.log('getRegistrationRequests each', regReq);
					
					// NB create an obj and bind it to scope...
					var data = {};
        	usersRegistrationRequests.data.push(data);

        	// ..then populate obj asynchronously...
	        getPerson(regReq.registrant.id).then(function(person) {
	        	data.personData = person;
	          return getPackage(regReq.packages[0].id);
					}).then(function(pkg) {
	        	data.packageData = pkg;
						return getOrg(data.personData.organization.id);
					}).then(function(org) {
						data.personData.organization.name = (! _.isEmpty(org)) ? org.name : '';	        	
						return;				
	      	}).then(function() {
	      		if (_.last(res) === regReq) {
			        Loader.offFor(scopeName + 'list')
	      		}
	      	});
				});
			}).fail(function(error) {
        APIError.onFor(scopeName + 'list')
      }).always(function() {
        //TODOD... what is this for?
        //CuiMobileNavFactory.setTitle($filter('cuiI18n')( ? ))
        usersRegistrationRequests.reRenderPagination && usersRegistrationRequests.reRenderPagination()
      });
    };

    init();

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */



    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    // TODO figure this out...
    usersRegistrationRequests.updateSearchParams = (page) => {
        if (page) usersRegistrationRequests.search.page = page
        $state.transitionTo('organization.requests.usersRegistrationRequests', usersRegistrationRequests.search, {notify: false})
        init(usersRegistrationRequests.search['organization.id'])
    }

    usersRegistrationRequests.actionCallbacks = {
        sort (sortType) {
            if (!usersRegistrationRequests.search.hasOwnProperty('sortBy')) usersRegistrationRequests.search['sortBy'] = '+' + sortType
            else if (usersRegistrationRequests.search.sortBy.slice(1) !== sortType) usersRegistrationRequests.search.sortBy = '+' + sortType
            else switchBetween('sortBy', '+' + sortType, '-' + sortType)
            usersRegistrationRequests.updateSearchParams()
        },
        refine (refineType) {
            if (refineType === 'all') delete usersRegistrationRequests.search['refine']
            else {
                if (!usersRegistrationRequests.search.hasOwnProperty('refine')) usersRegistrationRequests.search['refine'] = refineType
                else usersRegistrationRequests.search.refine = refineType
            }
            usersRegistrationRequests.updateSearchParams()
        }
    }

		usersRegistrationRequests.goToDetails = function(request) {
			$state.go('organization.requests.personRequest', {
			 	'userId': request.personData.id, 
				'orgId': request.personData.organization.id 
			})
		}

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

	});
