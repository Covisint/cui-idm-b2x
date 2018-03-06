angular.module('common')
.factory('EditAndCreateApps', function(API, APIError, Loader, $filter, $q, $timeout,$window){
	const EditAndCreateApps= {

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
				return EditAndCreateApps.updateService(service)
			}
			else {
				return EditAndCreateApps.createService(service)
			}
		},

		// Check for duplicate language selection in adding multiple languages to a field
		checkDuplicateLanguages: (field) => {
			let duplicateLanguage=false
			field.languages.every( selectedLanguage => {
				if(field.languages.filter( language => {
					if (field.required) {
						return selectedLanguage.lang===language.lang
					}else{
						return selectedLanguage.lang===language.lang&&language.text!==''
					}
					
				}).length>1){
					duplicateLanguage=true
					return false
				}else{
					return true
				}
			})
			return duplicateLanguage
		},

		buildPackageData: (viewData) => {
			// assign access options and default Data
			let data={
				requestable:viewData.requestable,
		        grantable:viewData.grantable,
		       	displayable:viewData.displayable,
		        requestReasonRequired:viewData.requestReasonRequired
			}
			// setup internationalized name and description Data
			data.name=[{
				lang:'en',
				text:viewData.name.english
			}]
			data.name=data.name.concat(viewData.name.languages)
			// Description is not a required field so need to check
			data.description=[]
			if (viewData.description.english) {
				data.description.push({
					lang:'en',
					text:viewData.name.english
				})
			};
			data.description=data.description.concat(viewData.description.languages)

			data.requiredApprovals=[]
			if(viewData.requireCompanyAdmin){
				data.requiredApprovals.push('organizationAdmin')
			}
			if (viewData.requireAppAdmin) {
				data.requiredApprovals.push('applicationAdmin')
			};
			console.log(data)
			return data
		}
	}

	return EditAndCreateApps
})