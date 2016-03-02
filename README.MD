# CUI-IDM-B2X

## List of reference implementations for CUI IDM.

### OPTIMIZATION TARGET
The following list outlines the areas in wich this UI Framework has made concessions.  In these areas, we have created extraneous calls to the API because of the lack of efficiency within the API itself.


### Service related actions

Case No. - Reason
* 1 - We are getting a list of Services by getting packages then for each package get services associated - we want to get services directly instead.
* 2 - We're not able to look through that list of services by page / name / alphabetically / date added.
* 3 - Get related apps directly rather than having to get the packages that are children of the package that contains the app we're looking at and then having to loop through all of them to get the services of each ( also it would be handy to get information on wether the user already has grants to the package that those apps belong )
* 6 - ~~(related to #3) We're forcing a digest cycle on a fail handler because when we reach the api to see if a user has grants on a certain package it will return an error rather than an empty array.~~ No longer an issue. We are now just getting all the packages the user owns beforehand.
* 7 - We can't get a list of categories from the API so we have to loop through all the services and create our own list of categories.
* 8 - We have to make a separate call to get the owning organization details given a certain package. It would be nice to have basic info attached to the service body.

### Person related actions
CASE No. - Reason
* 4 - When submiting a personRequest we need to submit exactly 1 package request. This needs be be an array of package requests.
* 5 - We can't get password policies for a given org from the API.
