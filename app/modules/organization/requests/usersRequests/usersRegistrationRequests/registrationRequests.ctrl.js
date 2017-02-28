angular.module('organization')
.controller('usersRegistrationRequestsCtrl', 
		function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User) {

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
  		cui.log('init', organizationId);

  		usersRegistrationRequests.search['organization.id'] = organizationId || $stateParams.orgId || User.user.organization.id
      usersRegistrationRequests.search.pageSize = usersRegistrationRequests.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

	    usersRegistrationRequests.data = []
      Loader.onFor(scopeName + 'data')
      APIError.offFor(scopeName + 'data')

			var foundOrgs = [];
			var foundPersons = [];
			var foundPackages = [];


			var getOrg = function(orgId) {
				return $.Deferred(function (dfr) {
					if (orgId.length) {
						var cached = _.find(foundOrgs, {id: orgId});
						if (cached) {
							dfr.resolve(cached);
						} else {
							API.cui.getOrganizationSecured({ organizationId: orgId }).then(function(org) {
								foundOrgs.push(org);
								//cui.log('org pushed', org, foundOrgs);
								dfr.resolve(org);
							}).fail(function(err) {
								cui.log('getOrg error', orgId, err);
								dfr.resolve({});
							});
						}
					} else {
						dfr.resolve({});
					}
				});
			};

			var getPerson = function(personId) {
				return $.Deferred(function (dfr) {
					if (personId.length) {
						var cached = _.find(foundPersons, {id: personId});
						if (cached) {
							dfr.resolve(cached);
						} else {
							API.cui.getPerson({ personId: personId }).then(function(person) {
								foundPersons.push(person);
								dfr.resolve(person);
							}).fail(function(err) {
								cui.log('getPerson error', personId, err);
								dfr.resolve({});
							});
						}
					} else {
						dfr.resolve({});
					}
				});
			};

			var getPackage = function(packageId) {
				return $.Deferred(function (dfr) {
					if (packageId.length) {
						var cached = _.find(foundPackages, {id: packageId});
						if (cached) {
							dfr.resolve(cached);
						} else {
							API.cui.getPackage({ packageId: packageId }).then(function(pkg) {
								var p = {id: pkg.id, name: pkg.name[0].text};
								foundPackages.push(p);
								dfr.resolve(p);
							}).fail(function(err) {
								cui.log('getPackage error', packageId, err);
								dfr.resolve({});
							});
						}
					} else {
						dfr.resolve({});
					}
				});
			};

			var done = function(context) {
  			$timeout(function() {
	        Loader.offFor(scopeName + 'data')
	        cui.log('done', context);

	        usersRegistrationRequests.statusData = APIHelpers.getCollectionValuesAndCount(foundPackages, 'name', true)
	       	cui.log('statusData', foundPackages, usersRegistrationRequests.statusData);
	 
	        // cui.log('foundOrgs', _.uniqBy(foundOrgs, 'name'));
	        // usersRegistrationRequests.organizationList = _.uniqBy(foundOrgs, 'name');
	        usersRegistrationRequests.organizationList = APIHelpers.getCollectionValuesAndCount(_.uniqBy(foundOrgs, 'id'), 'name', true)
	        cui.log('foundOrgs', _.uniqBy(foundOrgs, 'id'), usersRegistrationRequests.organizationList);

	        usersRegistrationRequests.reRenderPagination && usersRegistrationRequests.reRenderPagination()
  			});
			};


			API.cui.getRegistrationRequests(
				{ qs: APIHelpers.getQs(usersRegistrationRequests.search) }
			).then(function(res) {
				//cui.log('getRegistrationRequests', res);
				var calls = [];

				_.each(res, function(regReq) {
					//cui.log('getRegistrationRequests each', regReq);
					
					// NB create an obj and bind it to scope...
					var data = {};
        	usersRegistrationRequests.data.push(data);

        	// ..then cache the calls, which populate obj asynchronously...
	        calls.push(
		        getPerson(regReq.registrant.id).then(function(person) {
		        	data.personData = person || {};
		        	var pkgId = (! _.isEmpty(regReq.packages)) ? regReq.packages[0].id : '';
		          return getPackage(pkgId);
						}).then(function(pkg) {
		        	data.packageData = pkg;
		        	var orgId = (data.personData && data.personData.organization) ? data.personData.organization.id : '';
							return getOrg(orgId);
						}).then(function(org) {
							if (! data.personData.organization) {
								data.personData.organization = {};
							}
							data.personData.organization.name = (! _.isEmpty(org)) ? org.name : '';	        	
							return $.Deferred().resolve();
	      		}).fail(function() {
	      			// mute the failures so as not to derail the entire list
							return $.Deferred().resolve();
	      		})
		      );
				});
				return $.Deferred().resolve(calls);
			}).then(function(calls) {
				// do the cached calls
				return $.when.apply($, calls);
			}).then(function() {
				// do the count (used for pagination)
				return API.cui.getRegistrationRequestsCount({
					qs: [['organization.id', usersRegistrationRequests.search['organization.id']]]
				});
			}).then(function(count) {
				// apply the count
				usersRegistrationRequests.userCount = count;
				return $.Deferred().resolve();				
			}).fail(function(error) {
        APIError.onFor(scopeName + 'data')
      }).always(function() {
        CuiMobileNavFactory.setTitle($filter('cuiI18n')('Registration Requests'))
      	done('finally');
      });
    };

    init();

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */



    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    usersRegistrationRequests.updateSearchParams = (page) => {
    	//cui.log('updateSearchParams', page);
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
			if (request.personData && request.personData.id && 
				request.personData.organization && request.personData.organization.id) {
				$state.go('organization.requests.personRequest', {
				 	'userId': request.personData.id, 
					'orgId': request.personData.organization.id 
				})
			} else {
				cui.log('usersRegistrationRequests goToDetails missing keys', request);
			}
		}

    usersRegistrationRequests.getOrgMembers = (organization) => {
        CuiMobileNavFactory.setTitle($filter('cuiI18n')(organization.name))
        init(organization.id)
    }

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

	});
