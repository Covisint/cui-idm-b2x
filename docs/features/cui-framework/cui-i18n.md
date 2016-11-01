# Cui-I18n 

## Description

This project utilizes cui-i18n for internationalization and localization.

[Official Documentation](http://cui.covisint.qa.thirdwavellc.com/cui-gitbook-0.0.1-SNAPSHOT/build/cui-i18n.html)

## Overview

After Cui-i18n is installed via `npm`, all assets will be exposed in the `node_modules/@covisint/cui-i18n/dist/` directory.

NOTE: If you are building your own customized project translations off of cui-i18n, the path to your own project will be different.

Cui-I18n currently comes with a versioned and non-versioned directory inside of it. We recommend setting up your project to use the versioned directory assets as this will prevent caching issues (users loading in assets with missing/old translations for example).

## Cui-Idm-B2x Integration

B2X has been built to easily allow you to integrate the regular or customized cui-i18n library via the `appConfig.json` file. B2X can also always dynamically reference your most up to date i18n assets to prevent any caching issues when configured to work with the versioned assets.

NOTE: Whether you use versioned or non-versioned i18n assets, you will have to update the `grunt copy task` to properly work based on what assets you will be using. This is done in the `./tasks/copy.js` file. The copy task carries over all relevant files into the `./build` directory that ends up running on the server. To test if this works properly run `grunt build` and then `grunt demo`. This will run the application from the build folder that the `grunt build` task generates.

## Configuring using appConfig.json

### Default Configuration

This is the simplest configuration that will target the unversioned assets of cui-i18n. 

If you are using your own customized cui-i18n project you will change the `url` to follow the path to your own project under the `node_modules` directory.

```
	"languageResources": {
		"url": "node_modules/@covisint/cui-i18n/dist/cui-i18n/angular-translate/",
		"prefix": "locale-",
		"suffix": ".json"
	}
```

### Versioned Configuration

Note: This requires cui-i18n v1.0.16 or higher.

If you add `{{version}}` to the url between `dist/` and `cui-i18n`, B2X will always dynamically reference the versioned assets.

Note: B2X will look for versioned assets based off of the `cui-i18n dependency version` in your `package.json`.

`dependencyType` is an optional parameter that defines whether your project is saved under `dependencies` or `devDependecies` (defaults to `dependencies`).

```
	"languageResources": {
		"url": "node_modules/@covisint/cui-i18n/dist/{{version}}/cui-i18n/angular-translate/",
		"prefix": "locale-",
		"suffix": ".json",
		"dependencyType": "devDependencies",
	}
```

### Versioned and Customized i18n App Config

If you want to target the versioned assets of your own customized i18n project you will need to add the `customDependencyName` key with the name of your project as the value. The name of your project should be the same as the dependency name in your `package.json`.

```
	"languageResources": {
		"url": "node_modules/<Name Of Your Project>/cui-i18n/dist/{{version}}/cui-i18n/angular-translate/",
		"prefix": "locale-",
	 	"suffix": ".json",
	 	"customDependencyName": "cui-i18n-nameOfYourProject",
	 	"dependencyType": "devDependencies",
	}
```

### When using i18n assets through the Cui-Idm-B2x dependency

Use this configuration when you are getting all your cui assets through the cui-idm-b2x project. In this case, your package.json will have: `"@covisint/cui-idm-b2x": "x.x.x"`.

You will have to add `dependencyOrigin` to your appConfig in this use case.

```
	"languageResources": {
     	"url": "node_modules/@covisint/cui-i18n/dist/{{version}}/cui-i18n/angular-translate/",
        "prefix": "locale-",
        "suffix": ".json",
        "dependencyOrigin": "cui-idm-b2x",
        "dependencyType": "devDependencies"
    }
```
