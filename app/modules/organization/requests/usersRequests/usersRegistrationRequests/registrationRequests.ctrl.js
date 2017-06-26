angular.module('organization')
.controller('usersRegistrationRequestsCtrl', 
		function($timeout,$filter,$pagination,$state,$stateParams,API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,$scope) {

    const scopeName = 'usersRegistrationRequests.'
		const usersRegistrationRequests = this
    usersRegistrationRequests.search = {}
		usersRegistrationRequests.sortBy = {}
	usersRegistrationRequests.searchByOrg=[]
      usersRegistrationRequests.searchByPerson=[]


    /* -------------------------------------------- ON LOAD START --------------------------------------------- */
		var foundOrgs = [];
		var foundPersons = [];
		var foundPackages = [];


  	var init = function() {
  		cui.log('init');

      usersRegistrationRequests.search.pageSize = usersRegistrationRequests.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]
			var qsArray = APIHelpers.getQs(usersRegistrationRequests.search);
			//cui.log('qsArray', qsArray);
			if(usersRegistrationRequests.searchByOrg.length>0){
				usersRegistrationRequests.searchByOrg.forEach(function(val){
					qsArray.push(['organization.id',val.id])
				})
				
			}else if(usersRegistrationRequests.searchByPerson.length>0){
				usersRegistrationRequests.searchByPerson.forEach(function(val){
					qsArray.push(['registrant.id',val.id])
				})
			}
			else{}

	    usersRegistrationRequests.data = []
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
					cui.log('data', usersRegistrationRequests.data);

	        usersRegistrationRequests.reRenderPagination && usersRegistrationRequests.reRenderPagination()
  			});
			};

			var start = window.performance.now();
			var end;
			API.cui.getRegistrationRequests({ qs: qsArray }).then(function(res) {
				var calls = [];

				_.each(res, function(regReq) {
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
		        	console.log(data.personData.organization.id)
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
				return API.cui.getRegistrationRequestsCount();
			}).then(function(count) {
				// apply the count
				usersRegistrationRequests.userCount = count;
				API.user.userRegistrationRequestsCount=count
				return $.Deferred().resolve();				
			}).fail(function(error) {
        APIError.onFor(scopeName + 'data')
      }).always(function() {
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
    usersRegistrationRequests.sortingCallbacks = {
      name () {
          usersRegistrationRequests.sortBy.sortBy = 'name'
          usersRegistrationRequests.sort(['personData.name.given', 'personData.name.surname'], usersRegistrationRequests.sortBy.sortType)
      },
      title () {
          usersRegistrationRequests.sortBy.sortBy = 'title'
          usersRegistrationRequests.sort('personData.title', usersRegistrationRequests.sortBy.sortType)
      },
      submitted () {
          usersRegistrationRequests.sortBy.sortBy = 'submitted'
          usersRegistrationRequests.sort('personData.creation', usersRegistrationRequests.sortBy.sortType)
      },
      application () {
          usersRegistrationRequests.sortBy.sortBy = 'application'
          usersRegistrationRequests.sort('packageData.name', usersRegistrationRequests.sortBy.sortType)
      },
      division () {
          usersRegistrationRequests.sortBy.sortBy = 'division'
          usersRegistrationRequests.sort('personData.organization.name', usersRegistrationRequests.sortBy.sortType)
      }
    }

    usersRegistrationRequests.sort = (sortBy, order) => {
    	cui.log('sort', sortBy, order)
      usersRegistrationRequests.data = _.orderBy(usersRegistrationRequests.data, sortBy, order)
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

    usersRegistrationRequests.updateSearchParams = (page) => {
    	//cui.log('updateSearchParams', page);
        if (page) usersRegistrationRequests.search.page = page
        // WHY transition to this same route? if setting notify:false? what is the purpose? just to add an item to history?
        $state.transitionTo('organization.requests.usersRegistrationRequests', usersRegistrationRequests.search, {notify: false})
        init()
    }
    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */
    usersRegistrationRequests.searchBy='person'
    usersRegistrationRequests.updateSearchByName = () =>{     
    	//console.log(usersRegistrationRequests.searchBy)
    	if(usersRegistrationRequests.searchBy==='org'&&usersRegistrationRequests.searchValue){
    		Loader.onFor(scopeName + 'data')
      		APIError.offFor(scopeName + 'data')
      		 usersRegistrationRequests.searchByOrg=[]
    		API.cui.getOrganizations({qs:[['name',usersRegistrationRequests.searchValue+'*']]})
    		.then((res) =>{
    			console.log(res)
    			usersRegistrationRequests.searchByOrg=res
    			Loader.offFor(scopeName + 'data')
    			if(res.length>0){
    				$state.transitionTo('organization.requests.usersRegistrationRequests', usersRegistrationRequests.searchByOrg, {notify: false})
        			init()
        		}else{
        			usersRegistrationRequests.data=[]
        			$scope.$apply()
        		}
    		})
    		.fail((err) =>{
    			console.log(err)
    		})
    	}else if (usersRegistrationRequests.searchBy==='person'&&usersRegistrationRequests.searchValue){
    		Loader.onFor(scopeName + 'data')
      		APIError.offFor(scopeName + 'data')
      		 usersRegistrationRequests.searchByPerson=[]
    		API.cui.getPersons({qs:[['fullName',usersRegistrationRequests.searchValue]]})
    		.then(res =>{
    			console.log(res)
    			usersRegistrationRequests.searchByPerson=res
    			Loader.offFor(scopeName + 'data')
    			if(res.length>0){
    				$state.transitionTo('organization.requests.usersRegistrationRequests', usersRegistrationRequests.searchByPerson, {notify: false})
        			init()
        		}else{
        			usersRegistrationRequests.data=[]
        			$scope.$apply()
        		}
    		})
    		.fail(err =>{
    				console.log(err)
    		})
    	}else{
    		usersRegistrationRequests.searchByOrg=[]
            usersRegistrationRequests.searchByPerson=[]
    		$state.transitionTo('organization.requests.usersRegistrationRequests', {notify: false})
    		init()
    	}
    		/*return undefined*/
    }
	
	});
