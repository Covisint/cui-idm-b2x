angular.module('common')
.factory('EditAndCreateApps', function(API, APIError, Loader, $filter, $q, $timeout,$window){
	const EditAndCreateApps= {
		initializeServiceTemplateData: (scope) => {
			scope.serviceData = {
				categories : [
					{lang:"en",text:"Administration"},
					{lang:"en",text:"Applications"},
					{lang:"en",text:"Roles"}
				]
			}
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
			return data
		},

		buildServiceData: (viewData) => {
			// assign access options and default Data
			let data={
				urls: [{type:'default',value:viewData.targetUrl}],
		        category: [{lang:'en',text:viewData.category}],
		       	remoteAppId:viewData.remoteAppId,
		        mobileServiceId:viewData.mobileServiceId
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
					text:viewData.description.english
				})
			};
			data.description=data.description.concat(viewData.description.languages)

			console.log(data)
			return data
		},

		// Manipulates the service Data to display properly in service Template form
		getDataForServiceTemplate: (service) => {
			let serviceViewData={}
			angular.copy(service,serviceViewData)
			serviceViewData.name={ 
				english:serviceViewData.name.splice(0,1)[0].text,
				languages:serviceViewData.name,
				label:'cui-name',
				required:true
			}
			if (serviceViewData.description&&serviceViewData.description.length>0) {
				serviceViewData.description={
					english: serviceViewData.description.splice(0,1)[0].text,
					languages:serviceViewData.description || [],
					label:'description',
					required:false
				}
			}
			else{
				serviceViewData.description={ 
					languages:[],
					label:'description',
					required:false
				}
			}
			
			serviceViewData.category=service.category&&service.category[0].text

			serviceViewData.targetUrl=service.urls&&service.urls[0].value
			return serviceViewData
		}
	}

	return EditAndCreateApps
})