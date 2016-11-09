# API Factory

## Descrption

The API factory is your link to the cui.js library which helps you connect to Covisint RESTful APIs. 

The official documentation can be found [here](http://cuijsinfo.run.covisintrnd.com/).

## Initializing

API calls are loaded in the run block of the common module:

```js
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

```js
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

```js
	angular.module('some_module')
	.controller('some_controller', function(API) {
		// controller code
	})
```

### Example Calls

Basic call:

```js
	API.cui.getCategories()
	.then(response => {
		scope.categories = response
	})
```

Call with url parameter:

```js
	API.cui.getPerson({personId: 'personId'})
	.then(response => {
		scope.user = response
	})
```

Call with query string parameters:

```js
	API.cui.getPersons({qs: [
		['organization.id', 'organizationId'], 
		['securityadmin', true]
	]})
	.then(response => {
		scope.adminArray = response
	})
```

### Customization

Call definitions can be manually appended in the `dataCallDefs` array in the API factory. Call definitions can be a `json` file or even a custom factory.

B2X comes with the `CustomAPI.js` factory which loads in our own custom calls.
