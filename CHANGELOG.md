## [v1.0.12] 2016-7-22

### Changelog
* 7-22 cui-api-interceptor v1.0.5
* 7-22 cui-i18n v1.0.8
* General bug fixes and improvements
* Updates organization hierarchy screen
* Adds new template directives and helper factories


## [v1.0.11] 2016-07-18

### Changelog
* 7-18 cui-i18n v1.0.7
* 7-18 cui-ng v1.9.13


## [v1.0.10] 2016-7-12

### Changelog
* 7-12 cui.js v2.2.0


## [v1.0.9] 2016-07-01

### Changelog
* 2016-7-1 cui-stylegiude v2.3.0 - https://github.com/thirdwavellc/cui-styleguide/releases/tag/v2.3.0 
* 2016-7-1 cui-icons v1.3.0 - https://github.com/thirdwavellc/cui-icons/releases/tag/v1.3.0
* 2016-6-30 cui-ng v1.9.11 - https://github.com/thirdwavellc/cui-ng/releases/tag/v1.9.11
* Updates to keep track of a larger number of state changes for going back to previous states in the application
* Updates the organization directory user details screen


## [v1.0.8] 2016-06-28

### Changelog
* 2016-6-24 cui-styleguide v2.2.2 - https://github.com/thirdwavellc/cui-styleguide/releases/tag/v2.2.2
* 2016-6-24 cui.js v2.1.6
* 2016-6-24 cui-i18n v1.0.5
* Fix to SharedService where the details object was being shared throughout different instances of the service
* Grunt build now copies appConfig.json file to the build folder
* Grunt copy now grabs lato fonts from node_modules
* Adds CustomAPIExtensions factory to allow adding to and overriding the CustomAPI factory
* Adds BaseExtensions factory to adding to and overriding the Base factory

## [v1.0.4]

### Changelog
* 2016-6-20 cui-ng v1.9.10 - https://github.com/thirdwavellc/cui-ng/releases/tag/v1.9.10


## [v1.0.3]

### Changeset
* 2016-6-20 Versions of covisint namespace packages are now locked down
* 2016-6-20 cui-styleguide v2.2.0 - https://github.com/thirdwavellc/cui-styleguide/releases/tag/v2.2.0


## [v1.0.2]

### Changeset

* cui-i18n v1.0.4 - https://github.com/thirdwavellc/cui-i18n/releases/tag/v1.0.4
* cui-ng v1.9.9 - https://github.com/thirdwavellc/cui-ng/releases/tag/v1.9.9


## [v1.0.1]

### Changeset
* 2016-06-17 All covisint npm dependencies are now set to a specific version


## [v1.0.0]

### Changeset
* 2016-06-08 appConfig now requires a `languageResources` property for the cui-i18n library to properly function.
<br/>It should look something like this:
```json
"languageResources": {
    "url": "node_modules/@covisint/cui-i18n/dist/cui-i18n/angular-translate/",
    "prefix": "locale-",
    "suffix": ".json"
}
```

* 2016-06-15 all dependencies moved over to npm
* 2016-06-15 appConfig now accepts `"solutionInstancesUrl"` to set the url to get instances from
* 2016-06-15 now fires covAuthInfo to populate the instance id for unsecured calls
