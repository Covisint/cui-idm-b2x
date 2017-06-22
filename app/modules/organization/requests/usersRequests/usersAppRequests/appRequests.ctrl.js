angular.module('organization')
.controller('usersAppRequestsCtrl', 
		function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User) {

    const scopeName = 'usersAppRequests.'
		const usersAppRequests = this
    usersAppRequests.search = {}
		usersAppRequests.sortBy = {}


    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

		var foundOrgs = [];
		var foundPersons = [];
		var foundPackages = [];


  	var init = function() {
  		cui.log('init');

      usersAppRequests.search['isApprovable'] = true;
      usersAppRequests.search.pageSize = usersAppRequests.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]
			var qsArray = APIHelpers.getQs(usersAppRequests.search);

	    usersAppRequests.data = []
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
	        cui.log('data', usersAppRequests.data);

	        usersAppRequests.reRenderPagination && usersAppRequests.reRenderPagination()
  			});
			};


			API.cui.getPackageRequests({ qs: qsArray }).then(function(res) {
				var calls = [];

				_.each(res, function(pkgReq) {
					
					// NB create an obj and bind it to scope...
					var data = {};
        	usersAppRequests.data.push(data);

        	// ..then cache the calls, which populate obj asynchronously...
	        calls.push(
	        	getPerson(pkgReq.requestor.id).then(function(person) {
	        		data.personData = person || {};
	        		var pkgId = (pkgReq && pkgReq.servicePackage) ? pkgReq.servicePackage.id : '';
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
				return API.cui.getPackageRequestsCount();
			}).then(function(count) {
				// apply the count
				usersAppRequests.userCount = count;
				API.user.userAppRequestsCount=count
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
    usersAppRequests.sortingCallbacks = {
      name () {
          usersAppRequests.sortBy.sortBy = 'name'
          usersAppRequests.sort(['personData.name.given', 'personData.name.surname'], usersAppRequests.sortBy.sortType)
      },
      title () {
          usersAppRequests.sortBy.sortBy = 'title'
          usersAppRequests.sort('personData.title', usersAppRequests.sortBy.sortType)
      },
      submitted () {
          usersAppRequests.sortBy.sortBy = 'submitted'
          usersAppRequests.sort('personData.creation', usersAppRequests.sortBy.sortType)
      },
      application () {
          usersAppRequests.sortBy.sortBy = 'application'
          usersAppRequests.sort('packageData.name', usersAppRequests.sortBy.sortType)
      },
      division () {
          usersAppRequests.sortBy.sortBy = 'division'
          usersAppRequests.sort('personData.organization.name', usersAppRequests.sortBy.sortType)
      }
    }

    usersAppRequests.sort = (sortBy, order) => {
    	cui.log('sort', sortBy, order)
      usersAppRequests.data = _.orderBy(usersAppRequests.data, sortBy, order)
    }

		usersAppRequests.goToDetails = function(request) {
			if (request.personData && request.personData.id && 
				request.personData.organization && request.personData.organization.id &&
				request.packageData && request.packageData.id) {
				$state.go('organization.requests.pendingRequests', {
				 	'userId': request.personData.id, 
					'orgId': request.personData.organization.id,
					'packageId': request.packageData.id
				})
			} else {
				cui.log('usersAppRequests goToDetails missing keys', request);
			}
		}

    usersAppRequests.updateSearchParams = (page) => {
        if (page) usersAppRequests.search.page = page
        $state.transitionTo('organization.requests.usersAppRequests', usersAppRequests.search, {notify: false})
        init()
    }
    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

	});
