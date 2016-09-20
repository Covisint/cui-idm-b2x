# Changelog for the IDM B2X Accelerator

## Unreleased

### Changed
* cui-ng [1.9.20] - https://github.com/thirdwavellc/cui-ng/blob/master/CHANGELOG.md
* cui-styleguide v2.5.3 - https://github.com/thirdwavellc/cui-styleguide/blob/master/CHANGELOG.md
* Switch to using cui-popover in visible popovers.
* PersonRequest factory has stripped out helper API calls to instead use the CommonAPI factory.

### Fixes
* Fixes popover styling.
* Fixes base.goBack() issue where it was possible to enter a loop.

### Added
* Added padding and border to empty app details and claims.
* Added new CommonAPI factory for handling repeated API calls in other factories/throughout the project.


## [v0.2.3] - 2016-09-13

### Changed
* Index.html has been broken down into smaller, more manageable files inside `app/common-templates/index/`.
* Side navigation link to the welcome screen is now hidden when a user is logged in.
* Removed commented out legacy svg code from index files.
* Moved relevant ui-views for all modules into the state provider itself.
* Removed various views/controllers throughout the project that have been deprecated to prevent confusion regarding whether code was in a "released" state or not. Any views not reachable through the UI are working in a staging environment but not in production. This code is available ahead of time for developers to begin modifying as needed.

### Fixes
* Fixes categories popover in my applications not properly closing when changing states.
* Fixes side menu lag when closing upon entering the walkup registration.
* Fixes users being able to go through the person request screens when there is an issue getting the request data. Now displays an error and automatically redirects to the user list after 5 seconds.
* Fixes styles for application details desktop.
* Fixes close icon sizing issue and color.
* Fixes active state for folder icon in app request flow.

### Added
* Added sorting carets to the cui-table directive.
* Added `cui-table` directive.


## [v0.2.2] - 2016-09-12

### Changed
* cui-styleguide v2.5.1 - https://github.com/thirdwavellc/cui-styleguide/blob/master/CHANGELOG.md
* Logout redirect can now be customized in the appConfig with the 'logoutUrl' key
* User list and user details screens will now show the user's gravatar if available
* Configuration files are now prettified
* Removes left menu from registration screens
* Added padding to registration links and to terms and conditions

### Fixes
* Fixes styling of application selection list in the walkup registration
* Only creates a package request during the walkup registration if packages were actually selected
* Fixes tiny icons on left mobile menu

### Added
* Adds disable-animate directive to disable ng-animate on an element


## [v1.0.8] - 2016-06-28

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
