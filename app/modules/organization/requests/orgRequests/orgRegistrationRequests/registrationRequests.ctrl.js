angular.module('organization')
.controller('orgRegistrationRequestsCtrl', 
		function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,DataStorage) {

    const scopeName = 'orgRegistrationRequests.'
	const orgRegistrationRequests = this
    orgRegistrationRequests.search = {}
	orgRegistrationRequests.sortBy = {}

	orgRegistrationRequests.search=Object.assign({},$stateParams)
	if(!orgRegistrationRequests.search.page)
		orgRegistrationRequests.search.page=1

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */
	var foundOrgs = [];
	var foundPersons = [];
	var foundPackages = [];


  	var init = function() {
  		cui.log('init');

    orgRegistrationRequests.search.pageSize = orgRegistrationRequests.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]
	var qsArray = APIHelpers.getQs(orgRegistrationRequests.search);
			//cui.log('qsArray', qsArray);

	orgRegistrationRequests.data = []
    Loader.onFor(scopeName + 'data')
    APIError.offFor(scopeName + 'data')

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
			if (personId&&personId.length) {
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
			cui.log('data', orgRegistrationRequests.data);

    orgRegistrationRequests.reRenderPagination && orgRegistrationRequests.reRenderPagination()
		});
	};

	var start = window.performance.now();
	var end;
	API.cui.getOrgRegistrationRequests({ qs: qsArray })
	.then(function(res) {
		var calls = [];
		_.each(res, function(regReq) {
			//Needed as some requests will not contain security admin details
			//And they need to be removed
			if (regReq.registrant) {
				// NB create an obj and bind it to scope...
				var data = regReq
	        	orgRegistrationRequests.data.push(data);

	        	// ..then cache the calls, which populate obj asynchronously...
		        calls.push(
			        getPerson(regReq.registrant&&regReq.registrant.id)
			        .then(function(person) {
			        	data.personData = person || {};
			        	var pkgId = (! _.isEmpty(regReq.packages)) ? regReq.packages[0].id : '';
			            return getPackage(pkgId);
					})
			        .then(function(pkg) {
			        	data.packageData = pkg;
			        	var orgId = (data.personData && data.personData.organization) ? data.personData.organization.id : '';
						return getOrg(orgId);
					})
			        .then(function(org) {
						if (! data.personData.organization) {
							data.personData.organization = {};
						}
						data.personData.organization.name = (! _.isEmpty(org)) ? org.name : '';	        	
						return $.Deferred().resolve();
		      		})
		      		.fail(function() {
		      			// mute the failures so as not to derail the entire list
								return $.Deferred().resolve();
		      		})
			    );
			}
		});
		return $.Deferred().resolve(calls);
	})
	.then(function(calls) {
		// do the cached calls
		return $.when.apply($, calls);
	})
	.then(function() {
		// do the count (used for pagination)
		return API.cui.getOrgRegistrationRequestsCount();
	})
	.then(function(count) {
		// apply the count
		orgRegistrationRequests.userCount = count;
		API.user.orgRegistrationRequestsCount=count
		return $.Deferred().resolve();				
	})
	.fail(function(error) {
        APIError.onFor(scopeName + 'data')
    })
	.always(function() {
        CuiMobileNavFactory.setTitle($filter('cuiI18n')('Registration Requests'))
      	done('finally');
		var end = window.performance.now();
		var time = end - start;
		cui.log('time', time);
		});
    };

    init();
    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */


    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */
    orgRegistrationRequests.sortingCallbacks = {
      administrator () {
          orgRegistrationRequests.sortBy.sortBy = 'administrator'
          orgRegistrationRequests.sort(['personData.name.given', 'personData.name.surname'], orgRegistrationRequests.sortBy.sortType)
      },
      submitted () {
          orgRegistrationRequests.sortBy.sortBy = 'submitted'
          orgRegistrationRequests.sort('personData.creation', orgRegistrationRequests.sortBy.sortType)
      },
      request () {
          orgRegistrationRequests.sortBy.sortBy = 'request'
          orgRegistrationRequests.sort('packageData.name', orgRegistrationRequests.sortBy.sortType)
      },
      organization () {
          orgRegistrationRequests.sortBy.sortBy = 'organization'
          orgRegistrationRequests.sort('personData.organization.name', orgRegistrationRequests.sortBy.sortType)
      }
    }

    orgRegistrationRequests.sort = (sortBy, order) => {
    	cui.log('sort', sortBy, order)
      orgRegistrationRequests.data = _.orderBy(orgRegistrationRequests.data, sortBy, order)
    }


		orgRegistrationRequests.goToDetails = function(request) {
			if (request.personData && request.personData.id && 
				request.personData.organization && request.personData.organization.id) {
				DataStorage.setType('organizationRegRequest',request)
				$state.go('organization.requests.organizationRequest', {
				 	'userId': request.personData.id, 
					'orgId': request.personData.organization.id 
				})
			} else {
				cui.log('orgRegistrationRequests goToDetails missing keys', request);
			}
		}

    orgRegistrationRequests.updateSearchParams = (page) => {
    	//cui.log('updateSearchParams', page);
        if (page) orgRegistrationRequests.search.page = page
        // WHY transition to this same route? if setting notify:false? what is the purpose? just to add an item to history?
        $state.transitionTo('organization.requests.orgRegistrationRequests', orgRegistrationRequests.search, {notify: false})
        init()
    }
    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

	});
