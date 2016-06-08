# UNRELEASED

## V1.0.0

* 2016-06-08 appConfig now requires a `languageResources` property for the cui-i18n library to properly function.
<br/>It should look something like this:
```json
"languageResources": {
    "url": "bower_components/cui-i18n/dist/cui-i18n/angular-translate/",
    "prefix": "locale-",
    "suffix": ".json"
}
```