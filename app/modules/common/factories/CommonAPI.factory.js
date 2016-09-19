angular.module('common')
.factory('CommonAPI', (API, APIError, $q) => {
	'use strict'

	/*
		This service handles basic API calls that are done throughout the project.
		API calls that are more specific are handled in their own services, which often requires the use calls found here.
	*/

	const commonAPIFactory = {}
	const errorName = 'CommonAPIFactory.'

	/****************************************
				Service Functions
	****************************************/

	// Returns person data based on the userId
	commonAPIFactory.getPerson = (userId) => {
		const defer = $q.defer()

		API.cui.getPerson({ personId: userId })
		.done(personResponse => {
			defer.resolve(personResponse)
		})
		.fail(err => {
			console.error('Failed getting person information')
			APIError.onFor(errorName + 'getPerson')
			defer.reject(err)
		})

		return defer.promise
	}

	// Returns organization data based on the organizationId
	commonAPIFactory.getOrganization = (organizationId) => {
		const defer = $q.defer()

		API.cui.getOrganization({ organizationId: organizationId })
		.done(orgResponse => {
			defer.resolve(orgResponse)
		})
		.fail(err => {
			console.error('Failed getting organization information')
			APIError.onFor(errorName + 'getOrganization')
			defer.reject(err)
		})

		return defer.promise
	}

	return commonAPIFactory

})
