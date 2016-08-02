angular.module('cui.dependencies', ['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule'])
.config(($translateProvider, $injector, localStorageServiceProvider, $cuiIconProvider, $cuiI18nProvider, $paginationProvider, $compileProvider) => {
    localStorageServiceProvider.setPrefix('cui')

    if (appConfig.languages) {
        if (!appConfig.languageResources) throw new Error('You need to configure languageResources in your appConfig.json')

        $cuiI18nProvider.setLocaleCodesAndNames(appConfig.languages)
        let languageKeys = Object.keys($cuiI18nProvider.getLocaleCodesAndNames())

        const returnRegisterAvailableLanguageKeys = () => {
            // Reroute unknown language to prefered language
            let languageRegistry = {'*': languageKeys[0]}
            languageKeys.forEach(languageKey => {
                // Redirect language keys such as en_US to en
                languageRegistry[languageKey + '*'] = languageKey
            })
            return languageRegistry
        }

        $translateProvider.useLoader('LocaleLoader', appConfig.languageResources )
        .registerAvailableLanguageKeys(languageKeys, returnRegisterAvailableLanguageKeys())
        .uniformLanguageTag('java')
        .determinePreferredLanguage()
        .fallbackLanguage(languageKeys)

        $cuiI18nProvider.setLocalePreference(languageKeys)
    }

    if (appConfig.iconSets) {
        appConfig.iconSets.forEach(iconSet => {
            $cuiIconProvider.iconSet(iconSet.name, iconSet.path, iconSet.defaultViewBox || null)
        })
    }

    // Pagination Results Per Page Options
    if (appConfig.paginationOptions) {
        $paginationProvider.setPaginationOptions(appConfig.paginationOptions)
    } else {
        throw new Error(`You don't have paginationOptions set in your appConfig.json`)
    }

    $compileProvider.debugInfoEnabled(false)
})
.run(($cuiI18n, $cuiIcon, $http, $templateCache, LocaleService) => {
    const languageNameObject = $cuiI18n.getLocaleCodesAndNames()

    for (var LanguageKey in languageNameObject) {
        LocaleService.setLocales(LanguageKey, languageNameObject[LanguageKey]);
    }

    angular.forEach($cuiIcon.getIconSets(), (iconSettings, namespace) => {
        $http.get(iconSettings.path, {
            cache: $templateCache
        })
    })
})