# CUI Framework Menu System

The menu system for the framework is a critical component and can be customized in many ways.  While doing menu customization, keep in mind that the menu is built to support features for both Mobile and Desktop user experiences.

1) Show or hide the menu on a page by page basis
Sometimes you may want to have the menu completely hidden for either Desktop or Mobile users based on the scenario.  For example, in a registration screen that is a step-wise process, you may want to completely remove the navigation and let the wizard navigation drive the user experience.

In order to configure the appearance of the navigation per page, you can add the following attributes to your module's state definitions.  In the example below, the menu will be hidden from both Desktop and Mobile users on the "registration" state.

```javascript
$stateProvider
.state('registration', {
    url: '/register',
    templateUrl: templateBase + 'registration.html',
    menu:{
      desktop:false,
      mobile:false
    }
})
```
