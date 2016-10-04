# Shared Service

Shared Service acts as an instantiable class that can be extended to provide information through the application using the base controller. This allows logic to be abstracted from controllers and to instead be utilized by factories.

## Using Shared Service

Many API calls are abstracted into factories, such as the `UserProfile Factory`, which will return all data needed for a profile screen using a single call (also provides standalone calls for customizability). As the profile screen is composed of different account data (user data, password data, security data), we are able to turn on an `APIError` for each specific call that fails in the factory, allowing us to only show profile screen data that doesn't fail by looking at the APIError object from the template itself.

The `UserProfile` factory will turn on this API error if the security account call fails:
	`APIError.onFor('UserProfileFactory.initSecurityQuestions')`

Which can be check on any view in the markup:
	`ng-if="!apiError.for['UserProfileFactory.initSecurityQuestions']"`

This will show allow you to only show secruty account data if there is no APIError.

The same concept can be applied to Loaders, or any other Shared Service factory allowing all logic pertaining to showing loaders, errors, or data itself to be handled by the factory and only requiring an `ng-if=""` check in the view.

## Shared Service Factories

* APIError
* Loader
