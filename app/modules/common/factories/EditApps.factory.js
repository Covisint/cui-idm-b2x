angular.module('common')
.factory('EditApps', function(API, APIError, Loader, $filter, $q, $timeout,$window){
	const EditApps= {

		createService: (service) => {
			return API.cui.createService({data:service})
		},

		updateService: (service) => {
			// API doesnot exist yet 2/23/2018
			// return API.cui.updateService({data:service})
		},

		deleteService: (service) => {

		},

		handleEditAndNewService: (service, EditFlag) => {
			if (EditFlag) {
				return EditApps.updateService(service)
			}
			else {
				return EditApps.createService(service)
			}
		}
	}

	return EditApps
})