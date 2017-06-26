angular.module('organization')
.controller('orgAppRequestsCtrl', 
		function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,DataStorage) {

    const scopeName = 'orgAppRequests.'
	const orgAppRequests = this
    orgAppRequests.search = {}
	orgAppRequests.sortBy = {}

	orgAppRequests.search=Object.assign({},$stateParams)
	if(!orgAppRequests.search.page)
		orgAppRequests.search.page=1

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

		var foundOrgs = [];
		var foundPersons = [];
		var foundPackages = [];


  	var init = function() {
  		cui.log('init');

      orgAppRequests.search['isApprovable'] = true;
      orgAppRequests.search.pageSize = orgAppRequests.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]
			var qsArray = APIHelpers.getQs(orgAppRequests.search);

	    orgAppRequests.data = []
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
	        cui.log('data', orgAppRequests.data);

	        orgAppRequests.reRenderPagination && orgAppRequests.reRenderPagination()
  			});
			};

			/*qsArray.push(['requestor.type','organization'])getPackageRequests*/
			qsArray.push(['requestor.id',User.user.organization.id])
			API.cui.retriveOrgPendingApps({ qs: ['requestor.id',User.user.organization.id] }).then(function(res) {
				var calls = [];

				_.each(res, function(pkgReq) {
					
					// NB create an obj and bind it to scope...
					var data = pkgReq
        	orgAppRequests.data.push(data);

        	// ..then cache the calls, which populate obj asynchronously...
	        calls.push(
	        	getPerson(pkgReq.creator).then(function(person) {
	        		data.personData = person || {};
	        		var pkgId = (pkgReq && pkgReq.servicePackage) ? pkgReq.servicePackage.id : '';
	          	return getPackage(pkgId);
						}).then(function(pkg) {
	        		data.packageData = pkg;
	        		var orgId = pkgReq.requestor.id;
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
				return API.cui.getPackageRequestsCount();
			}).then(function(count) {
				// apply the count
				orgAppRequests.userCount = count;
				API.user.orgAppRequestsCount=count
				return $.Deferred().resolve();				
			}).fail(function(error) {
        APIError.onFor(scopeName + 'data')
      }).always(function() {
        CuiMobileNavFactory.setTitle($filter('cuiI18n')('App Requests'))
      	done('finally');
      });
    };

    init();
    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */


    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */
    orgAppRequests.sortingCallbacks = {
      administrator () {
          orgAppRequests.sortBy.sortBy = 'administrator'
          orgAppRequests.sort(['personData.name.given', 'personData.name.surname'], orgAppRequests.sortBy.sortType)
      },
      submitted () {
          orgAppRequests.sortBy.sortBy = 'submitted'
          orgAppRequests.sort('personData.creation', orgAppRequests.sortBy.sortType)
      },
      request () {
          orgAppRequests.sortBy.sortBy = 'request'
          orgAppRequests.sort('packageData.name', orgAppRequests.sortBy.sortType)
      },
      organization () {
          orgAppRequests.sortBy.sortBy = 'organization'
          orgAppRequests.sort('personData.organization.name', orgAppRequests.sortBy.sortType)
      }
    }

    orgAppRequests.sort = (sortBy, order) => {
    	cui.log('sort', sortBy, order)
      orgAppRequests.data = _.orderBy(orgAppRequests.data, sortBy, order)
    }

		orgAppRequests.goToDetails = function(request) {
			if (request.personData && request.personData.id && 
				request.personData.organization && request.personData.organization.id &&
				request.packageData && request.packageData.id) {
				DataStorage.setType('organizationAppRequest',request)
				$state.go('organization.requests.organizationAppRequest', {
				 	'userId': request.personData.id, 
					'orgId': request.personData.organization.id,
					'packageId': request.packageData.id
				})
			} else {
				cui.log('orgAppRequests goToDetails missing keys', request);
			}
		}

    orgAppRequests.updateSearchParams = (page) => {
        if (page) orgAppRequests.search.page = page
        $state.transitionTo('organization.requests.orgAppRequests', orgAppRequests.search, {notify: false})
        init()
    }
    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

	});
