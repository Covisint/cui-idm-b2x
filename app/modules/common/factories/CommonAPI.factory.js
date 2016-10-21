angular.module('common')
.factory('CommonAPI', (API, APIError, $q) => {
	'use strict'

	// This service handles basic API calls that are done throughout the project.
	// API calls that are more specific are handled in their own services.

	const errorName = 'CommonAPIFactory.'

	const getPerson = (userId) => {
		const defer = $q.defer()

		APIError.offFor(errorName + 'getPerson')

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

	const getOrganization = (organizationId) => {
		const defer = $q.defer()

		APIError.offFor(errorName + 'getOrganization')

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

	const getOrganizationHierarchy = (organizationId) => {
		const defer = $q.defer()

		APIError.offFor(errorName + 'getOrgHierarchy')

		API.cui.getOrganizationHierarchy({ organizationId: organizationId })
		.done(orgHierarchy => {
			defer.resolve(orgHierarchy)
		})
		.fail(err => {
			console.error('Failed getting organization hierarchy')
			APIError.onFor(errorName + 'getOrgHierarchy')
			defer.reject(err)
		})

		return defer.promise
	}

	return {
		getPerson: getPerson,
		getOrganization: getOrganization,
		getOrganizationHierarchy: getOrganizationHierarchy
	}

})
