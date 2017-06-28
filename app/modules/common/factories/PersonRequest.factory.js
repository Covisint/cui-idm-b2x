angular.module('common')
.factory('PersonRequest', (API, APIError, CommonAPI, $q) => {
	'use strict'

	/*
		Use this service as a helper when dealing with person requests.

		Allows you to get a person's registration request or a wrapper call that also gets you the person's and their
		organization's data.
	*/

	const personRequestFactory = {}
	const errorName = 'PersonRequestFactory.'

	/****************************************
				Service Functions
	****************************************/

	// Returns the registration request associated with the userId
	personRequestFactory.getPersonRegistrationRequest = (userId) => {
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

	/*
		Wrapper call for: 	PersonRequest.getPersonRegistrationRequest()
							CommonAPI.getPerson()
							CommonAPI.getOrganization()
	*/
	personRequestFactory.getPersonRegistrationRequestData = (userId, organizationId) => {
		const defer = $q.defer()
		let callsCompleted = 0
		let requestData = {}

		personRequestFactory.getPersonRegistrationRequest(userId)
		.then(registrationRequest => {
			requestData.request = registrationRequest
		})
		.finally(() => {
			callsCompleted += 1
			if (callsCompleted === 3) {
                defer.resolve(requestData);
            }
		})

		CommonAPI.getPerson(userId)
		.then(personData => {
			requestData.personData = personData
		})
		.finally(() => {
			callsCompleted += 1
			if (callsCompleted === 3) {
                defer.resolve(requestData);
            }	
		})

		CommonAPI.getOrganization(organizationId)
		.then(organizationData => {
			requestData.organization = organizationData
		})
		.finally(() => {
			callsCompleted += 1
			if (callsCompleted === 3) {
                defer.resolve(requestData);
            }
		})
		
		return defer.promise
	}

	// Provided a decision ('approved' or 'denied') and the person request object
	// Handles the approval/denial of the person request
	personRequestFactory.handleRequestApproval = (decision, request) => {
		let data = [['requestId', request.id]]

		if (decision === 'approved') {
			API.cui.approvePersonRegistration({qs: data})
		}
		else if (decision === 'denied') {
			if (request.rejectReason) {
				data.push(['reason', request.rejectReason])
				return API.cui.denyPersonRegistration({qs: data})
			}
			else {
				return API.cui.denyPersonRegistration({qs: data})
			}
		}
		else {
			throw new Error('Requires a decision of "approved" or "denied" and the request object.')
		}
	}

	return personRequestFactory

})
