angular.module('common')
.factory('UserList', (API, APIError, APIHelpers, $q) => {

	const errorName = 'UserListFactory.'

	const getUsers = (opts) => {
		const defer = $q.defer()

		APIError.offFor(errorName + 'getUsers')

		API.cui.getPersons(opts)
		.done(personResponse => {
			defer.resolve(personResponse)
		})
		.fail(error => {
			console.error('Failed getting user list')
			APIError.onFor(errorName + 'getUsers')
			defer.reject(error)
		})

		return defer.promise
	}

	const getUserCount = (opts) => {
		const defer = $q.defer()

		APIError.offFor(errorName + 'getUserCount')

		API.cui.countPersons(opts)
		.done(countResponse => {
			defer.resolve(countResponse)
		})
		.fail(error => {
			console.error('Failed getting user count')
			APIError.onFor(errorName + 'getUserCount')
			defer.reject(error)
		})

		return defer.promise
	}

	return {
		getUsers: getUsers,
		getUserCount: getUserCount
	}

})
