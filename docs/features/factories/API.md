# API Factory

The API factory is your link to the cui.js library which helps you connect to Covisint RESTful APIs. 

The official documentation can be found [here](http://cuijsinfo.run.covisintrnd.com/).

## Call Definitions

Official call definitions are found [here](https://cuijs.run.covisintrnd.com/defs/iot.json).

## Initializing

API calls are loaded in the run block of the common module:

```
	if (_.isEmpty(API.cui)) {
		API.initApi()
		.then(() => {
			route()
		})
	} 
	else {
		route()
	}
```

Inside the API factory we load in the call and environment definitions:

```
	cui.api({
		retryUnsecured: true,
		envDefs: ['https://cuijs.run.covisintrnd.com/defs/env.json'],
		dataCallDefs: [
			'https://cuijs.run.covisintrnd.com/defs/auth.json',
			'app/json/idm-call-defs.json',
			CustomAPI
		]
	})
```

## Usage

### Dependency Injection

Add `API` as a dependency in your controller/service/factory to inject the API factory.

```
	angular.module('some_module')
	.controller('some_controller', function(API) {
		// controller code
	})
```

### Example Calls

Basic call

```
	API.cui.getCategories()
	.then(response => {
		scope.categories = response
	})
```

Call with url parameter

```
	API.cui.getPerson({personId: 'personId'})
	.then(response => {
		scope.user = response
	})
```

Call with query string parameters

```
	API.cui.getPersons({qs: [
		['organization.id', 'organizationId'], 
		['securityadmin', true]
	]})
	.then(response => {
		scope.adminArray = response
	})
```
