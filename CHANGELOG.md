# Changelog for the IDM B2X Accelerator


## [v1.0.8] 2016-06-28

### Changed
* cui-styleguide v2.2.2 - https://github.com/covisint/cui-styleguide/releases/tag/v2.2.2
* cui.js v2.1.6
* cui-i18n v1.0.5

### Fixed
* Fix to SharedService where the details object was being shared throughout different instances of the service
* Grunt build now copies appConfig.json file to the build folder
* Grunt copy now grabs lato fonts from node_modules

### Added
* Adds CustomAPIExtensions factory to allow adding to and overriding the CustomAPI factory
* Adds BaseExtensions factory to adding to and overriding the Base factory


## [v1.0.4] - 2016-6-20

### Changed
*  Now using cui-ng v1.9.10 - https://github.com/covisint/cui-ng/releases/tag/v1.9.10


## [v1.0.3] - 2016-6-20

### Changed
* Versions of covisint namespace packages are now locked down
* Now using cui-styleguide v2.2.0 - https://github.com/covisint/cui-styleguide/releases/tag/v2.2.0


## [v1.0.2]

### Changed
* Now using cui-i18n v1.0.4 - https://github.com/covisint/cui-i18n/releases/tag/v1.0.4
* Now using cui-ng v1.9.9 - https://github.com/covisint/cui-ng/releases/tag/v1.9.9


## [v1.0.1] - 2016-06-17

### Changed
*  All covisint npm dependencies are now set to a specific version


## [v1.0.0] - 2016-06-15

### Changed
* 2016-06-08 appConfig now requires a `languageResources` property for the cui-i18n library to properly function.

It should look something like this:
```json
"languageResources": {
    "url": "node_modules/@covisint/cui-i18n/dist/cui-i18n/angular-translate/",
    "prefix": "locale-",
    "suffix": ".json"
}
```

* All dependencies moved over to npm
* appConfig now accepts `"solutionInstancesUrl"` to set the url to get instances from
* now fires covAuthInfo to populate the instance id for unsecured calls
