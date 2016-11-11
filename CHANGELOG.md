# Changelog for the IDM B2X Accelerator

## Unreleased

### Changed
* cui-ng v1.10.4
* cui-styleguide v2.7.0
* cui-i18n v1.0.16
* Switch to using cui-popover in visible popovers.
* PersonRequest factory has stripped out helper API calls to instead use the CommonAPI factory.
* API call `getOrganizationPackages()` is now secured.
* Clicking on link in left menu now closes menu on desktop
* Walkup registration, extracts service logic out of the controller and moves it to the Registration.factory
* Removes deprecated organization applications files.
* My Applications screen now saves all retrieved data into the DataStorage factory upon the first load. On each subsequent load the initial data is populated from DataStorage and updated from new API calls in the background.
* Organization Profile screen now saves relevant data to DataStorage on the first load.
* Organization Hierarchy screen now saved relevant data to DataStorage on the first load.
* Change "open" to "edit" for the various sections on the user details page in admin view.
* Walkup registration inputs now show errors if they are dirty instead of touched (when the inputs have been used).
* Changed files to be bootstrapped (in the `jsWrapper`) asynchronously as the previous method was throwing deprecation warnings.
* Changed `grunt copy` tasks to work with versioned cui-i18n assets.
* Changed the `Timezones` and `Countries` factories to now work based off the `languageResources.url` path in the `appConfig.json` to work with regular/versioned/and custom cui-i18n integrations.
* Changed buttons in the user profile screen to use `cui-button` instead.
* Changes blueimp-md5 dependency path to accomodate the dist file structure of the new 2.5.0 release.

### Fixes
* Fixes popover styling.
* Fixes base.goBack() issue where it was possible to enter a loop.
* Reveal hidden chevron in header
* Goes back to using chevron icon on app request page
* 'open' text now says 'edit' on My Profile
* Remove flash of unstyled content when closing/opening fields to edit in My Profile
* Profile icons on mobile now correct size and padding
* Fixed grunt task to support Windows OS
* DataStorage.replaceDataThatMatches() now properly replaces matching data.
* DataStorage.setType() not correctly assigns data under the provided type.
* Fixes issue where opening up the mobile menu and then expanding into desktop screen size would leave all content pushed to the right.
* Fixed issue in walkup registration where we were splicing the wrong object after some changes.
* Fixes the registered date on the user profile to use the correct date.
	* Note: This is a seperate API call and if it fails, the registered date will not be shown on the profile screen.
* Fixed issue where you were able to request un-requestable service packages during the walkup registration.
* Fixed issue where selecting/deselecting packages during walkup registration could cause errors.

### Added
* New npm run commands `npm run lint:js` and `npm run lint:style` to ensure app code is in conformance for style
* New npm run commands `npm run build`, `npm run pkg` and `npm run deploy` for an abstraction of the workflow commands outside grunt.
* Added padding and border to empty app details and claims.
* Modifies the editor config to suggest HTML use 2 spaces instead of 4 for indentation.
* Added new CommonAPI factory for handling repeated API calls in other factories/throughout the project.
* Adds features for checking if a username and/or email address already exist in the instance
  during walkup registration.
* Adds updating loading spinner partial in `app/common-templates/partials/`
* Added further initial documentation of B2X features in `docs/features/`.
	* Added documentation for integrating cui-i18n/custom-cui-i18n dependencies with B2X.
	* Added documentation for utilizing the new Theme feature.
* The languageResources.url in the appConfig now allows you to put in a dynamic mustache variable for versioned i18n libraries (to be used with cui-i18n version 1.0.16 or above). Referencing the versioned i18n directory will act as a cache-busting mechanism.
	* `"url": "node_modules/@covisint/cui-i18n/dist/{{version}}/cui-i18n/angular-translate/"`
	* If you are loading in a customized cui-i18n library, you will need to add `"customDependencyName": "cui-i18n-nameOfYourProject"` to `appConfig.languageResources`.
	* With this appConfig setup B2X will always reference the current version of your cui-i18n dependency as per the package.json.
* Added password history validation via the API in the my profile password reset flow.
* Added `initRegisteredDate()` function to the UserProfilev2 factory. Given a userId, will return the user's registered date.
	* This is also returned when using `initUserProfile()`.
* Adds Theme factory that allows the setting of styles on the top level element based on the current router state.


## [v0.2.3] - 2016-09-13

### Changed
* Index.html has been broken down into smaller, more manageable files inside `app/common-templates/index/`.
* Side navigation link to the welcome screen is now hidden when a user is logged in.
* Removed commented out legacy svg code from index files.
* Moved relevant ui-views for all modules into the state provider itself.
* Removed various views/controllers throughout the project that have been deprecated to prevent confusion regarding whether code was in a "released" state or not. Any views not reachable through the UI are working in a staging environment but not in production. This code is available ahead of time for developers to begin modifying as needed.
* Switch to using cui-popover in visible popovers.
* Clicking on link in left menu now closes menu on desktop

### Fixes
* Fixes categories popover in my applications not properly closing when changing states.
* Fixes side menu lag when closing upon entering the walkup registration.
* Fixes users being able to go through the person request screens when there is an issue getting the request data. Now displays an error and automatically redirects to the user list after 5 seconds.
* Fixes styles for application details desktop.
* Fixes close icon sizing issue and color.
* Fixes active state for folder icon in app request flow.
* Reveal hidden chevron in header
* Goes back to using chevron icon on app request page
* 'open' text now says 'edit' on My Profile
* Remove flash of unstyled content when closing/opening fields to edit in My Profile
* Profile icons on mobile now correct size and padding

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
