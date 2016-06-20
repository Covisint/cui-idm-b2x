# UNRELEASED

## V1.0.0

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
