# Theme Factory

## Description

The Theme factory allows you to set styles on the top level element based on the current router state.

## Set State Theme

Go to the `module.js` file that contains the state you want to set a custom theme for. 

For the following example we are setting a custom theme for the `My Applications` state inside of `app/modules/applications/applications.module.js`. We add an `onEnter` callBack to the desired state and in this case we pass the scss class that contains our theme styles using `Theme.set()`

```
	.state('applications.myApplications', {
		url: '?name&page&pageSize&category&sort&refine',
		templateUrl: templateBase + 'myApplications/myApplications.html',
		controller: returnCtrlAs('myApplications'),
		access: loginRequired,
		onEnter: (Theme) => {
			Theme.set('class-with-theme-styling')
		}
	})
```

## On State Change Customization

The `app/modules/common/common.module.js` contains various project configurations. This is where you can customize Theme behavior that occurs on a state change (This is in the `$rootScope.$on('$stateChangeStart')` block).

You can clear the current active theme, change the theme back to a default theme that you set, or load in other themes as you wish.

Check out the Theme factory inside of `app/modules/common/factories/` to see what it currently supports, or to customize it for your own needs.

## Top Level Element

The top level element can be found and customized in `app/common-templates/index/content.html`:

```
	<snap-content snap-opt-disable="'right'" ng-class="base.theme.get()">
```

We currently utilize `snap.js` for our menus. Check out the documentation on this in `docs/features/menu-system.md`.
