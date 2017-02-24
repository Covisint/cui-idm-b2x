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
  		cui.log('init organizationId', organizationId);

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
					if (orgId.length) {
						var cached = _.find(foundOrgs, {id: orgId});
						if (cached) {
							resolve(cached);
						} else {
							API.cui.getOrganizationSecured({ organizationId: orgId }).then(function(org) {
								foundOrgs.push(org);
								resolve(org);
							}).fail(function(err) {
								cui.log('getOrg error', orgId, err);
								resolve({});
							});
						}
					} else {
						resolve({});
					}
				});
			};

			var getPerson = function(personId) {
				return $q(function (resolve, reject) {
					if (personId.length) {
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
					} else {
						resolve({});
					}
				});
			};

			var getPackage = function(packageId) {
				return $q(function (resolve, reject) {
					if (packageId.length) {
						var cached = _.find(foundPackages, {id: packageId});
						if (cached) {
							resolve(cached);
						} else {
							API.cui.getPackage({ packageId: packageId }).then(function(pkg) {
								//cui.log('getPackage', pkg);
								var p = {id: pkg.id, name: pkg.name[0].text};
								foundPackages.push(p);
								resolve(p);
							}).fail(function(err) {
								cui.log('getPackage error', packageId, err);
								resolve({});
							});
						}
					} else {
						resolve({});
					}
				});
			};

			// TODO figure out qs param creation, especially with respect to sort|refine
			API.cui.getRegistrationRequests(
				{ qs: APIHelpers.getQs(usersRegistrationRequests.search) }
			).then(function(res) {
				//cui.log('getRegistrationRequests', res);
				_.each(res, function(regReq) {
					//cui.log('getRegistrationRequests each', regReq);
					
					// NB create an obj and bind it to scope...
					var data = {};
        	usersRegistrationRequests.data.push(data);

        	// ..then populate obj asynchronously...
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
						return;				
	      	}).then(function() {
	      		if (_.last(res) === regReq) {
	      			// DONE!
			        Loader.offFor(scopeName + 'list')
	            usersRegistrationRequests.statusData = APIHelpers.getCollectionValuesAndCount(_.uniqBy(foundPackages, 'id'), 'name', true)
			        //cui.log('statusData', _.uniqBy(foundPackages, 'id'), usersRegistrationRequests.statusData);
			        //cui.log('foundOrgs', _.uniqBy(foundOrgs, 'id'));
			        usersRegistrationRequests.organizationList = _.uniqBy(foundOrgs, 'id');
			        usersRegistrationRequests.reRenderPagination && usersRegistrationRequests.reRenderPagination()
	      		}
	      	});
				});
			}).then(function(res) {
				API.cui.getRegistrationRequestsCount({
					qs: [['organization.id', usersRegistrationRequests.search['organization.id']]]
				}).then(function(response) {
					cui.log('usersRegistrationRequests.count', response);
					usersRegistrationRequests.userCount = response;
				}).fail(function(error) {
					cui.log('usersRegistrationRequests.count error', error);
				});
			}).fail(function(error) {
        APIError.onFor(scopeName + 'list')
      }).always(function() {
        CuiMobileNavFactory.setTitle($filter('cuiI18n')('Registration Requests'))
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
