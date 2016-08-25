angular.module('common')
.factory('PersonRequest', (API, APIError, $q) => {
	'use strict'

	/*
		Use this service as a helper when dealing with person requests.

		Allows you to get a person's registration request or a wrapper call that also gets you the person's and their
		organization's data.
	*/

	const personRequest = {}
	const errorName = 'PersonRequestFactory.'

	/****************************************
				Helper Functions
	****************************************/

	// Returns person data based on the userId
	const getPerson = (userId) => {
		const defer = $q.defer()

		API.cui.getPerson({personId: userId})
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
	const getOrganization = (organizationId) => {
		const defer = $q.defer()

		API.cui.getOrganization({organizationId: organizationId})
		.done(orgResponse => {
			defer.resolve(orgResponse)
		})
		.fail(err => {
			console.error('Failed getting person\'s organization information')
			APIError.onFor(errorName + 'getOrganization')
			defer.reject(err)
		})

		return defer.promise
	}

	/****************************************
				Service Functions
	****************************************/

	// Returns the registration request associated with the userId
	personRequest.getPersonRegistrationRequest = (userId) => {
		const defer = $q.defer()

		API.cui.getPersonRegistrationRequest({qs: [['registrant.id', userId]]})
		.done(registrationResponse => {
			defer.resolve(registrationResponse[0])
		})
		.fail(err => {
			console.error('Failed getting user\'s registration request')
			APIError.onFor(errorName + 'getRegistrationRequest')
			defer.reject(err)
		})

		return defer.promise
	}

	// Wrapper call for service.getPersonRegistrationRequest(), getPerson(), and getOrganization()
	personRequest.getPersonRegistrationRequestData = (userId, organizationId) => {
		const defer = $q.defer()
		let callsCompleted = 0
		let requestData = {}

		personRequest.getPersonRegistrationRequest(userId)
		.then(registrationRequest => {
			requestData.request = registrationRequest
		})
		.finally(() => {
			callsCompleted++
			if (callsCompleted === 3) defer.resolve(requestData)
		})

		getPerson(userId)
		.then(personData => {
			requestData.person = personData
		})
		.finally(() => {
			callsCompleted++
			if (callsCompleted === 3) defer.resolve(requestData)	
		})

		getOrganization(organizationId)
		.then(organizationData => {
			requestData.organization = organizationData
		})
		.finally(() => {
			callsCompleted++
			if (callsCompleted === 3) defer.resolve(requestData)
		})
		
		return defer.promise
	}

	// Provided a decision ('approved' or 'denied') and the person request object
	// Handles the approval/denial of the person request
	personRequest.handleRequestApproval = (decision, request) => {
		let data = [['requestId', request.id]]

		if (decision === 'approved') {
			API.cui.approvePersonRegistration({qs: data})
		}
		else if (decision === 'denied') {
			if (request.rejectReason) {
				data.push(['reason', request.rejectReason])
				API.cui.denyPersonRegistration({qs: data})
			}
			else {
				API.cui.denyPersonRegistration({qs: data})
			}
		}
		else {
			throw new Error('Requires a decision of "approved" or "denied" and the request object.')
		}
	}

	return personRequest

})
