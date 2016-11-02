angular.module('common')
.factory('Organization', (API, $q) => {

	const factoryName = 'organizationFactory.'

	const getOrganizationAdmins = (organizationId) => {
		const defer = $q.defer()

		API.cui.getPersonsAdmins({qs: [['organization.id', organizationId], ['securityadmin', true]]})
		.done(response => defer.resolve(response))
		.fail(error => defer.reject(error))

		return defer.promise
	}

	const getOrganizationPasswordPolicy = (policyId) => {
		const defer = $q.defer()

		API.cui.getPasswordPolicy({policyId: policyId})
		.done(response => defer.resolve(response))
		.fail(error => defer.reject(error))

		return defer.promise
	}

	const initOrganizationProfile = (organizationId, policyId) => {
		const defer = $q.defer()
		const organizationProfile = {}
		const callsToComplete = 2
		let callsCompleted = 0

		getOrganizationAdmins(organizationId)
		.then(response => organizationProfile['admins'] = response)
		.finally(() => {
			callsCompleted += 1
			if (callsCompleted === callsToComplete) defer.resolve(organizationProfile)
		})

		getOrganizationPasswordPolicy(policyId)
		.then(response => organizationProfile['passwordPolicy'] = response)
		.finally(() => {
			callsCompleted += 1
			if (callsCompleted === callsToComplete) defer.resolve(organizationProfile)
		})

		return defer.promise
	}

	return {
		getOrganizationAdmins: getOrganizationAdmins,
		getOrganizationPasswordPolicy: getOrganizationPasswordPolicy,
		initOrganizationProfile: initOrganizationProfile
	}

})
