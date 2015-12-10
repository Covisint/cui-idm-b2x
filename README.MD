# CUI-CCA-B2X

# Standard index.html

This shows a standard index.html implementation containing a side navigation with "Search Users" and "User Invitations".
Notice each navigation item has a desktop and snap menu component. 

```html
<body ng-cloak>
	<div class="cui-wrapper">
    	<snap-drawer>
      		<span class="snap-menu--option" ui-sref="users.search">Search Users</span>
      		<span class="snap-menu--option" ui-sref="users.invitations">User Invitations</span>
    	</snap-drawer>
    	<snap-content snap-opt-disable="'right'">
      		<header class="cui-header">
        		<div class="cui-header__top">
          			<div class="menu-toggle" snap-toggle="left" ng-click="base.toggleDesktopMenu()" ng-class="base.desktopMenu ? 'active' : ''" style="margin-right:20px">
            			<div class="menu-toggle--button"></div>
          			</div>
        		</div>
      		</header>
      		<div class="desktop-menu" ng-class="base.desktopMenu ? '' : 'desktop-menu--collapse'">
        		<span class="desktop-menu--option" ui-sref="users.search">Search Users</span>
        		<span class="desktop-menu--option" ui-sref="users.invitations">User Invitations</span>
      		</div>
      		<div class="cui-nav__content-wrapper" ng-class="base.desktopMenu ? '' : 'desktop-menu--collapse'">
        		<div ui-view></div>
      		</div>
    	</snap-content>
  	</div>
</body>
```

# Form Steps Example

This showcases an example of a "Profile Management" form with multiple form steps. Each step contains an include that links to the form of that particular step. The include must contain an absolute path to the file.

```html
<div class="cui-tile">
  <div class="cui-tile__title">Profile Management</div>
    <div class="cui-tile__body">
      <cui-wizard class="cui-wizard" step="1" clickable-indicators minimum-padding="30">
       <indicator-container class="indicator-container"></indicator-container>
        <step title="Edit profile" state="profileMangement">
          <div ng-include src="'assets/angular-templates/profile-steps/profile.edit.html'"></div>
      	</step>
      	<step title="Settings" state="profileSettings">
          <div ng-include src="'assets/angular-templates/profile-steps/profile.settings.html'"></div>
      	</step>
    </cui-wizard>
  </div>
</div>
```
# Form Example

```html
<form name="user" novalidate>
	<!-- First Name -->   
	<div class="cui-wizard__field-row">     
		<div class="cui-wizard__field-container cui-wizard__field-container--half">
      		<label for="user-name-given">{{'cui-first-name' | translate}}</label> 
        	<!--    This adds error messages to the firstName input field. Notice the naming convention
        	ng-messages="<formName><inputName>.$error" -->
        	<div class="cui-error" ng-messages="user.firstName.$error" ng-if="user.firstName.$touched">
        		<div ng-messages-include="assets/angular-templates/messages.html"></div>
        	</div>
        	<input type="text" name="firstName" class="cui-input" ng-required="true" ng-model="profile.user.name.given"></input>
    	</div>
    	<!-- Last Name -->
    	<div class="cui-wizard__field-container cui-wizard__field-container--half">
    		<label for="user-name-surname">{{'cui-last-name' | translate}}</label>
      		<div class="cui-error" ng-messages="user.lastName.$error" ng-if="user.lastName.$touched">
        		<div ng-messages-include="assets/angular-templates/messages.html"></div>
      		</div>
    		<input type="text" ng-model="profile.user.name.surname" name="lastName" class="cui-input" ng-required="true"></input>
    	</div>
  	</div>
</form>
```

# Translations

In this example 'cui-last-name' will translate 'Last Name' to the currently selected language.

```html
<div class="cui-wizard__field-container cui-wizard__field-container--half">
	<label for="user-name-surname">{{'cui-last-name' | translate}}</label>
    <div class="cui-error" ng-messages="user.lastName.$error" ng-if="user.lastName.$touched">
   		<div ng-messages-include="assets/angular-templates/messages.html"></div>
    </div>
    <input type="text" ng-model="profile.user.name.surname" name="lastName" class="cui-input" ng-required="true"></input>
</div>
```