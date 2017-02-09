angular.module('organization')
	.controller('usersAppRequestsCtrl', ['API', '$scope', 'DataStorage', '$state', '$filter', '$q', 
		function(API, $scope, DataStorage, $state, $filter, $q) {
		
		const usersAppRequests = this;
		
		let apiPromises = [];
		usersAppRequests.list = [];
		usersAppRequests.loading = true;
		usersAppRequests.errorFlag = false;
		usersAppRequests.noRequestsFlag = false;
		usersAppRequests.entitlements = API.user.entitlements;
		
		//To handle Only app admin role
		/*
		let roleFlag = false;
		usersAppRequests.entitlements.forEach((entitlement) => {
			if (entitlement === "Application Admin" || entitlement === "Security Administrator") {
				roleFlag = true;
			};
		})
		
		if (!roleFlag) {
			$state.go('misc.notAuth');
		};
		*/
		let roleFlag = true;
		
		usersAppRequests.sortFlag = {
			name: true,
			title: true,
			date: true,
			request: true,
			division: true
		}

		let getOrganizationDetails = (uniqueOrgs) => {
			let i = 0;
			let uniqueOrgsData = [];
			uniqueOrgs = _.uniq(uniqueOrgs);
			uniqueOrgs.forEach((org) => {
				API.cui.getOrganizationSecured({ organizationId: org })
					.then((organizationData) => {
						i++;
						uniqueOrgsData.push(organizationData);
						if (i === uniqueOrgs.length) {
							usersAppRequests.list.forEach((personRequest) => {
									uniqueOrgsData.forEach((organizationData) => {
										if (personRequest.personData.organization.id === organizationData.id) {
											personRequest.personData.organizationName = organizationData.name;
										}
									})
								})
								//usersAppRequests.list=angular.copy(res);
							usersAppRequests.loading = false;
							$scope.$digest();
						}
					})
					.fail((err) => {
						i++;
						console.log(err);
						usersAppRequests.errorFlag = true;
						usersAppRequests.message = 'cui-general-error-few';
						if (i === uniqueOrgs.length) {
							usersAppRequests.list.forEach((personRequest) => {
									uniqueOrgsData.forEach((organizationData) => {
										if (personRequest.personData.organization.id === organizationData.id) {
											personRequest.personData.organizationName = organizationData.name;
										}
									})
								})
								//usersAppRequests.list=angular.copy(res);
							usersAppRequests.loading = false;
							$scope.$digest();
						}
					})
			})
		};

		let getPackageDetails = (uniquePackageData) => {
			let j = 0;
			let uniquePcakageList = [];
			let packagePromises = [];
			let queryStrings = [],
				//Needed To restrict URL length
				queryStringsCount = 0,
				queryStringsArray = [];
			uniquePackageData.forEach((packageObj, index) => {
				//As of now Coke supports only single packge request during registration
				let queryString = ['id', packageObj.servicePackage.id];
				queryStringsCount += JSON.stringify(queryString).length - 5;
				//To support IE 9 and below
				if (queryStringsCount > 1983 || index === uniquePackageData.length - 1) {
					queryStringsCount = 0;
					queryStrings.push(queryString);
					queryStrings.push(["page", 1]);
					queryStrings.push(["pageSize", 200]);
					queryStringsArray.push(queryStrings)
					queryStrings = [];
				} else {
					queryStrings.push(queryString);
				}
			})
			
			queryStringsArray.forEach((queryStrings, index) => {
				packagePromises.push(API.cui.getPackages({ 'qs': queryStrings }))
			})
			
			$q.all(packagePromises)
				.then((packagesDataList) => {
					packagesDataList.forEach((packagesData) => {
						packagesData.forEach((packageData) => {
							usersAppRequests.list.forEach((request) => {
								if (packageData.id === request.servicePackage.id) {
									request.packageData = angular.copy(packageData);
								};
							})
						})
					})
					usersAppRequests.loading = false;
				})
				.catch((err) => {
					console.log(err);
					if (err.status === 403) {
						$state.go("misc.notAuth");
					};
					usersAppRequests.errorFlag = true;
					usersAppRequests.loading = false;
					usersAppRequests.message = 'cui-general-error-few';
				})
		};

		const handleError = (err) => {
			console.log(err);
			if (err.status === 403) {
				$state.go("misc.notAuth");
			};
			usersAppRequests.errorFlag = true;
			usersAppRequests.loading = false;
			usersAppRequests.message = 'cui-general-error';
			$scope.$digest();
		};

		const getPackageRequests = () => {
			let deferred = $q.defer();
			let countPromises = [];
			let listOfAllPackagerequests = [];
			
			API.cui.getPackageRequestsCount({ 'qs': [
						["isApprovable", true]
					] })
				.then((count) => {
					let pageSize = 200;
					let page = 0;
					count += pageSize;
					while (count > pageSize) {
						count -= pageSize;
						page++;
						countPromises.push(
							API.cui.getPackageRequests({ 'qs': [
									["page", page],
									["pageSize", pageSize],
									["isApprovable", true]
								] })
							.then((res) => {
								listOfAllPackagerequests = listOfAllPackagerequests.concat(res);
							})
						);
					}
					$q.all(countPromises)
						.then(() => {
							deferred.resolve(listOfAllPackagerequests);
						})
						.catch((err) => {
							deferred.reject(err);
						});

				})
				.fail((err) => {
					deferred.reject(err);
				})
			return deferred.promise;
		};

		// HELPER FUNCTIONS END --------------------------------------------------------------------------

		// ON LOAD START ---------------------------------------------------------------------------------


		//API.cui.getPackageRequests({'qs':[["page",3],["pageSize",200]]})
		if (roleFlag) {
			getPackageRequests()
				.then((res) => {
					let queryStrings = [];
					let uniqueOrgs = [],
						//Needed To restrict URL length
						queryStringsCount = 0,
						queryStringsArray = [];
					if (res.length !== 0) {
						//Find unique persons to avoid duplicate API calls
						let i = 0;
						let uniquePersonData = _.uniqBy(res, 'requestor.id');
						let uniqueList = [];
						let uniquepackages = _.uniqBy(res, 'servicePackage.id');
						uniquePersonData.forEach((person, index) => {
							let queryString = ['id', person.requestor.id];
							queryStringsCount += JSON.stringify(queryString).length - 5;
							//To support IE 9 and below
							if (queryStringsCount > 1983 || index === uniquePersonData.length - 1) {
								queryStringsCount = 0;
								queryStrings.push(queryString);
								queryStrings.push(["page", 1]);
								queryStrings.push(["pageSize", 200]);
								queryStringsArray.push(queryStrings)
								queryStrings = [];
							} else {
								queryStrings.push(queryString);
							}
						})
						
						queryStringsArray.forEach((queryStrings, index) => {
							apiPromises.push(API.cui.getPersons({ 'qs': queryStrings }))
						})
						
						$q.all(apiPromises)
							.then((personsDataList) => {
								personsDataList.forEach((personsData) => {
									personsData.forEach((personData) => {
										res.forEach((personRequest) => {
											if (personRequest.requestor.id === personData.id) {
												personRequest.personData = personData;
												uniqueOrgs.push(personData.organization.id);
												usersAppRequests.list.push(personRequest);
											};
										})

									})
								})
								getOrganizationDetails(uniqueOrgs);
								getPackageDetails(uniquepackages);
							})
							.catch(handleError)
					} else {
						usersAppRequests.noRequestsFlag = true;
						usersAppRequests.loading = false;
						usersAppRequests.message = "no-requests";
					}

				})
				.catch(handleError);
		};


		usersAppRequests.goToDetails = function(request) {
			//Need to persist the data for next state to avoid further calls
			DataStorage.setType('packageRequestCoke', request);
			$state.go("organization.requests.pendingRequests", { 'userID': request.personData.id, 'packageID': request.servicePackage.id, 'requestID': request.id })
		}
		
		usersAppRequests.listSort = function(listToSort, sortType, order) {
			listToSort.sort(function(a, b) {
				switch (sortType) {
					case "name":
						a = a.personData.name.given.concat(a.personData.name.prefix | '', a.personData.name.middle | '', a.personData.name.surname, a.personData.name.suffix | '').toUpperCase();
						b = b.personData.name.given.concat(b.personData.name.prefix | '', b.personData.name.middle | '', b.personData.name.surname, b.personData.name.suffix | '').toUpperCase();
						break;
					case "date":
						a = a.creation;
						b = b.creation;
						break;
					case "title":
						a = a.personData.title ? a.personData.title.toUpperCase() : "";
						b = b.personData.title ? b.personData.title.toUpperCase() : "";
						break;
					case "request":
						a = $filter('cuiI18n')(a.packageData.name).toLowerCase();
						b = $filter('cuiI18n')(b.packageData.name).toLowerCase();
						break;
					case "division":
						a = a.personData.organizationName ? a.personData.organizationName.toUpperCase() : "";
						b = b.personData.organizationName ? b.personData.organizationName.toUpperCase() : "";
						break;

				}
				if (order === "ascending") {
					if (a < b) return -1;
					else if (a > b) return 1;
					else return 0;
				} else {
					if (a < b) return 1;
					else if (a > b) return -1;
					else return 0;
				}
			});
		};
		
		usersAppRequests.sort = (sortType) => {
			switch (sortType) {
				case "name":
					if (usersAppRequests.sortFlag.name)
						usersAppRequests.listSort(usersAppRequests.list, sortType, "ascending");
					else
						usersAppRequests.listSort(usersAppRequests.list, sortType, "descending");
					usersAppRequests.sortFlag.name = !usersAppRequests.sortFlag.name;
					break;
				case "date":
					if (usersAppRequests.sortFlag.date)
						usersAppRequests.listSort(usersAppRequests.list, sortType, "ascending");
					else
						usersAppRequests.listSort(usersAppRequests.list, sortType, "descending");
					usersAppRequests.sortFlag.date = !usersAppRequests.sortFlag.date;
					break;
				case "title":
					if (usersAppRequests.sortFlag.title)
						usersAppRequests.listSort(usersAppRequests.list, sortType, "ascending");
					else
						usersAppRequests.listSort(usersAppRequests.list, sortType, "descending");
					usersAppRequests.sortFlag.title = !usersAppRequests.sortFlag.title;
					break;
				case "request":
					if (usersAppRequests.sortFlag.request)
						usersAppRequests.listSort(usersAppRequests.list, sortType, "ascending");
					else
						usersAppRequests.listSort(usersAppRequests.list, sortType, "descending");
					usersAppRequests.sortFlag.request = !usersAppRequests.sortFlag.request;
					break;
				case "division":
					if (usersAppRequests.sortFlag.division)
						usersAppRequests.listSort(usersAppRequests.list, sortType, "ascending");
					else
						usersAppRequests.listSort(usersAppRequests.list, sortType, "descending");
					usersAppRequests.sortFlag.division = !usersAppRequests.sortFlag.division;
					break;

			}
		};
	}])
