angular.module('common')
.factory('EditAndCreateApps', function(API, APIError, Loader, $filter, $q, $timeout,$window){
	const EditAndCreateApps= {
		// This data is needed for showing categories in service form
		initializeServiceTemplateData: (scope) => {
			scope.serviceData = {
				categories : [
					{lang:"en",text:"Administration"},
					{lang:"en",text:"Applications"},
					{lang:"en",text:"Roles"}
				]
			}
		},
		// common function for initializing both name and description for multi language
		initializeMultilanguageData: (nameRequired,descriptionRequired,initialData) => {
			let data= {}
			if (!initialData) {
				data.name={
					languages:[],
					label:'cui-name',
					required:nameRequired
				}
				data.description={ 
					languages:[],
					label:'description',
					required:descriptionRequired
				}
			}
			else{
				data=initialData
				data.name={ 
					english:initialData.name.splice(0,1)[0].text,
					languages:initialData.name,
					label:'cui-name',
					required:nameRequired
				}
				if (initialData.description&&initialData.description.length>0) {
					data.description={
						english: initialData.description.splice(0,1)[0].text,
						languages:initialData.description || [],
						label:'description',
						required:descriptionRequired
					}
				}
				else{
					data.description={ 
						languages:[],
						label:'description',
						required:descriptionRequired
					}
				}
			}
			
			return data
		},
		// check for both name and description and error handling
		checkDuplicateLanguagesForNameAndDesc: (data) => {
			data.duplicateLanguage=EditAndCreateApps.checkDuplicateLanguages(data.name)
			if (!data.duplicateLanguage) {
				data.duplicateLanguage=EditAndCreateApps.checkDuplicateLanguages(data.description)
			}
			$timeout(() => {
				data.duplicateLanguage=false
			},5000)
			return !data.duplicateLanguage
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

		// build package data for submit
		buildPackageData: (viewData) => {
			// assign access options and default Data
			let data={
				requestable:viewData.requestable,
		        grantable:viewData.grantable,
		       	displayable:viewData.displayable,
		        requestReasonRequired:viewData.requestReasonRequired
			}
			data= EditAndCreateApps.buildSubmitDataFromMultilangFields(data,viewData)
			data.requiredApprovals=[]
			if(viewData.requireCompanyAdmin){
				data.requiredApprovals.push('organizationAdmin')
			}
			if (viewData.requireAppAdmin) {
				data.requiredApprovals.push('applicationAdmin')
			};
			data.owningOrganization={
				id:API.user.organization.id,
				type:"organization"
			}
			return data
		},

		// build submit data from multilanguage data of name and description

		buildSubmitDataFromMultilangFields: (data,viewData) => {
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
			return data
		},


		// build service data for showing in tables and for submit
		buildServiceData: (viewData) => {
			// assign access options and default Data
			let data={
				urls: [{type:'default',value:viewData.targetUrl}],
		        category: [{lang:'en',text:viewData.category}],
		       	remoteAppId:viewData.remoteAppId,
		        mobileServiceId:viewData.mobileServiceId,
		        owningOrganization:{
		        	id:API.user.organization.id,
		        	type:"organization"
		        }
			}
			data= EditAndCreateApps.buildSubmitDataFromMultilangFields(data,viewData)
			console.log(data)
			return data
		},

		// Manipulates the service Data to display properly in service Template form
		getDataForServiceTemplate: (service) => {
			let serviceViewData={}
			angular.copy(service,serviceViewData)
			serviceViewData=EditAndCreateApps.initializeMultilanguageData(true,false,serviceViewData)
			
			serviceViewData.category=service.category&&service.category[0].text

			serviceViewData.targetUrl=service.urls&&service.urls[0].value
			return serviceViewData
		},

		// ***************Claims related functions******************
		buildClaimData: (viewData,id) => {
			// assign access options and default Data
			let data={
				claimId:viewData.claimId,
				indicator:viewData.indicator,
				claimValues:viewData.claimValues
			}
			data= EditAndCreateApps.buildSubmitDataFromMultilangFields(data,viewData)
			console.log(data)
			return data
		},

		// Manipulates the service Data to display properly in service Template form
		getClaimViewData: (data) => {
			let viewData={}
			angular.copy(data,viewData)
			viewData=EditAndCreateApps.initializeMultilanguageData(true,true,viewData)
			viewData.claimId=data.claimId
			viewData.indicator=data.indicator
			viewData.claimValues=data.claimValues
			return viewData
		},

		// ***************Claims related functions******************
		buildValueData: (viewData,id) => {
			// assign access options and default Data
			let data={
				claimValueId:viewData.claimValueId
			}
			data= EditAndCreateApps.buildSubmitDataFromMultilangFields(data,viewData)
			console.log(data)
			return data
		},

		// Manipulates the service Data to display properly in service Template form
		getValueViewData: (data) => {
			let viewData={}
			angular.copy(data,viewData)
			viewData=EditAndCreateApps.initializeMultilanguageData(true,true,viewData)
			viewData.claimValueId=data.claimValueId
			return viewData
		},

		// build package data for update
		buildPackageDataForUpdate: (viewData,package) => {
			let data = _.merge({},package)
			data.requestable = viewData.requestable
			data.grantable = viewData.grantable
			data.displayable = viewData.displayable
			data.requestReasonRequired = viewData.requestReasonRequired

			data = EditAndCreateApps.buildSubmitDataFromMultilangFields(data,viewData)
			data.requiredApprovals=[]
			if(viewData.requireCompanyAdmin){
				data.requiredApprovals.push('organizationAdmin')
			}
			if (viewData.requireAppAdmin) {
				data.requiredApprovals.push('applicationAdmin')
			};
			return data
		}
	}

	return EditAndCreateApps
})