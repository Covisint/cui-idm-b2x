'use strict';(function(angular,$){
$.get('./appConfig.json',function(configData){
var appConfig=configData;


angular.module('user',[]).
config(['$stateProvider',function($stateProvider){

var templateBase='assets/modules/user/';

var returnCtrlAs=function returnCtrlAs(name,asPrefix){
return name+'Ctrl as '+(asPrefix?asPrefix:'')+(asPrefix?name[0].toUpperCase()+name.slice(1,name.length):name);};


$stateProvider.
state('user',{
url:'/user',
templateUrl:templateBase+'user.html'}).

state('user.profile',{
url:'/profile',
templateUrl:templateBase+'profile/user-profile.html',
controller:returnCtrlAs('userProfile')});}]);





angular.module('user').
controller('userProfileCtrl',['$scope','$timeout','API','$cuiI18n','Timezones','UserService',
function($scope,$timeout,API,$cuiI18n,Timezones,UserService){
'use strict';
var userProfile=this;

userProfile.loading=true;
userProfile.saving=true;
userProfile.fail=false;
userProfile.success=false;
userProfile.timezoneById=Timezones.timezoneById;
userProfile.toggleOffFunctions={};
UserService.injectUI(userProfile,$scope);

// ON LOAD START ---------------------------------------------------------------------------------

UserService.getProfile({personId:API.getUser(),useCuid:true}).then(function(res){
angular.merge(userProfile,res);
userProfile.loading=false;},
function(err){
userProfile.loading=false;});}]);




angular.module('registration',[]).
config(['$stateProvider',function($stateProvider){

var templateBase='assets/modules/registration/';

var returnCtrlAs=function returnCtrlAs(name,asPrefix){
return name+'Ctrl as '+(asPrefix?asPrefix:'')+(asPrefix?name[0].toUpperCase()+name.slice(1,name.length):name);};


$stateProvider.
state('registration',{
url:'/register',
templateUrl:templateBase+'registration.html'}).

state('registration.invited',{
url:'/invitation?id&code',
templateUrl:templateBase+'userInvited/userInvited.html',
controller:returnCtrlAs('usersRegister')}).

state('registration.walkup',{
url:'/walkup',
templateUrl:templateBase+'userWalkup/userWalkup.html',
controller:returnCtrlAs('userWalkup')}).

state('registration.tlo',{
url:'/top-level-org',
templateUrl:templateBase+'newTopLevelOrg/newTLO.html',
controller:returnCtrlAs('tlo','new')}).

state('registration.division',{
url:'/new-division',
templateUrl:templateBase+'newDivision/newDivision.html',
controller:returnCtrlAs('division','new')});}]);





angular.module('registration').
controller('divisionCtrl',['$scope','API',function($scope,API){
var newDivision=this;
newDivision.userLogin={};
newDivision.orgSearch={};

newDivision.passwordPolicies=[ // WORKAROUND CASE #5
{
'allowUpperChars':true,
'allowLowerChars':true,
'allowNumChars':true,
'allowSpecialChars':true,
'requiredNumberOfCharClasses':3},

{
'disallowedChars':'^&*)(#$'},

{
'min':8,
'max':18},

{
'disallowedWords':['password','admin']}];



API.cui.getSecurityQuestions().
then(function(res){
// Removes first question as it is blank
res.splice(0,1);

// Splits questions to use between both dropdowns
var numberOfQuestions=res.length,
numberOfQuestionsFloor=Math.floor(numberOfQuestions/2);

newDivision.userLogin.challengeQuestions1=res.slice(0,numberOfQuestionsFloor);
newDivision.userLogin.challengeQuestions2=res.slice(numberOfQuestionsFloor);

// Preload question into input
newDivision.userLogin.question1=newDivision.userLogin.challengeQuestions1[0];
newDivision.userLogin.question2=newDivision.userLogin.challengeQuestions2[0];
return API.cui.getOrganizations();}).

then(function(res){
newDivision.organizationList=res;
$scope.$digest();}).

fail(function(err){
console.log(err);});


var searchOrganizations=function searchOrganizations(){
// this if statement stops the search from executing
// when the controller first fires  and the search object is undefined/
// once pagination is impletemented this won't be needed
if(newDivision.orgSearch){
API.cui.getOrganizations({'qs':[['name',newDivision.orgSearch.name]]}).
then(function(res){
newDivision.organizationList=res;
$scope.$apply();}).

fail(function(err){
console.log(err);});}};




$scope.$watchCollection('newDivision.orgSearch',searchOrganizations);}]);




angular.module('registration').
controller('tloCtrl',['$scope','API',function($scope,API){
var newTLO=this;
newTLO.userLogin={};

var handleError=function handleError(err){
console.log('Error\n',err);};


newTLO.passwordPolicies=[ // WORKAROUND CASE #5
{
'allowUpperChars':true,
'allowLowerChars':true,
'allowNumChars':true,
'allowSpecialChars':true,
'requiredNumberOfCharClasses':3},

{
'disallowedChars':'^&*)(#$'},

{
'min':8,
'max':18},

{
'disallowedWords':['password','admin']}];




API.cui.getSecurityQuestions().
then(function(res){
// Removes first question as it is blank
res.splice(0,1);

// Splits questions to use between both dropdowns
var numberOfQuestions=res.length,
numberOfQuestionsFloor=Math.floor(numberOfQuestions/2);

newTLO.userLogin.challengeQuestions1=res.slice(0,numberOfQuestionsFloor);
newTLO.userLogin.challengeQuestions2=res.slice(numberOfQuestionsFloor);

// Preload question into input
newTLO.userLogin.question1=newTLO.userLogin.challengeQuestions1[0];
newTLO.userLogin.question2=newTLO.userLogin.challengeQuestions2[0];}).

fail(handleError);}]);




angular.module('registration').
controller('usersRegisterCtrl',['localStorageService','$scope','Person','$stateParams','API','$state','CuiPasswordPolicies',
function(localStorageService,$scope,Person,$stateParams,API,$state,CuiPasswordPolicies){
'use strict';
var usersRegister=this;

usersRegister.loading=true;
usersRegister.registrationError=false;
usersRegister.showCovisintInfo=false;
usersRegister.submitting=false;
usersRegister.userLogin={};
usersRegister.applications={};
usersRegister.targetOrganization={};
usersRegister.applications.numberOfSelected=0;

// HELPER FUNCTIONS START ------------------------------------------------------------------------

var getUser=function getUser(id){
return API.cui.getPerson({personId:id});};


var getOrganization=function getOrganization(id){
return API.cui.getOrganization({organizationId:id});};


var build={
// Collection of helper functions to build necessaru calls on this controller
user:function user(){
usersRegister.user.addresses[0].country=usersRegister.userCountry.title;
usersRegister.user.organization={id:usersRegister.targetOrganization.id,
realm:usersRegister.targetOrganization.realm,
type:'organization'};
usersRegister.user.timezone='EST5EDT';
if(usersRegister.user.phones[0]){usersRegister.user.phones[0].type='main';};
// Get the current selected language
usersRegister.user.language=$scope.$parent.base.getLanguageCode();
return usersRegister.user;},

personPassword:function personPassword(user,org){
return {
personId:user.id,
data:{
id:user.id,
version:'1',
username:usersRegister.userLogin.username,
password:usersRegister.userLogin.password,
passwordPolicy:org.passwordPolicy,
authenticationPolicy:org.authenticationPolicy}};},



userSecurityQuestions:function userSecurityQuestions(user){
return [
{
question:{
id:usersRegister.userLogin.question1.id,
type:'question',
realm:user.realm},

answer:usersRegister.userLogin.challengeAnswer1,
index:1},

{
question:{
id:usersRegister.userLogin.question2.id,
type:'question',
realm:user.realm},

answer:usersRegister.userLogin.challengeAnswer2,
index:2}];},



userSecurityQuestionAccount:function userSecurityQuestionAccount(user){
return {
personId:user.id,
data:{
version:'1',
id:user.id,
questions:this.userSecurityQuestions(user)}};},



packagesSelected:function packagesSelected(){
var packages=[];
angular.forEach(usersRegister.applications.selected,function(servicePackage){
packages.push({packageId:servicePackage.split(',')[0]});});

return packages;},

packageRequest:function packageRequest(packageId){
return {
data:{
requestor:{
id:usersRegister.user.id,
type:'person'},

servicePackage:{
id:packageId.packageId,
type:'servicePackage'},

reason:'Invited User Registration'}};}};





// HELPER FUNCTIONS END --------------------------------------------------------------------------

// ON LOAD START ---------------------------------------------------------------------------------

if(!$stateParams.id||!$stateParams.code){
console.log('Invited user reg requires 2 url params: id (invitationId) and code (invitatioCode)');
// TODO : ADD MESSAGE IF USER HAS TAMPERED WITH THE URL
}else 
{
API.cui.getPersonInvitation({invitationId:$stateParams.id}).
then(function(res){
if(res.invitationCode!==$stateParams.code){
// TODO : ADD MESSAGE IF USER HAS TAMPERED WITH THE
console.log('Wrong invitation code.');
return;}

return getUser(res.invitee.id);}).

then(function(res){
usersRegister.invitedUser=res;
usersRegister.user=res;
usersRegister.user.addresses=[]; // We need to initialize these arrays so ng-model treats them as arrays
usersRegister.user.addresses[0]={streets:[]}; // rather than objects
usersRegister.user.phones=[];
return getOrganization(res.organization.id);}).

then(function(res){
usersRegister.targetOrganization=res;
return API.cui.getSecurityQuestions(); // Load security questions for login form
}).
then(function(res){
res.splice(0,1); // Removes first question as it is blank

// Splits questions to use between both dropdowns
var numberOfQuestions=res.length,
numberOfQuestionsFloor=Math.floor(numberOfQuestions/2);
usersRegister.userLogin.challengeQuestions1=res.slice(0,numberOfQuestionsFloor);
usersRegister.userLogin.challengeQuestions2=res.slice(numberOfQuestionsFloor);

// Preload question into input
usersRegister.userLogin.question1=usersRegister.userLogin.challengeQuestions1[0];
usersRegister.userLogin.question2=usersRegister.userLogin.challengeQuestions2[0];}).

then(function(){
// Populate Applications List
return API.cui.getOrganizationPackages({'organizationId':usersRegister.targetOrganization.id});}).

then(function(res){
var listOfApps=[];

res.forEach(function(packageGrant){
var i=0;
API.cui.getPackageServices({'packageId':packageGrant.servicePackage.id}).
then(function(res){
i++;

res.forEach(function(service){
service.packageId=packageGrant.servicePackage.id;
listOfApps.push(service);});


if(i===res.length){
usersRegister.applications.list=listOfApps;
API.cui.getPasswordPolicy({policyId:usersRegister.targetOrganization.passwordPolicy.id}).
then(function(res){
CuiPasswordPolicies.set(res.rules);
$scope.$digest();});}});});}).





fail(function(err){
console.log(err);});}



// ON LOAD END -----------------------------------------------------------------------------------

// ON CLICK START --------------------------------------------------------------------------------

usersRegister.applications.updateNumberOfSelected=function(a){
// Update the number of selected apps everytime on of the boxes is checked/unchecked
if(a!==null){usersRegister.applications.numberOfSelected++;}else 
{usersRegister.applications.numberOfSelected--;}};


usersRegister.applications.process=function(){
// Process the selected apps when you click next after selecting the apps you need
if(usersRegister.applications.processedSelected){
var oldSelected=usersRegister.applications.processedSelected;}

usersRegister.applications.processedSelected=[];

angular.forEach(usersRegister.applications.selected,function(app,i){
if(app!==null){
usersRegister.applications.processedSelected.push({
packageId:app.split(',')[0],
name:app.split(',')[1],
acceptedTos:oldSelected&&oldSelected[i]?oldSelected[i].acceptedTos:false});}});



return usersRegister.applications.processedSelected.length;};


usersRegister.applications.searchApplications=function(){
// Search apps by name
API.cui.getPackages({'qs':[['name',usersRegister.applications.search]]}).
then(function(res){
usersRegister.applications.list=res;
$scope.$digest();}).

fail(function(err){
console.log(err);});};



usersRegister.applications.toggleCovisintInfo=function(){
usersRegister.showCovisintInfo=!usersRegister.showCovisintInfo;};


usersRegister.submit=function(){
usersRegister.submitting=true;
var user;

API.cui.updatePerson({personId:usersRegister.invitedUser.id,data:build.user()}).
then(function(res){
user=res;
return API.cui.createPersonPassword(build.personPassword(user,usersRegister.targetOrganization));}).

then(function(){
// Create Security Account
return API.cui.createSecurityQuestionAccount(build.userSecurityQuestionAccount(user));}).

then(function(){
// Activate Person
return API.cui.activatePerson({qs:[['personId',user.id]]});}).

then(function(){
// Get Selected Packages
return build.packagesSelected();}).

then(function(res){
// Create Package Requests
if(res.length===0){
// No Packages Selected
return;}

angular.forEach(res,function(servicePackage){
var i=0;
API.cui.createPackageRequest(build.packageRequest(servicePackage)).
then(function(res){
i++;
if(i===res.length){
usersRegister.submitting=false;
usersRegister.success=true;
console.log('User Created');
$state.go('misc.success');}}).


fail(function(err){
console.log(err);});});}).



fail(function(err){
console.log(err);});};



// ON CLICK END ----------------------------------------------------------------------------------
}]);



angular.module('registration').
controller('userWalkupCtrl',['localStorageService','$scope','$stateParams','API','LocaleService','$state','CuiPasswordPolicies',
function(localStorageService,$scope,$stateParams,API,LocaleService,$state,CuiPasswordPolicies){
'use strict';

var userWalkup=this;

userWalkup.userLogin={};
userWalkup.applications={};
userWalkup.errorMessage='';
userWalkup.registering=false;
userWalkup.userNameExistsError=false;
userWalkup.orgLoading=true;
userWalkup.applications.numberOfSelected=0;
userWalkup.orgPaginationCurrentPage=1;

// HELPER FUNCTIONS START ------------------------------------------------------------------------

function handleError(err){
console.log('Error!\n');
console.log(err);
userWalkup.orgLoading=false;
$scope.$digest();}


var searchOrganizations=function searchOrganizations(newOrgToSearch){
if(newOrgToSearch){
API.cui.getOrganizations({'qs':[['name',newOrgToSearch.name]]}).
then(function(res){
userWalkup.organizationList=res;
$scope.$digest();}).

fail(handleError);}};



// collection of helper functions to build necessary calls on this controller
var build={
personRequest:function personRequest(user){
return {
data:{
id:user.id,
registrant:{
id:user.id,
type:'person',
realm:user.realm},

justification:'User walkup registration',
servicePackageRequest:this.packageRequests()}};},



packageRequests:function packageRequests(){
var packages=[];
angular.forEach(userWalkup.applications.selected,function(servicePackage){
// userWalkup.applications.selected is an array of strings that looks like
// ['<appId>,<appName>','<app2Id>,<app2Name>',etc]
packages.push({packageId:servicePackage.split(',')[0]});});

return packages;},

personPassword:function personPassword(){
return {
version:'1',
username:userWalkup.userLogin.username,
password:userWalkup.userLogin.password,
passwordPolicy:userWalkup.organization.passwordPolicy,
authenticationPolicy:userWalkup.organization.authenticationPolicy};},


userSecurityQuestionAccount:function userSecurityQuestionAccount(){
return {
version:'1',
questions:this.userSecurityQuestions()};},


user:function user(){
// Get title of selected country object
userWalkup.user.addresses[0].country=userWalkup.userCountry.title;
userWalkup.user.organization={id:userWalkup.organization.id};
userWalkup.user.timezone='EST5EDT';
if(userWalkup.user.phones[0])userWalkup.user.phones[0].type='main';
// Get current used language
userWalkup.user.language=$scope.$parent.base.getLanguageCode();
return userWalkup.user;},

userSecurityQuestions:function userSecurityQuestions(){
return [
{
question:{
id:userWalkup.userLogin.question1.id,
type:'question',
realm:userWalkup.organization.realm},

answer:userWalkup.userLogin.challengeAnswer1,
index:1},

{
question:{
id:userWalkup.userLogin.question2.id,
type:'question',
realm:userWalkup.organization.realm},

answer:userWalkup.userLogin.challengeAnswer2,
index:2}];},



submitData:function submitData(){
var submitData={};
submitData.person=this.user();
submitData.passwordAccount=this.personPassword();
submitData.securityQuestionAccount=this.userSecurityQuestionAccount();
return submitData;}};



// HELPER FUNCTIONS END --------------------------------------------------------------------------

// ON LOAD START ---------------------------------------------------------------------------------

if(!localStorageService.get('userWalkup.user')){
// If it's not in the localstorage already
// We need to initialize these arrays so ng-model treats them as arrays
// Rather than objects
userWalkup.user={addresses:[]};
userWalkup.user.addresses[0]={streets:[]};
userWalkup.user.phones=[];}else 

userWalkup.user=localStorageService.get('userWalkup.user');

// Get all security questions
API.cui.getSecurityQuestions().
then(function(res){
res.splice(0,1);
// Splits questions to use between both dropdowns
var numberOfQuestions=res.length,
numberOfQuestionsFloor=Math.floor(numberOfQuestions/2);
userWalkup.userLogin.challengeQuestions1=res.slice(0,numberOfQuestionsFloor);
userWalkup.userLogin.challengeQuestions2=res.slice(numberOfQuestionsFloor);

// Preload question into input
userWalkup.userLogin.question1=userWalkup.userLogin.challengeQuestions1[0];
userWalkup.userLogin.question2=userWalkup.userLogin.challengeQuestions2[0];
return API.cui.getOrganizations({'qs':[['pageSize',userWalkup.orgPaginationSize],['page',1]]});}).

then(function(res){
// Populate organization list
userWalkup.organizationList=res;
return API.cui.countOrganizations();}).

then(function(res){
userWalkup.organizationCount=res;
userWalkup.orgLoading=false;
$scope.$digest();}).

fail(handleError);

// ON LOAD END -----------------------------------------------------------------------------------

// ON CLICK START --------------------------------------------------------------------------------

userWalkup.applications.updateNumberOfSelected=function(checkboxValue){
// Update the number of selected apps everytime on of the boxes is checked/unchecked
if(checkboxValue!==null)userWalkup.applications.numberOfSelected++;else 
userWalkup.applications.numberOfSelected--;};


userWalkup.applications.process=function(){
// Process the selected apps when you click next after selecting the apps you need
// returns number of apps selected
if(userWalkup.applications.processedSelected){
var oldSelected=userWalkup.applications.processedSelected;}

userWalkup.applications.processedSelected=[];
angular.forEach(userWalkup.applications.selected,function(app,i){
if(app!==null){
userWalkup.applications.processedSelected.push({
id:app.split(',')[0],
name:app.split(',')[1],
// this fixes an issue
// where removing an app from the selected list that the user had accepted the terms for
// would carry over that acceptance to the next app on the list
acceptedTos:oldSelected&&oldSelected[i]?oldSelected[i].acceptedTos:false});}});



return userWalkup.applications.processedSelected.length;};


userWalkup.applications.searchApplications=function(){
// Search apps by name
API.cui.getPackages({'qs':[['name',userWalkup.applications.search],['owningOrganization.id',userWalkup.organization.id]]}).
then(function(res){
userWalkup.applications.list=res;
$scope.$apply();}).

fail(handleError);};


userWalkup.submit=function(){
userWalkup.submitting=true;
userWalkup.registrationError=false;
var user=build.submitData();

API.cui.registerPerson({data:user}).
then(function(res){
if(userWalkup.applications.selected){
return API.cui.createPersonRequest(build.personRequest(res.person));}else 

{
return;}}).


then(function(res){
userWalkup.submitting=false;
userWalkup.success=true;
$state.go('misc.success');}).

fail(function(err){
if(err.responseJSON.apiMessage==='Username already exists'){
userWalkup.registrationError=true;
userWalkup.errorMessage='cui-error-username-exists';}

userWalkup.success=false;
userWalkup.submitting=false;
$scope.$digest();});};



userWalkup.orgPaginationPageHandler=function orgPaginationHandler(page){
API.cui.getOrganizations({'qs':[['pageSize',userWalkup.orgPaginationSize],['page',page]]}).
then(function(res){
userWalkup.organizationList=res;
userWalkup.orgPaginationCurrentPage=page;}).

fail(handleError);};


// ON CLICK END ----------------------------------------------------------------------------------

// WATCHERS START --------------------------------------------------------------------------------

$scope.$watch('userWalkup.user',function(a){
if(a&&Object.keys(a).length!==0)localStorageService.set('userWalkup.user',a);},
true);

$scope.$watchCollection('userWalkup.orgSearch',searchOrganizations);

// Populate Applications List based on the current organization
$scope.$watch('userWalkup.organization',function(newOrgSelected){
if(newOrgSelected){
// If the organization selected changes reset all the apps
userWalkup.applications.numberOfSelected=0; // Restart applications count
userWalkup.applications.processedSelected=undefined; // Restart applications selected

API.cui.getOrganizationPackages({organizationId:newOrgSelected.id}).
then(function(grants){
userWalkup.applications.list=[];
if(grants.length===0){
userWalkup.applications.list=undefined;
$scope.$digest();}

var i=0;
grants.forEach(function(grant){
API.cui.getPackageServices({'packageId':grant.servicePackage.id}).
then(function(res){
userWalkup.applications.list.push(res[0]);
i++;
if(i===grants.length){
$scope.$digest();}});});



return API.cui.getPasswordPolicy({policyId:newOrgSelected.passwordPolicy.id});}).

then(function(res){
CuiPasswordPolicies.set(res.rules);
$scope.$digest();}).

fail(handleError);}});



$scope.$watch('userWalkup.orgPaginationSize',function(newValue){
if(newValue){
API.cui.getOrganizations({'qs':[['pageSize',userWalkup.orgPaginationSize],['page',1]]}).
then(function(res){
userWalkup.organizationList=res;
userWalkup.orgPaginationCurrentPage=1;}).

fail(handleError);}});



// WATCHERS END ----------------------------------------------------------------------------------
}]);



angular.module('organization',[]).
config(['$stateProvider',function($stateProvider){

var templateBase='assets/modules/organization/';

var returnCtrlAs=function returnCtrlAs(name,asPrefix){
return name+'Ctrl as '+(asPrefix?asPrefix:'')+(asPrefix?name[0].toUpperCase()+name.slice(1,name.length):name);};


$stateProvider.
state('organization',{
url:'/organization',
templateUrl:templateBase+'organization.html'}).

state('organization.profile',{
url:'/profile?id',
templateUrl:templateBase+'profile/organization-profile.html',
controller:returnCtrlAs('orgProfile')}).

state('organization.directory',{
url:'/directory?id',
templateUrl:templateBase+'directory/organization-directory.html',
controller:returnCtrlAs('orgDirectory')}).

state('organization.hierarchy',{
url:'/hierarchy?id',
templateUrl:templateBase+'hierarchy/organization-hierarchy.html',
controller:returnCtrlAs('orgHierarchy')}).

state('organization.roles',{
url:'/roles',
templateUrl:templateBase+'roles/organization-roles.html',
controller:returnCtrlAs('orgRoles')}).

state('directory',{
url:'/organization/directory',
templateUrl:templateBase+'directory/directory.html'}).

state('directory.userDetails',{
url:'/user-details?id',
templateUrl:templateBase+'directory/user-details/directory-userDetails.html',
controller:returnCtrlAs('userDetails')});}]);





angular.module('organization').
controller('orgDirectoryCtrl',['$scope','$stateParams','API','$filter','Sort',
function($scope,$stateParams,API,$filter,Sort){
'use strict';

var orgDirectory=this;
var organizationId=$stateParams.id;

orgDirectory.loading=true;
orgDirectory.sortFlag=false;
orgDirectory.userList=[];
orgDirectory.unparsedUserList=[];
orgDirectory.statusList=['active','locked','pending','suspended','rejected','removed'];
orgDirectory.statusCount=[0,0,0,0,0,0,0];

// HELPER FUNCTIONS START ------------------------------------------------------------------------

var handleError=function handleError(err){
orgDirectory.loading=false;
$scope.$digest();
console.log('Error',err);};


var getStatusList=function getStatusList(users){
var statusList=[];
var statusCount=[orgDirectory.unparsedUserList.length];

users.forEach(function(user){
if(user.status){
var statusInStatusList=_.some(statusList,function(status,i){
if(angular.equals(status,user.status)){
statusCount[i+1]?statusCount[i+1]++:statusCount[i+1]=1;
return true;}

return false;});


if(!statusInStatusList){
statusList.push(user.status);
statusCount[statusList.length]=1;}}});



orgDirectory.statusCount=statusCount;
return statusList;};


var onLoadFinish=function onLoadFinish(organizationResponse){
orgDirectory.organization=organizationResponse;
API.cui.getOrganizations().
then(function(res){
orgDirectory.organizationList=res;
return API.cui.getPersons({'qs':[['organization.id',orgDirectory.organization.id]]});}).

then(function(res){
orgDirectory.userList=res;
orgDirectory.unparsedUserList=res;
orgDirectory.statusList=getStatusList(orgDirectory.userList);
orgDirectory.loading=false;
// $scope.$digest();
}).
fail(handleError);};


// HELPER FUNCTIONS END --------------------------------------------------------------------------

// ON LOAD START ---------------------------------------------------------------------------------

if(!organizationId){
// If no id parameter is passed load directory of logged in user's organization.
API.cui.getPerson({personId:API.getUser(),useCuid:true}).
then(function(person){
return API.cui.getOrganization({organizationId:person.organization.id});}).

then(function(res){
onLoadFinish(res);}).

fail(handleError);}else 

{
// Load organization directory of id parameter
API.cui.getOrganization({organizationId:organizationId}).
then(function(res){
onLoadFinish(res);}).

fail(handleError);}


// ON LOAD END -----------------------------------------------------------------------------------

// ON CLICK START --------------------------------------------------------------------------------

orgDirectory.getOrgMembers=function getOrgMembers(organizationId,organizationName){
orgDirectory.loading=true;
orgDirectory.organization.id=organizationId;
orgDirectory.organization.name=organizationName;
API.cui.getPersons({'qs':[['organization.id',orgDirectory.organization.id]]}).
then(function(res){
orgDirectory.userList=res;
orgDirectory.unparsedUserList=res;
orgDirectory.statusList=getStatusList(orgDirectory.userList);
orgDirectory.loading=false;
$scope.$digest();}).

fail(handleError);};


orgDirectory.sort=function(sortType){
Sort.listSort(orgDirectory.userList,sortType,orgDirectory.sortFlag);
orgDirectory.sortFlag=!orgDirectory.sortFlag;};


orgDirectory.parseUsersByStatus=function(status){
if(status==='all'){
orgDirectory.userList=orgDirectory.unparsedUserList;}else 

{
var filteredUsers=_.filter(orgDirectory.unparsedUserList,function(user){
return user.status===status;});

orgDirectory.userList=filteredUsers;}};



// ON CLICK END ----------------------------------------------------------------------------------
}]);



angular.module('organization').
controller('userDetailsCtrl',['$scope','$stateParams','API','Timezones','UserService',
function($scope,$stateParams,API,Timezones,UserService){
'use strict';
var userDetails=this;
var userID=$stateParams.id;

userDetails.loading=true;
userDetails.profileRolesSwitch=true;


// HELPER FUNCTIONS START ------------------------------------------------------------------------

var handleError=function handleError(err){
userDetails.loading=false;
$scope.$digest();};


var onLoadFinish=function onLoadFinish(){
return;};


// HELPER FUNCTIONS END --------------------------------------------------------------------------

// ON LOAD START ---------------------------------------------------------------------------------
var userParams=angular.isDefined(userID)?{personId:userID}:{personId:API.getUser(),useCuid:true};

UserService.getProfile({personId:API.getUser(),useCuid:true}).then(function(res){
angular.copy(res,userDetails);

//In order to reuse a view which specifies its databinding to userProfile.
$scope.userProfile={};
$scope.userProfile.saving=true;
$scope.userProfile.fail=false;
$scope.userProfile.success=false;
$scope.userProfile.timezoneById=Timezones.timezoneById;
$scope.userProfile.toggleOffFunctions={};
UserService.injectUI($scope.userProfile,$scope);
angular.copy(res,$scope.userProfile);

userDetails.loading=false;},
function(err){
userDetails.loading=false;});


// ON LOAD END -----------------------------------------------------------------------------------
}]);



angular.module('organization').
controller('orgHierarchyCtrl',['$scope','$stateParams','API',
function($scope,$stateParams,API){
'use strict';
var orgHierarchy=this;

orgHierarchy.loading=true;

// HELPER FUNCTIONS START ------------------------------------------------------------------------

var handleError=function handleError(err){
orgHierarchy.loading=false;
$scope.$digest();
console.log('Error',err);};


// HELPER FUNCTIONS END --------------------------------------------------------------------------

// ON LOAD START ---------------------------------------------------------------------------------

API.cui.getPerson({personId:API.getUser(),useCuid:true}).
then(function(res){
return API.cui.getOrganization({organizationId:res.organization.id});}).

then(function(res){
orgHierarchy.organization=res;
return API.cui.getOrganizationHierarchy({id:orgHierarchy.organization.id});}).

then(function(res){
console.log('Organization Hierarchy: ',res);
orgHierarchy.loading=false;
$scope.$digest();}).

fail(handleError);

// ON LOAD END -----------------------------------------------------------------------------------
}]);



angular.module('organization').
controller('orgProfileCtrl',['$scope','$stateParams','API',
function($scope,$stateParams,API){
'use strict';

var orgProfile=this;
var organizationId=$stateParams.id;

orgProfile.loading=true;

// HELPER FUNCTIONS START ------------------------------------------------------------------------

var handleError=function handleError(err){
orgProfile.loading=false;
$scope.$digest();
console.log('Error',err);};


var onLoadFinish=function onLoadFinish(organizationResponse){
orgProfile.organization=organizationResponse;
API.cui.getPersons({'qs':[['organization.id',orgProfile.organization.id],['securityadmin',true]]}).
then(function(res){
orgProfile.securityAdmins=res;
orgProfile.loading=false;
$scope.$digest();}).

fail(handleError);};


// HELPER FUNCTIONS END --------------------------------------------------------------------------

// ON LOAD START ---------------------------------------------------------------------------------

if(!organizationId){
// If no id parameter is passed we load the organization of the logged in user
API.cui.getPerson({personId:API.getUser(),useCuid:true}).
then(function(person){
return API.cui.getOrganization({organizationId:person.organization.id});}).

then(function(res){
onLoadFinish(res);}).

fail(handleError);}else 

{
// Load organization based on id parameter
API.cui.getOrganization({organizationId:organizationId}).
then(function(res){
onLoadFinish(res);}).

fail(handleError);}


// ON LOAD END -----------------------------------------------------------------------------------
}]);



angular.module('organization').
controller('orgRolesCtrl',['$scope',
function($scope){
'use strict';
var orgRoles=this;

// HELPER FUNCTIONS START ------------------------------------------------------------------------

var handleError=function handleError(err){
orgRoles.loading=false;
$scope.$digest();
console.log('Error',err);};


// HELPER FUNCTIONS END --------------------------------------------------------------------------

// ON LOAD START ---------------------------------------------------------------------------------

console.log('Roles Screen!');

// ON LOAD END -----------------------------------------------------------------------------------

// ON CLICK START --------------------------------------------------------------------------------
// ON CLICK END ----------------------------------------------------------------------------------
}]);



angular.module('misc',[]).
config(['$stateProvider',function($stateProvider){

var templateBase='assets/modules/misc/';

var returnCtrlAs=function returnCtrlAs(name,asPrefix){
return name+'Ctrl as '+(asPrefix?asPrefix:'')+(asPrefix?name[0].toUpperCase()+name.slice(1,name.length):name);};


$stateProvider.
state('welcome',{
url:'/welcome',
templateUrl:templateBase+'welcome/welcome.html'}).

state('misc',{
url:'/status',
templateUrl:templateBase+'status/status.html'}).

state('misc.404',{
url:'/404',
templateUrl:templateBase+'status/status-404.html'}).

state('misc.notAuth',{
url:'/notAuthorized',
templateUrl:templateBase+'status/status-notAuth.html'}).

state('misc.pendingStatus',{
url:'/pendingStatus',
templateUrl:templateBase+'status/status-pendingStatus.html'}).

state('misc.success',{
url:'/success',
templateUrl:templateBase+'status/status-success.html'});}]);





angular.module('common',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule']).
config(['$translateProvider','$locationProvider','$urlRouterProvider','$injector','localStorageServiceProvider',
'$cuiIconProvider','$cuiI18nProvider','$paginationProvider','$stateProvider',
function($translateProvider,$locationProvider,$urlRouterProvider,$injector,localStorageServiceProvider,$cuiIconProvider,
$cuiI18nProvider,$paginationProvider,$stateProvider){

localStorageServiceProvider.setPrefix('cui');
// $locationProvider.html5Mode(true);

var templateBase='assets/modules/';

var returnCtrlAs=function returnCtrlAs(name,asPrefix){
return name+'Ctrl as '+(asPrefix?asPrefix:'')+(asPrefix?name[0].toUpperCase()+name.slice(1,name.length):name);};


$stateProvider.
state('empty',{
url:'/empty',
templateUrl:templateBase+'common/empty/empty.html',
controller:returnCtrlAs('empty')});


if(appConfig.languages){(function(){
$cuiI18nProvider.setLocaleCodesAndNames(appConfig.languages);
var languageKeys=Object.keys($cuiI18nProvider.getLocaleCodesAndNames());

var returnRegisterAvailableLanguageKeys=function returnRegisterAvailableLanguageKeys(){
// Reroute unknown language to prefered language
var object={'*':languageKeys[0]};
languageKeys.forEach(function(languageKey){
// Redirect language keys such as en_US to en
object[languageKey+'*']=languageKey;});

return object;};


$translateProvider.useLoader('LocaleLoader',{
url:'bower_components/cui-i18n/dist/cui-i18n/angular-translate/',
prefix:'locale-',
suffix:'.json'}).

registerAvailableLanguageKeys(languageKeys,returnRegisterAvailableLanguageKeys()).
uniformLanguageTag('java').
determinePreferredLanguage().
fallbackLanguage(languageKeys);

$cuiI18nProvider.setLocalePreference(languageKeys);})();}


if(appConfig.iconSets){
appConfig.iconSets.forEach(function(iconSet){
$cuiIconProvider.iconSet(iconSet.name,iconSet.path,iconSet.defaultViewBox||null);});}



// Pagination Results Per Page Options
if(appConfig.paginationOptions){
$paginationProvider.setPaginationOptions(appConfig.paginationOptions);}}]);




angular.module('common').
run(['LocaleService','$rootScope','$state','$http','$templateCache','$cuiI18n','User',
'cui.authorization.routing','Menu','API','$cuiIcon',
function(LocaleService,$rootScope,$state,$http,$templateCache,$cuiI18n,User,routing,Menu,API,$cuiIcon){

// Add locales here
var languageNameObject=$cuiI18n.getLocaleCodesAndNames();

for(var LanguageKey in languageNameObject){
LocaleService.setLocales(LanguageKey,languageNameObject[LanguageKey]);}


$rootScope.$on('$stateChangeStart',function(event,toState,toParams,fromState,fromParams){
// CUI Auth
API.handleCovAuthResponse(event,toState,toParams,fromState,fromParams);
// Determine if user is able to access the particular route we're navigation to
routing($rootScope,$state,toState,toParams,fromState,fromParams,User.getEntitlements());
// Menu handling
Menu.handleStateChange(toState.menu);});


$rootScope.$on('$stateChangeSuccess',function(event,toState,toParams,fromState,fromParams){
// For base.goBack()
$state.previous={};
$state.previous.name=fromState;
$state.previous.params=fromParams;});


angular.forEach($cuiIcon.getIconSets(),function(iconSettings,namespace){
$http.get(iconSettings.path,{
cache:$templateCache});});}]);






angular.
module('common').
controller('baseCtrl',['Base','$scope',function(Base,$scope){

$scope.base=this;
$scope.base=Base;}]);




angular.
module('common').
controller('emptyCtrl',['API',function(API){

// This empty controller is used to prevent a CUI.JS authHandler loop in the JWT token process!
}]);



angular.module('common').
factory('API',['$state','User','$rootScope','$window','$location',function($state,User,$rootScope,$window,$location){

var myCUI=cui.api();
cui.log('cui.js v',myCUI.version()); // CUI Log

var authInfo={};

if(appConfig.serviceUrl){
myCUI.setServiceUrl(appConfig.serviceUrl);}else 

myCUI.setServiceUrl('STG');

var originUri=appConfig.originUri;

function jwtAuthHandler(){
return myCUI.covAuth({
originUri:originUri,
authRedirect:window.location.href.split('#')[0]+'#/empty',
appRedirect:$location.path()});}



myCUI.setAuthHandler(jwtAuthHandler);

return {
cui:myCUI,
getUser:User.get,
setUser:User.set,
getUserEntitlements:User.getEntitlements,
setUserEntitlements:User.setEntitlements,
handleCovAuthResponse:function handleCovAuthResponse(e,toState,toParams,fromState,fromParams){
var self=this;
myCUI.covAuthInfo({originUri:originUri});
myCUI.handleCovAuthResponse({selfRedirect:true}).
then(function(res){
if(toState.name==='empty'){
if(res.appRedirect!=='empty'){
Object.keys($location.search()).forEach(function(searchParam){
$location.search(searchParam,null);});

$location.path(res.appRedirect).replace();}

return;}else 

{
self.setUser(res);
self.setAuthInfo(res.authInfo);
myCUI.getPerson({personId:res.cuid}).
then(function(res){
angular.copy(res.name,User.userName);
return myCUI.getPersonRoles({personId:self.getUser()});}).

then(function(roles){
var roleList=[];
roles.forEach(function(role){
roleList.push(role.name);});

self.setUserEntitlements(roleList);
$rootScope.$digest();});}});},




setAuthInfo:function setAuthInfo(newAuthInfo){
angular.copy(newAuthInfo[0],authInfo);},

authInfo:authInfo};}]);




angular.module('common').
factory('Base',['$state','Countries','Timezones','Languages','$translate','LocaleService','User','API','Menu',
function($state,Countries,Timezones,Languages,$translate,LocaleService,User,API,Menu){

return {
appConfig:appConfig,
authInfo:API.authInfo,
countries:Countries,
getLanguageCode:Languages.getCurrentLanguageCode,
languages:Languages.all,
logout:API.cui.covLogout,
menu:Menu,
timezones:Timezones.all,
user:User.user,
userName:User.userName,
goBack:function goBack(){
if($state.previous.name.name!==''){
$state.go($state.previous.name,$state.previous.params);}else 

{
$state.go('base');}},


generateHiddenPassword:function generateHiddenPassword(password){
return Array(password.length+1).join('•');}};}]);






angular.module('common').
factory('Countries',['$http','$rootScope','$translate',function($http,$rootScope,$translate){

var countries=[];

var GetCountries=function GetCountries(locale){
return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/'+locale+'.json');};


var setCountries=function setCountries(language){
language=language||'en';
if(language.indexOf('_')>-1){
language=language.split('_')[0];}

GetCountries(language).
then(function(res){
countries.lenght=0;
res.data.forEach(function(country){
countries.push(country);});}).


catch(function(err){
console.log(err);});};



$rootScope.$on('languageChange',function(e,args){
setCountries(args);});


var getCountryByCode=function getCountryByCode(countryCode){
return _.find(countries,function(countryObject){
return countryObject.code===countryCode;});};



setCountries($translate.proposedLanguage());

return {
list:countries,
getCountryByCode:getCountryByCode};}]);



angular.module('common').
factory('Languages',['$cuiI18n','LocaleService',function($cuiI18n,LocaleService){

var languages=$cuiI18n.getLocaleCodesAndNames();

return {
all:languages,
getCurrentLanguageCode:function getCurrentLanguageCode(){
if(LocaleService.getLocaleCode().indexOf('_')>-1)return LocaleService.getLocaleCode().split('_')[0];else 
return LocaleService.getLocaleCode();}};}]);




angular.module('common').
factory('Menu',['$rootScope',function($rootScope){
return {
desktop:{
'state':'open', // default state for desktop menu
'enabled':true,
'open':function open(){
this.state='open';},

'close':function close(){
this.state='closed';},

'toggle':function toggle(){
this.state==='open'?this.state='closed':this.state='open';},

'hide':function hide(){
this.enabled=false;},

'show':function show(){
this.enabled=true;}},



mobile:{
'state':'closed', // default state for mobile menu
'enabled':true,
'open':function open(){
this.state='open';},

'close':function close(){
this.state='close';},

'toggle':function toggle(){
this.state==='open'?this.state='closed':this.state='open';},

'hide':function hide(){
this.enabled=false;},

'show':function show(){
this.state=true;}},



handleStateChange:function handleStateChange(stateMenuOptions){
if(!angular.isDefined(stateMenuOptions)){
this.desktop.show();
this.mobile.show();}else 

{
angular.isDefined(stateMenuOptions.desktop)&&stateMenuOptions.desktop===false?this.desktop.hide():this.desktop.show();
angular.isDefined(stateMenuOptions.mobile)&&stateMenuOptions.mobile===false?this.mobile.hide():this.mobile.show();}}};}]);






angular.module('common').
factory('Sort',['$filter',function($filter){
return {
listSort:function listSort(listToSort,sortType,order){
listToSort.sort(function(a,b){
if(sortType==='alphabetically'){
if(a.name[0]){
a=$filter('cuiI18n')(a.name).toUpperCase(),
b=$filter('cuiI18n')(b.name).toUpperCase();}else 

{
a=a.name.given.toUpperCase(),
b=b.name.given.toUpperCase();}}else 


if(sortType==='date'){
if(a.dateCreated){
a=a.dateCreated,b=b.dateCreated;}else 

{
a=a.creation,b=b.creation;}}else 


{
a=a.status,b=b.status;}


if(a<b){
if(order)return 1;else 
return -1;}else 

if(a>b){
if(order)return -1;else 
return 1;}else 

return 0;});}};}]);






angular.module('common').
factory('Timezones',['$http','$rootScope','$translate',function($http,$rootScope,$translate){

var timezones=[];

var GetTimezones=function GetTimezones(locale){
return $http.get('bower_components/cui-i18n/dist/cui-i18n/angular-translate/timezones/'+locale+'.json');};


var setTimezones=function setTimezones(language){
language=language||'en';
if(language.indexOf('_')>-1){
language=language.split('_')[0];}

GetTimezones(language).
then(function(res){
res.data.forEach(function(timezone){
timezones.push(timezone);});}).


catch(function(err){
console.log(err);});};



var getTimezoneById=function getTimezoneById(id){
if(!id)return '';
return _.find(timezones,function(timezone){
return timezone.id===id;}).
name;};


$rootScope.$on('languageChange',function(e,args){
setTimezones(args);});


setTimezones($translate.proposedLanguage());

return {
all:timezones,
timezoneById:getTimezoneById};}]);



angular.module('common').
factory('User',['$rootScope',function($rootScope){

var user={
entitlements:[]};


var userName={};

return {
set:function set(newUser){
user.cuid=newUser.cuid;},

get:function get(){
return user.cuid||'[cuid]';},

setEntitlements:function setEntitlements(newEntitlements){
user.entitlements=newEntitlements;},

getEntitlements:function getEntitlements(){
return user.entitlements;},


userName:userName};}]);






angular.module('common').
factory('UserService',['$q','API','CuiPasswordPolicies',function($q,API,CuiPasswordPolicies){
'use strict';

var self={
getProfile:function getProfile(userCredentials){

var defer=$q.defer();
var userProfile={};

API.cui.getPerson(userCredentials).
then(function(res){
if(!res.addresses){
// If the person has no addresses set we need to initialize it as an array
// to follow the object structure
res.addresses=[{}];
res.addresses[0].streets=[[]];}

userProfile.user={};
userProfile.tempUser={};
angular.copy(res,userProfile.user);
angular.copy(res,userProfile.tempUser);
return API.cui.getSecurityQuestionAccount({personId:API.getUser(),useCuid:true});}).

then(function(res){
userProfile.userSecurityQuestions=res;
userProfile.tempUserSecurityQuestions=angular.copy(userProfile.userSecurityQuestions.questions);
return API.cui.getSecurityQuestions();}).

then(function(res){
userProfile.allSecurityQuestions=res;
userProfile.allSecurityQuestionsDup=angular.copy(res);
userProfile.allSecurityQuestions.splice(0,1);

// Splits questions to use between both dropdowns
var numberOfQuestions=userProfile.allSecurityQuestions.length,
numberOfQuestionsFloor=Math.floor(numberOfQuestions/3);
//Allocating options to three questions
userProfile.allChallengeQuestions0=userProfile.allSecurityQuestions.splice(0,numberOfQuestionsFloor);
userProfile.allChallengeQuestions1=userProfile.allSecurityQuestions.splice(0,numberOfQuestionsFloor);
userProfile.allChallengeQuestions2=userProfile.allSecurityQuestions.splice(0,numberOfQuestionsFloor);

self.selectTextsForQuestions(userProfile);

return API.cui.getOrganization({organizationId:userProfile.user.organization.id});}).

then(function(res){

userProfile.organization=res;
return API.cui.getPasswordPolicy({policyId:res.passwordPolicy.id});}).

then(function(res){
CuiPasswordPolicies.set(res.rules);
defer.resolve(userProfile);}).

fail(function(err){
console.error("UserService.getProfile",err);
defer.reject(err);});


return defer.promise;},


// HELPER FUNCTIONS START ------------------------------------------------------------------------
selectTextsForQuestions:function selectTextsForQuestions(userProfile){
userProfile.challengeQuestionsTexts=[];
angular.forEach(userProfile.userSecurityQuestions.questions,function(userQuestion){
var question=_.find(userProfile.allSecurityQuestionsDup,function(question){return question.id===userQuestion.question.id;});
this.push(question.question[0].text);},
userProfile.challengeQuestionsTexts);},


resetTempUser:function resetTempUser(userProfile){
if(!angular.equals(userProfile.tempUser,userProfile.user))angular.copy(userProfile.user,userProfile.tempUser);},


getPersonPasswordAccount:function getPersonPasswordAccount(userProfile){
return {
version:'1',
username:userProfile.user.username,
currentPassword:userProfile.userPasswordAccount.currentPassword,
password:userProfile.userPasswordAccount.password,
passwordPolicy:userProfile.organization.passwordPolicy,
authenticationPolicy:userProfile.organization.authenticationPolicy};},



injectUI:function injectUI(userProfile,$scope){

// ON CLICK START --------------------------------------------------------------------------------

userProfile.toggleAllOff=function(){
angular.forEach(userProfile.toggleOffFunctions,function(toggleOff){
toggleOff();});


self.resetTempUser(userProfile);};


userProfile.resetTempObject=function(master,temp){
// Used to reset the temp object to the original when a user cancels their edit changes
if(!angular.equals(master,temp))angular.copy(master,temp);};


userProfile.resetPasswordFields=function(){
// Used to set the password fields to empty when a user clicks cancel during password edit
userProfile.userPasswordAccount={
currentPassword:'',
password:''};

userProfile.passwordRe='';};


userProfile.checkIfRepeatedSecurityAnswer=function(securityQuestions,formObject){
securityQuestions.forEach(function(secQuestion,i){
var securityAnswerRepeatedIndex=_.findIndex(securityQuestions,function(secQuestionToCompareTo,z){
return z!==i&&secQuestion.answer&&secQuestionToCompareTo.answer&&secQuestion.answer.toUpperCase()===secQuestionToCompareTo.answer.toUpperCase();});

if(securityAnswerRepeatedIndex>-1){
if(formObject['answer'+securityAnswerRepeatedIndex])formObject['answer'+securityAnswerRepeatedIndex].$setValidity('securityAnswerRepeated',false);
if(formObject['answer'+i])formObject['answer'+i].$setValidity('securityAnswerRepeated',false);}else 

{
if(formObject['answer'+i])formObject['answer'+i].$setValidity('securityAnswerRepeated',true);}});};




userProfile.resetChallengeQuestion=function(index){
userProfile.resetTempObject(userProfile.userSecurityQuestions.questions[index],userProfile.tempUserSecurityQuestions[index]);};


userProfile.pushToggleOff=function(toggleOffObject){
userProfile.toggleOffFunctions[toggleOffObject.name]=toggleOffObject.function;};


// ON CLICK END ----------------------------------------------------------------------------------

// UPDATE FUNCTIONS START ------------------------------------------------------------------------

userProfile.updatePerson=function(section,toggleOff){
if(section)userProfile[section]={
submitting:true};

if(!userProfile.userCountry){
userProfile.tempUser.addresses[0].country=userProfile.user.addresses[0].country;}else 

{
userProfile.tempUser.addresses[0].country=userProfile.userCountry.originalObject.code;}


API.cui.updatePerson({personId:API.getUser(),useCuid:true,data:userProfile.tempUser}).
then(function(){
angular.copy(userProfile.tempUser,userProfile.user);
if(section)userProfile[section].submitting=false;
if(toggleOff)toggleOff();
$scope.$digest();}).

fail(function(error){
console.log(error);
if(section)userProfile[section].submitting=false;
if(section)userProfile[section].error=true;
$scope.$digest();});};



userProfile.updatePassword=function(section,toggleOff){
if(section){
userProfile[section]={submitting:true};}


API.cui.updatePersonPassword({personId:API.getUser(),data:self.getPersonPasswordAccount(userProfile)}).
then(function(res){
if(section)userProfile[section].submitting=false;
if(toggleOff)toggleOff();
userProfile.resetPasswordFields();
$scope.$digest();}).

fail(function(err){
console.log(err);
if(section)userProfile[section].submitting=false;
if(section)userProfile[section].error=true;
$scope.$digest();});};



userProfile.saveChallengeQuestions=function(section,toggleOff){
if(section)userProfile[section]={
submitting:true};

userProfile.userSecurityQuestions.questions=angular.copy(userProfile.tempUserSecurityQuestions);
self.selectTextsForQuestions(userProfile);

API.cui.updateSecurityQuestionAccount({
personId:API.getUser(),
data:{
version:'1',
id:API.getUser(),
questions:userProfile.userSecurityQuestions.questions}}).


then(function(res){
if(section)userProfile[section].submitting=false;
if(toggleOff)toggleOff();
$scope.$digest();}).

fail(function(err){
console.log(err);
if(section)userProfile[section].submitting=false;
if(section)userProfile[section].error=true;
$scope.$digest();});};


// UPDATE FUNCTIONS END --------------------------------------------------------------------------
}

// HELPER FUNCTIONS END ------------------------------------------------------------------------
};

return self;}]);


angular.module('applications',[]).
config(['$stateProvider',function($stateProvider){

var templateBase='assets/modules/applications/';

var returnCtrlAs=function returnCtrlAs(name,asPrefix){
return name+'Ctrl as '+(asPrefix?asPrefix:'')+(asPrefix?name[0].toUpperCase()+name.slice(1,name.length):name);};


$stateProvider.
state('applications',{
url:'/applications',
templateUrl:templateBase+'applications.html'}).

state('applications.myApplications',{
url:'/',
templateUrl:templateBase+'myApplications/myApplications.html',
controller:returnCtrlAs('myApplications')}).

state('applications.myApplicationDetails',{
url:'/:packageId/:appId',
templateUrl:templateBase+'myApplications/myAapplications-details.html',
controller:returnCtrlAs('myApplicationDetails')}).

state('applications.newRequest',{
url:'/request',
templateUrl:templateBase+'newRequestReview/newRequest.html',
controller:returnCtrlAs('newAppRequest')}).

state('applications.search',{
url:'/search?name&category&page',
templateUrl:templateBase+'/search/applicationSearch.html',
controller:returnCtrlAs('applicationSearch')}).

state('applications.reviewRequest',{
url:'/review',
templateUrl:templateBase+'newRequestReview/review.html',
controller:returnCtrlAs('applicationReview')}).

state('applications.orgApplications',{
url:'/organization?id',
templateUrl:templateBase+'orgApplications/orgApplications.html',
controller:returnCtrlAs('orgApplications')});}]);





angular.module('applications').
controller('myApplicationDetailsCtrl',['API','$scope','$stateParams','$state',
function(API,$scope,$stateParams,$state){
var myApplicationDetails=this;

var appId=$stateParams.appId; // get the appId from the url
var packageId=$stateParams.packageId; // get the packageId from the url
var stepsDone=0,
stepsRequired=2;

myApplicationDetails.bundled=[];
myApplicationDetails.related=[];

// HELPER FUNCTIONS START ------------------------------------------------------------------------

var handleError=function handleError(err){
console.log('Error \n',err);};


var checkIfDone=function checkIfDone(){
stepsDone++;
if(stepsDone===stepsRequired){
myApplicationDetails.doneLoading=true;
$scope.$digest();}};




// var checkIfAppIsGrantedToUser = function(childService, childPackage, packagesGrantedToUser){
//     var pkgGrantThatMatches;

//     packagesGrantedToUser.some(function(pkg, i) {
//         return childPackage.id === pkg.servicePackage.id ? (pkgGrantThatMatches = packagesGrantedToUser[i], true) : false;
//     });

//     if (pkgGrantThatMatches) {
//         childService.status = pkgGrantThatMatches.status;
//         childService.grantedDate = pkgGrantThatMatches.creation;
//     }

//     childService.packageId = childPackage.id;
//     return childService;
// };

// var getRelatedApps = function(app) {
//     // WORKAROUND CASE #3
//     myApplicationDetails.related = [];
//     var packagesGrantedToUser = [];
//     var childServices = [];

//     API.cui.getPersonPackages({ personId: API.getUser(), useCuid:true }) // Get All Person Packages
//     .then(function(res) {
//         res.forEach(function(pkg) {
//             packagesGrantedToUser.push(pkg);
//         });
//         // Return all child packages of package we are currently viewing
//         return API.cui.getPackages({qs:[['parentPackage.id',packageId]]});
//     })
//     .then(function(res) {
//         // No Children Packages
//         if (res.length === 0) {
//             checkIfDone();
//         }

//         var packagesThatAreChildrenOfMainPacakge = res;

//         // Get services of each child package
//         packagesThatAreChildrenOfMainPacakge.forEach(function(childPackage, z) {
//             API.cui.getServices({'packageId':childPackage.id})
//             .then(function(res) {
//                 z++;

//                 res.forEach(function(service) {
//                     childServices.push(service);
//                 });

//                 if (z === packagesThatAreChildrenOfMainPacakge.length) {
//                     childServices = _.uniq(childServices, function(x) {
//                         return x.id;
//                     });

//                     childServices.forEach(function(service, z) {
//                         app = checkIfAppIsGrantedToUser(service, childPackage, packagesGrantedToUser);
//                         myApplicationDetails.related.push(app);
//                     });

//                     myApplicationDetails.doneLoading = true;
//                     $scope.$digest();
//                 }
//             })
//             .fail(handleError);
//         });
//     })
//     .fail(handleError);
// };

var getPackageGrantDetails=function getPackageGrantDetails(app,bundled){
API.cui.getPersonPackage({personId:API.getUser(),useCuid:true,packageId:packageId}).
then(function(res){
app.grantedDate=res.creation;
app.status=res.status;
app.packageId=packageId;
myApplicationDetails.app=app;
bundled.forEach(function(app){
app.grantedDate=res.creation;
app.status=res.status;
app.packageId=packageId;
myApplicationDetails.bundled.push(app);});

checkIfDone();}).

fail(handleError);};


var parseAppAndBundled=function parseAppAndBundled(listOfBundledAndMainApp,callback){
var mainApp;
var bundledApps=[];
listOfBundledAndMainApp.forEach(function(app){
app.parentPackage=packageId;
if(app.id===appId)mainApp=app;else 
bundledApps.push(app);});

callback(mainApp,bundledApps);};


// HELPER FUNCTIONS END --------------------------------------------------------------------------

// ON LOAD START ---------------------------------------------------------------------------------

if(appId){
API.cui.getPackageServices({packageId:packageId}).
then(function(res){
parseAppAndBundled(res,getPackageGrantDetails); // parseAppAndBundled returns the app we're trying to check
}).
fail(handleError);

API.cui.getPersonPackageClaims({personId:API.getUser(),useCuid:true,'packageId':packageId}).
then(function(res){
myApplicationDetails.claims=res;
checkIfDone();}).

fail(function(){
// claims endpoint returns 400 if there are no claims
myApplicationDetails.claims=null;
checkIfDone();});}else 


{}
// message for no appId in the state


// ON LOAD END -----------------------------------------------------------------------------------

// ON CLICK FUNCTIONS START ----------------------------------------------------------------------

myApplicationDetails.goToDetails=function(application){
$state.go('applications.myApplicationDetails',{'packageId':application.packageId,'appId':application.id});};


// ON CLICK FUNCTIONS END ------------------------------------------------------------------------
}]);



angular.module('applications').
controller('myApplicationsCtrl',['localStorageService','$scope','$stateParams','API','$state','$filter','Sort',
function(localStorageService,$scope,$stateParams,API,$state,$filter,Sort){
'use strict';

var myApplications=this;

myApplications.doneLoading=false;
myApplications.sortFlag=false;
myApplications.categoriesFlag=false;
myApplications.statusFlag=false;
myApplications.list=[];
myApplications.unparsedListOfAvailabeApps=[];
myApplications.statusList=['active','suspended','pending'];
myApplications.statusCount=[0,0,0,0];

var stepsDone=0,
stepsRequired=2;

// HELPER FUNCTIONS START ---------------------------------------------------------------------------------

var handleError=function handleError(err){
console.log('Error \n\n',err);};


var updateStatusCount=function updateStatusCount(service){
if(service.status&&myApplications.statusList.indexOf(service.status)>-1){
myApplications.statusCount[myApplications.statusList.indexOf(service.status)+1]++;}};



var getListOfCategories=function getListOfCategories(services){
// WORKAROUND CASE # 7
var categoryList=[];
var categoryCount=[myApplications.unparsedListOfAvailabeApps.length];

services.forEach(function(service){
if(service.category){
var serviceCategoryInCategoryList=_.some(categoryList,function(category,i){
if(angular.equals(category,service.category)){
categoryCount[i+1]?categoryCount[i+1]++:categoryCount[i+1]=1;
return true;}

return false;});


if(!serviceCategoryInCategoryList){
categoryList.push(service.category);
categoryCount[categoryList.length]=1;}}});



myApplications.categoryCount=categoryCount;
return categoryList;};


var checkIfDone=function checkIfDone(){
stepsDone++;
if(stepsDone===stepsRequired){
myApplications.list=_.uniq(myApplications.list,function(app){
return app.id;});

myApplications.list.forEach(function(service){
updateStatusCount(service);});

angular.copy(myApplications.list,myApplications.unparsedListOfAvailabeApps);
myApplications.statusCount[0]=myApplications.list.length; // set "all" to the number of total apps
myApplications.categoryList=getListOfCategories(myApplications.list);
myApplications.doneLoading=true;
$scope.$digest();}};



var getApplicationsFromGrants=function getApplicationsFromGrants(grants){
// WORKAROUND CASE #1
// from the list of grants, get the list of services from each of those service packages
var i=0;
if(grants.length===0){
checkIfDone();
return;}

grants.forEach(function(grant){
API.cui.getPackageServices({'packageId':grant.servicePackage.id}).
then(function(res){
i++;
res.forEach(function(service){
service.status=grant.status; // attach the status of the service package to the service
service.dateCreated=grant.creation;
service.parentPackage=grant.servicePackage.id;
myApplications.list.push(service);});


if(i===grants.length){ // if this is the last grant
checkIfDone();}}).


fail(handleError);});};



var getApplicationsFromPendingRequests=function getApplicationsFromPendingRequests(requests){
var i=0;
if(requests.length===0){
checkIfDone();
return;}

requests.forEach(function(request){
API.cui.getPackageServices({'packageId':request.servicePackage.id}).
then(function(res){
i++;
res.forEach(function(service){
service.status='pending';
service.dateCreated=request.creation;
service.parentPackage=request.servicePackage.id;
myApplications.list.push(service);});

if(i===requests.length){
checkIfDone();}}).


fail(handleError);});};



var categoryFilter=function categoryFilter(app,category){
if(!app.category&&category)return false;
if(!category)return true;
return $filter('cuiI18n')(app.category)===$filter('cuiI18n')(category);};


var disableAppLaunch=function disableAppLaunch(status){
if(status=='active')return false;else 
return true;};


// HELPER FUNCTIONS END -----------------------------------------------------------------------------------

// ON LOAD START ------------------------------------------------------------------------------------------

API.cui.getPersonPackages({personId:API.getUser(),useCuid:true,pageSize:200}) // this returns a list of grants
.then(function(res){
getApplicationsFromGrants(res);}).

fail(handleError);

API.cui.getPackageRequests({'requestor.id':API.getUser(),'requestor.type':'person',pageSize:200}).
then(function(res){
getApplicationsFromPendingRequests(res);}).

fail(handleError);

// ON LOAD END --------------------------------------------------------------------------------------------

// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

myApplications.goToDetails=function(application){
$state.go('applications.myApplicationDetails',{'packageId':application.parentPackage,'appId':application.id});};


myApplications.sort=function(sortType){
Sort.listSort(myApplications.list,sortType,myApplications.sortFlag);
myApplications.sortFlag=!myApplications.sortFlag;};


myApplications.parseAppsByCategory=function(category){
if(category==='all'){
myApplications.list=myApplications.unparsedListOfAvailabeApps;}else 

{
var filteredApps=_.filter(myApplications.unparsedListOfAvailabeApps,function(app){
return categoryFilter(app,category);});

myApplications.list=filteredApps;}};



myApplications.parseAppsByStatus=function(status){
if(status==='all'){
myApplications.list=myApplications.unparsedListOfAvailabeApps;}else 

{
var filteredApps=_.filter(myApplications.unparsedListOfAvailabeApps,function(app){
return app.status===status;});

myApplications.list=filteredApps;}};



// ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------
}]);



angular.module('applications').
controller('newAppRequestCtrl',['API','$scope','$state','AppRequests',
function(API,$scope,$state,AppRequests){
'use strict';
var newAppRequest=this;

var user;
var services=[];
var appsBeingRequested=AppRequests.get();

newAppRequest.numberOfRequests=0;
newAppRequest.appsBeingRequested=[];

// HELPER FUNCTIONS START ------------------------------------------------------------------------

var handleError=function handleError(err){
console.log('Error\n',err);};


var getListOfCategories=function getListOfCategories(services){
// WORKAROUND CASE # 7
var categoryList=[];

services.forEach(function(service){
if(service.category){
var serviceCategoryInCategoryList=_.some(categoryList,function(category){
return angular.equals(category,service.category);});


if(!serviceCategoryInCategoryList){
categoryList.push(service.category);}}});



return categoryList;};


Object.keys(appsBeingRequested).forEach(function(appId){
// This sets the checkboxes back to marked when the user clicks back
newAppRequest.numberOfRequests++;
newAppRequest.appsBeingRequested.push(appsBeingRequested[appId]);});


// HELPER FUNCTIONS END --------------------------------------------------------------------------

// ON LOAD START ---------------------------------------------------------------------------------

API.cui.getRequestablePersonPackages({personId:API.getUser(),useCuid:true,pageSize:200}).
then(function(res){
var i=0;
var packages=res;

if(res.length===0){
newAppRequest.loadingDone=true;
$scope.$digest();}


packages.forEach(function(pkg){
API.cui.getPackageServices({'packageId':pkg.id}).
then(function(res){
i++;
res.forEach(function(service){
services.push(service);});

if(i===packages.length){
newAppRequest.categories=getListOfCategories(services);
newAppRequest.loadingDone=true;
$scope.$digest();}}).


fail(function(){
i++;
if(i===packages.length){
newAppRequest.categories=getListOfCategories(services);
newAppRequest.loadingDone=true;
$scope.$digest();}});});}).




fail(handleError);

// ON LOAD END ------------------------------------------------------------------------------------

// ON CLICK FUNCTIONS START -----------------------------------------------------------------------

newAppRequest.searchCallback=function(searchWord){
$state.go('applications.search',{name:searchWord});};


// ON CLICK FUNCTIONS END -------------------------------------------------------------------------
}]);



angular.module('applications').
factory('AppRequests',['$filter',function($filter){
var appRequestsObject={},
appRequests={};

appRequests.set=function(newAppRequestsObject){
appRequestsObject=newAppRequestsObject;};


appRequests.get=function(){
return appRequestsObject;};


appRequests.buildReason=function(app,reason){
var tempApp={};
angular.copy(app,tempApp);
tempApp.reason=$filter('translate')('reason-im-requesting')+' '+$filter('cuiI18n')(tempApp.name)+': '+reason;
return tempApp;};



// appRequestsObject is an object that looks something like
// {
//    appId:{
//       id:appId,
//       reason: reasonForRequestingThisApp,
//       packageId: idOfThePackageThatContainsThisApp,
//       ...other app properties,
//    },
//    otherAppId:{ ... },
//    ...
// }
appRequests.getPackageRequests=function(userId,arrayOfAppsBeingRequested){
var arrayOfPackagesBeingRequested=[],
arrayOfPackageRequests=[];
arrayOfAppsBeingRequested.forEach(function(app,i){
if(arrayOfPackagesBeingRequested.indexOf(app.packageId)>-1){ // if we've parsed an app that belongs to the same pacakge
arrayOfPackageRequests.some(function(packageRequest,i){
return arrayOfPackageRequests[i].servicePackage.id===app.packageId?(arrayOfPackageRequests[i].reason=arrayOfPackageRequests[i].reason+('\n\n'+app.reason),true):false; // if we already build a package request for this pacakge then append the reason of why we need this other app
});}else 

{
arrayOfPackageRequests[i]={
'requestor':{
id:userId,
type:'person'},

servicePackage:{
id:arrayOfAppsBeingRequested[i].packageId,
type:'servicePackage'},

reason:app.reason};

arrayOfPackagesBeingRequested[i]=app.packageId; // save the pacakge id that we're requesting in a throwaway array, so it's easier to check if we're
// already requesting this package
}});

return arrayOfPackageRequests;};


return appRequests;}]);


angular.module('applications').
controller('applicationReviewCtrl',['$scope','API','AppRequests','$timeout','$state',function($scope,API,AppRequests,$timeout,$state){;

var applicationReview=this;
var appRequests=AppRequests.get(),
appsBeingRequested=Object.keys(appRequests);

// ON LOAD START ---------------------------------------------------------------------------------

applicationReview.appRequests=[];

for(var i=0;i<appsBeingRequested.length;i=i+2){
applicationReview.appRequests.push([appRequests[appsBeingRequested[i]],appRequests[appsBeingRequested[i+1]]||undefined]);}


applicationReview.numberOfRequests=0;
appsBeingRequested.forEach(function(){
applicationReview.numberOfRequests++;});


// ON LOAD END ------------------------------------------------------------------------------------

// ON CLICK START ---------------------------------------------------------------------------------

applicationReview.submit=function(){
var applicationRequestArray=[];
applicationReview.attempting=true;
applicationReview.appRequests.forEach(function(appRequestGroup,i){
appRequestGroup.forEach(function(appRequest,x){
if(appRequest){
if(!appRequest.reason||appRequest.reason===''){
appRequest.reasonRequired=true;
applicationReview.attempting=false;
applicationReview.error=true;}else 

{
appRequest.reasonRequired=false;
applicationReview.error=false;
applicationRequestArray[i+x]=AppRequests.buildReason(appRequest,appRequest.reason);}}});});




if(applicationReview.error)return;
var appRequests=AppRequests.getPackageRequests(API.getUser(),applicationRequestArray),
i=0;
appRequests.forEach(function(appRequest){
API.cui.createPackageRequest({data:appRequest}).
then(function(res){
i++;
if(i===appRequests.length){
applicationReview.attempting=false;
applicationReview.success=true;
$scope.$digest();
$timeout(function(){
applicationReview.success=false;
$state.go('applications.myApplications');},
3000);}}).


fail(function(){
applicationReview.attempting=false;
applicationReview.error=true;
$scope.$digest();});});};




// ON CLICK END -----------------------------------------------------------------------------------
}]);


angular.module('applications').
controller('orgApplicationsCtrl',['$scope','API','Sort','$stateParams',
function($scope,API,Sort,$stateParams){
'use strict';

var orgApplications=this;
var organizationId=$stateParams.id;

orgApplications.loading=true;
orgApplications.sortFlag=false;
orgApplications.categoriesFlag=false;
orgApplications.statusFlag=false;
orgApplications.appList=[];
orgApplications.unparsedAppList=[];
orgApplications.categoryList=[];
orgApplications.statusList=['active','suspended','pending'];
orgApplications.statusCount=[0,0,0,0];

// HELPER FUNCTIONS START ---------------------------------------------------------------------------------

var handleError=function handleError(err){
orgApplications.loading=false;
$scope.$digest();
console.log('Error',err);};


var getListOfCategories=function getListOfCategories(services){
// WORKAROUND CASE # 7
var categoryList=[];
var categoryCount=[orgApplications.unparsedAppList.length];

services.forEach(function(service){
if(service.category){
var serviceCategoryInCategoryList=_.some(categoryList,function(category,i){
if(angular.equals(category,service.category)){
categoryCount[i+1]?categoryCount[i+1]++:categoryCount[i+1]=1;
return true;}

return false;});


if(!serviceCategoryInCategoryList){
categoryList.push(service.category);
categoryCount[categoryList.length]=1;}}});



orgApplications.categoryCount=categoryCount;
return categoryList;};


var getApplicationsFromGrants=function getApplicationsFromGrants(grants){
// WORKAROUND CASE #1
// Get services from each grant
var i=0;
grants.forEach(function(grant){
API.cui.getPackageServices({'packageId':grant.servicePackage.id}).
then(function(res){
i++;
res.forEach(function(service){
// Set some of the grant attributes to its associated service
service.status=grant.status;
service.dateCreated=grant.creation;
service.parentPackage=grant.servicePackage.id;
orgApplications.appList.push(service);});


if(i===grants.length){
orgApplications.appList=_.uniq(orgApplications.appList,function(app){
return app.id;});

angular.copy(orgApplications.appList,orgApplications.unparsedAppList);
orgApplications.statusCount[0]=orgApplications.appList.length;
orgApplications.categoryList=getListOfCategories(orgApplications.appList);
orgApplications.loading=false;
$scope.$digest();}}).


fail(handleError);});};



// HELPER FUNCTIONS END -----------------------------------------------------------------------------------

// ON LOAD START ------------------------------------------------------------------------------------------

if(organizationId){
// Load organization applications of id parameter
API.cui.getOrganizationPackages({organizationId:organizationId}).
then(function(res){
getApplicationsFromGrants(res);}).

fail(handleError);}else 

{
// Load logged in user's organization applications
API.cui.getPerson({personId:API.getUser(),useCuid:true}).
then(function(res){
return API.cui.getOrganizationPackages({organizationId:res.organization.id});}).

then(function(res){
getApplicationsFromGrants(res);}).

fail(handleError);}


// ON LOAD END --------------------------------------------------------------------------------------------

// ON CLICK FUNCTIONS START -------------------------------------------------------------------------------
// ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------
}]);



angular.module('applications').
controller('applicationSearchCtrl',['API','$scope','$stateParams','$state','$filter','AppRequests',
function(API,$scope,$stateParams,$state,$filter,AppRequests){
'use strict';
var applicationSearch=this;

var userOrg;
var detailsFetchStep=0;
var nameSearch=$stateParams.name;
var categorySearch=$stateParams.category;
var packageList=[];
var userPackageList=[]; // WORKAROUND CASE #1
var listOfAvailabeApps=[];
var bundled=[];
var related=[];

applicationSearch.numberOfRequests=0;
applicationSearch.nameSearch=nameSearch; // get name url param to pre-populate the search field
applicationSearch.category=categorySearch; // get category url param to pre-populate search field
applicationSearch.packageRequests=AppRequests.get();
applicationSearch.appCheckbox={};
applicationSearch.detailsLoadingDone={};

// HELPER FUNCTIONS START ------------------------------------------------------------------------

var handleError=function handleError(err){
console.log('Error \n',err);};


var nameFilter=function nameFilter(app,search){
if(!search||search===''){
return true;}

return $filter('cuiI18n')(app.name).toLowerCase().indexOf(search.toLowerCase())>-1;};


var categoryFilter=function categoryFilter(app,category){
if(!app.category&&category){
return false;}

if(!category){
return true;}

return $filter('cuiI18n')(app.category).indexOf(category)>-1;};


var processNumberOfRequiredApps=function processNumberOfRequiredApps(pkgRequest){
if(pkgRequest){
applicationSearch.numberOfRequests++;}else 

{
applicationSearch.numberOfRequests--;}};



var getBundledApps=function getBundledApps($index,application){
// WORKAROUND CASE # 1
bundled[$index]=[];

API.cui.getPackageServices({'packageId':application.packageId}).
then(function(res){
res.forEach(function(app){
if(app.id!==application.id){
app.packageId=application.packageId;
bundled[$index].push(app);}});


detailsFetchStep++;

if(detailsFetchStep===2){
applicationSearch.list[$index].details={'bundled':bundled[$index],'related':related[$index]};
applicationSearch.detailsLoadingDone[application.id]=true;
$scope.$digest();}}).


fail(handleError);};


var getRelatedAppsThatHaventBeenGranted=function getRelatedAppsThatHaventBeenGranted(packagesToIgnore,packages,$index,application){
var z=0;

packages.forEach(function(pkg){
if(packagesToIgnore.indexOf(pkg.id)===-1){
API.cui.getPackageServices({'packageId':pkg.id}).
then(function(res){
z++;
res.forEach(function(app){
// for each of the services in that child package
app.packageId=pkg.id;
related[$index].push(app);});

if(z===packages.length){
detailsFetchStep++;
if(detailsFetchStep===2){
applicationSearch.list[$index].details={bundled:bundled[$index],related:related[$index]};
applicationSearch.detailsLoadingDone[application.id]=true;
$scope.$digest();}}}).



fail(handleError);}else 

{
z++;
if(z===packages.length){
detailsFetchStep++;
if(detailsFetchStep===2){
applicationSearch.list[$index].details={bundled:bundled[$index],related:related[$index]};
applicationSearch.detailsLoadingDone[$index]=true;
$scope.$digest();}}}});};






var getRelatedApps=function getRelatedApps($index,application){
// WORKAROUND CASE #3
related[$index]=[];

// Get the packages that are children of the package that the app
API.cui.getPackages({qs:[['parentPackage.id',application.packageId]]}).
then(function(res){
// we're checking the details of belongs to
if(res.length===0){
detailsFetchStep++;
if(detailsFetchStep===2){
applicationSearch.list[$index].details={bundled:bundled[$index],related:related[$index]};
applicationSearch.detailsLoadingDone[application.id]=true;
$scope.$digest();}}


var z=0;
var packages=res;
var packagesToIgnore=[]; // WORKAROUND CASE #3

API.cui.getPersonPackages({personId:API.getUser(),useCuid:true}).
then(function(res){
res.forEach(function(pkgGrant,i){
if(_.some(packages,function(pkg){
return pkg.id===pkgGrant.servicePackage.id;}))
{packagesToIgnore.push(pkgGrant.servicePackage.id);}});

getRelatedAppsThatHaventBeenGranted(packagesToIgnore,packages,$index,application);}).

fail(handleError);}).

fail(handleError);};


// HELPER FUNCTIONS END --------------------------------------------------------------------------

// ON LOAD START ---------------------------------------------------------------------------------

Object.keys(applicationSearch.packageRequests).forEach(function(appId){ // Gets the list of package requests saved in memory
// This sets the checkboxes back to marked when the user clicks back
applicationSearch.appCheckbox[appId]=true; // after being in request review
applicationSearch.numberOfRequests++;});


API.cui.getRequestablePersonPackages({personId:API.getUser(),useCuid:true,pageSize:200}).
then(function(res){
var i=0;
var listOfPackages=res;

if(listOfPackages.length===0){
applicationSearch.list=[];
applicationSearch.doneLoading=true;
$scope.$digest();}

listOfPackages.forEach(function(pkg){
API.cui.getPackageServices({'packageId':pkg.id}).
then(function(res){
i++;
res.forEach(function(service){
service.packageId=pkg.id;
listOfAvailabeApps.push(service);});

if(i===listOfPackages.length){
applicationSearch.unparsedListOfAvailabeApps=listOfAvailabeApps;
applicationSearch.parseAppsByCategoryAndName();
$scope.$digest();}}).


fail(function(){
i++;
if(i===listOfPackages.length){
applicationSearch.unparsedListOfAvailabeApps=listOfAvailabeApps;
applicationSearch.parseAppsByCategoryAndName();
$scope.$digest();}});});}).




fail(handleError);

// ON LOAD END ------------------------------------------------------------------------------------

// ON CLICK FUNCTIONS START -----------------------------------------------------------------------

applicationSearch.parseAppsByCategoryAndName=function(){
var filteredApps=_.filter(applicationSearch.unparsedListOfAvailabeApps,function(app){
return nameFilter(app,applicationSearch.nameSearch)&&categoryFilter(app,applicationSearch.category);});

applicationSearch.list=filteredApps;
applicationSearch.doneLoading=true;};


applicationSearch.toggleRequest=function(application){
if(!applicationSearch.packageRequests[application.id]){
applicationSearch.packageRequests[application.id]=application;}else 

{
delete applicationSearch.packageRequests[application.id];}

processNumberOfRequiredApps(applicationSearch.packageRequests[application.id]);};


applicationSearch.getRelatedAndBundled=function($index,application){
if(applicationSearch.detailsLoadingDone[application.id]){
// If we've already loaded the bundled and related apps for this app then we don't do it again
return;}

detailsFetchStep=0;
getBundledApps($index,application);
getRelatedApps($index,application);};


applicationSearch.saveRequestsAndCheckout=function(){
AppRequests.set(applicationSearch.packageRequests);
$state.go('applications.reviewRequest');};


// ON CLICK FUNCTIONS END -------------------------------------------------------------------------
}]);



angular.element(document).ready(function(){
angular.module('app',['common','misc','registration','applications','organization','user']);

angular.module('app').
config(['$urlRouterProvider',function($urlRouterProvider){

// Fixes infinite digest loop with ui-router (do NOT change unless absolutely required)
$urlRouterProvider.otherwise(function($injector){
var $state=$injector.get('$state');
$state.go('welcome');});}]);





angular.module('app').run(['$templateCache',function($templateCache){
'use strict';

$templateCache.put('assets/common-templates/messages.html',
"<div class=cui-error__message ng-message=required>{{'cui-this-field-is-required' | translate}}</div>\n"+
"<div class=cui-error__message ng-message=minlength>{{'cui-this-field-needs-to-be-longer' | translate}}</div>\n"+
"<div class=cui-error__message ng-message=tosRequired>{{'cui-you-need-to-agree-to-toc' | translate}}</div>\n"+
"<div class=cui-error__message ng-message=email>{{'cui-this-is-not-valid-email' | translate}}</div>");



$templateCache.put('assets/common-templates/password-validation.html',
"<p>{{'passwords-must' | translate}}</p>\n"+
"\n"+
"<div class=cui-error__message ng-message=lowercaseNotAllowed>\n"+
"    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.lowercaseNotAllowed}\"></div>\n"+
"    {{'lowercase-not-allowed' | translate}}\n"+
"</div>\n"+
"<div class=cui-error__message ng-message=uppercaseNotAllowed>\n"+
"    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.uppercaseNotAllowed}\"></div>\n"+
"    {{'uppercase-not-allowed' | translate}}\n"+
"</div>\n"+
"<div class=cui-error__message ng-message=numberNotAllowed>\n"+
"    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.numberNotAllowed}\"></div>\n"+
"    {{'numbers-not-allowed' | translate}}\n"+
"</div>\n"+
"<div class=cui-error__message ng-message=specialNotAllowed>\n"+
"    <div class=cui-error__status ng-class=\"{'cui-error__status--pass':!errors.specialNotAllowed}\"></div>\n"+
"    {{'special-not-allowed' | translate}}\n"+
"</div>\n"+
"<div class=cui-error__message ng-message=disallowedWords>\n"+
"    <div class=cui-error__status></div> \n"+
"    {{'words-not-allowed' | translate:errors}}\n"+
"</div>\n"+
"<div class=cui-error__message ng-message=disallowedChars>\n"+
"    <div class=cui-error__status></div>\n"+
"    {{'chars-not-allowed' | translate:errors}}\n"+
"</div>\n"+
"\n"+
"<div class=cui-error__message>\n"+
"    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.length}\"></div>\n"+
"        {{'password-length' | translate:policies}}<br><br>\n"+
"</div>\n"+
"\n"+
"<div class=cui-error__message ng-if=\"policies.requiredNumberOfCharClasses>1\">{{'password-rules' | translate:policies}}<br></div>\n"+
"\n"+
"<div class=cui-error__message ng-if=policies.allowLowerChars>\n"+
"    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.lowercase}\"></div>\n"+
"    {{'password-lowercase' | translate}}\n"+
"</div>\n"+
"<div class=cui-error__message ng-if=policies.allowUpperChars>\n"+
"    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.uppercase}\"></div>\n"+
"    {{'password-uppercase' | translate}}\n"+
"</div>\n"+
"<div class=cui-error__message ng-if=policies.allowNumChars>\n"+
"    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.number}\"></div>\n"+
"    {{'password-number' | translate}}\n"+
"</div>\n"+
"<div class=cui-error__message ng-if=policies.allowSpecialChars>\n"+
"    <div class=cui-error__status ng-class=\"{'cui-error__status--pass': !errors.special}\"></div>\n"+
"    {{'password-special' | translate}}\n"+
"</div>");



$templateCache.put('assets/modules/applications/applications.html',
"<div ui-view class=cui-applications></div>");



$templateCache.put('assets/modules/applications/myApplications/myApplications-details.html',
"<div>\n"+
"  \n"+
"  <div class=cui-action>\n"+
"    <span class=cui-action__title ui-sref=applications.myApplications>{{'my-applications' | translate}}</span>\n"+
"    \n"+
"    <div class=cui-action__actions>\n"+
"      <svg ui-sref=applications.newRequest xmlns=http://www.w3.org/2000/svg class=\"cui-action__icon cui-action__icon--new\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n"+
"        <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#new></use>\n"+
"      </svg>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=\"cui-applications__main-container cui-applications__main-container--full\">\n"+
"    \n"+
"    <div class=cui-loading__container ng-if=!myApplicationDetails.doneLoading>\n"+
"      <div class=cui-loading--center><div class=cui-loading></div></div>\n"+
"    </div>\n"+
"\n"+
"    <div ng-if=myApplicationDetails.doneLoading>\n"+
"      \n"+
"      <div class=\"cui-media cui-media--vertical\">\n"+
"        \n"+
"        <div class=cui-media__image-container>\n"+
"          <a ng-href={{myApplicationDetails.app.mangledUrl}} target=_blank>\n"+
"            <div class=cui-media__image cui-avatar-color-class-prefix=cui-avatar__color cui-avatar-color-count=5 cui-avatar-names=myApplicationDetails.app.name cui-avatar-cuii18n-filter cui-avatar=myApplicationDetails.app.iconUrl></div>\n"+
"          </a>\n"+
"        </div>\n"+
"        \n"+
"        <div>\n"+
"          <h3 class=cui-media__title>{{myApplicationDetails.app.name | cuiI18n}}</h3>\n"+
"          <span class=cui-media__content>{{ 'granted' | translate }}: {{myApplicationDetails.app.grantedDate | date:base.appConfig.dateFormat}}</span>\n"+
"          <span ng-class=\"'cui-status--'+myApplicationDetails.app.status\">{{myApplicationDetails.app.status | uppercase}}</span>\n"+
"        </div>\n"+
"      </div>\n"+
"\n"+
"      \n"+
"      <div class=\"cui-tabs class-toggle\">\n"+
"        <ul class=cui-tabs__nav>\n"+
"          <li class=cui-tabs__tab-container><a class=cui-tabs__tab data-pane=tab1 ng-class=\"{'cui-tabs__tab--active':!myApplicationDetails.inClaims}\" ng-click=\"myApplicationDetails.inClaims=false\">{{'application-details' | translate}}</a></li>\n"+
"          <li class=cui-tabs__tab-container><a class=cui-tabs__tab data-pane=tab2 ng-class=\"{'cui-tabs__tab--active':myApplicationDetails.inClaims}\" ng-click=\"myApplicationDetails.inClaims=true\">{{'my-claims' | translate}}</a></li>\n"+
"        </ul>\n"+
"        <div class=cui-tabs__content>\n"+
"          \n"+
"          <div id=tab1 class=cui-tabs__tab-pane ng-class=\"{'cui-tabs__tab-pane--active':!myApplicationDetails.inClaims}\">\n"+
"            <div class=cui-applications__details>\n"+
"              \n"+
"              <div ng-if=\"myApplicationDetails.bundled.length===0 && myApplicationDetails.related.length===0\">\n"+
"                <p>{{'cui-no-application-details' | translate}}</p>\n"+
"              </div>\n"+
"              \n"+
"              <div ng-if=\"myApplicationDetails.bundled.length!==0\">\n"+
"                <h4 class=h6>{{'bundled-applications' | translate}}</h4>\n"+
"                <div class=cui-media ng-repeat=\"application in myApplicationDetails.bundled\">\n"+
"                  <div class=cui-media__body>\n"+
"                    <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n"+
"                    <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n"+
"                    <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate | date:base.appConfig.dateFormat}}</span> \n"+
"                    <span ng-if=!application.status>{{'request' | translate}}</span>\n"+
"                  </div>\n"+
"                  <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n"+
"                </div>\n"+
"              </div>\n"+
"              \n"+
"              <div ng-if=\"myApplicationDetails.related.length!==0\">\n"+
"                <h4 class=h6>{{'related-applications' | translate}}</h4>\n"+
"                <div class=cui-media ng-repeat=\"application in myApplicationDetails.related\">\n"+
"                  <div class=cui-media__body>\n"+
"                    <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n"+
"                    <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n"+
"                    <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate | date:base.appConfig.dateFormat}}</span> \n"+
"                    <span ng-if=!application.status>{{'request' | translate}}</span>\n"+
"                  </div>\n"+
"                  <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n"+
"                </div>\n"+
"              </div>\n"+
"            </div>\n"+
"          </div>\n"+
"\n"+
"          \n"+
"          <div id=tab2 class=cui-tabs__tab-pane ng-class=\"{'cui-tabs__tab-pane--active':myApplicationDetails.inClaims}\">\n"+
"            <p ng-if=!myApplicationDetails.claims>{{'cui-no-claims' | translate}}</p>\n"+
"            <span ng-repeat=\"claim in myApplicationDetails.claims.packageClaims\">\n"+
"              <p ng-repeat=\"claimValue in claim.claimValues\">{{claimValue.name | cuiI18n}}</p>\n"+
"            </span>\n"+
"          </div>\n"+
"        </div>\n"+
"      </div>\n"+
"\n"+
"      \n"+
"      <div class=cui-applications__desktop-tabs>\n"+
"\n"+
"        \n"+
"        <div class=\"cui-tile cui-applications__left\">\n"+
"          <h4 class=\"cui-tile__title cui-applications__title\">{{'application-details' | translate}}</h4>\n"+
"          <div class=\"cui-tile__body cui-applications__details\">\n"+
"            \n"+
"            <div ng-if=\"myApplicationDetails.bundled.length===0 && myApplicationDetails.related.length===0\">\n"+
"              <p>{{'cui-no-application-details' | translate}}</p>\n"+
"            </div>\n"+
"            \n"+
"            <div ng-if=\"myApplicationDetails.bundled.length!==0\">\n"+
"              <h4 class=h6>{{'bundled-applications' | translate}}</h4>\n"+
"              <div class=cui-media ng-repeat=\"application in myApplicationDetails.bundled\">\n"+
"                <div class=cui-media__body>\n"+
"                  <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n"+
"                  <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n"+
"                  <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate | date:base.appConfig.dateFormat}}</span> \n"+
"                  <span ng-if=!application.status>{{'request' | translate}}</span>\n"+
"                </div>\n"+
"                <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n"+
"              </div>\n"+
"            </div>\n"+
"            \n"+
"            <div ng-if=\"myApplicationDetails.related.length!==0\">\n"+
"              <h4 class=h6>{{'related-applications' | translate}}</h4>\n"+
"                <div class=cui-media ng-repeat=\"application in myApplicationDetails.related\">\n"+
"                  <div class=cui-media__body>\n"+
"                    <a class=cui-media__link ng-click=myApplicationDetails.goToDetails(application) ng-if=application.status>{{application.name | cuiI18n}}</a> \n"+
"                    <span class=cui-media__content ng-if=!application.status>{{application.name | cuiI18n}}</span>\n"+
"                    <span class=cui-media__content ng-if=application.grantedDate>{{ 'granted' | translate }}: {{application.grantedDate | date:base.appConfig.dateFormat}}</span> \n"+
"                    <span class=cui-button ng-if=!application.status>{{'request' | translate}}</span>\n"+
"                  </div>\n"+
"                  <span class=cui-media__status ng-class=\"'cui-status--'+application.status\" ng-if=application.status>{{application.status | uppercase}}</span>  \n"+
"                </div>\n"+
"              </div>\n"+
"            </div>\n"+
"          </div>\n"+
"\n"+
"          \n"+
"          <div class=\"cui-tile cui-applications__right\">\n"+
"            <h4 class=\"cui-tile__title cui-tile__title--bg-light cui-applications__title\">{{'my-claims' | translate}}</h4>\n"+
"            <div class=cui-tile__body>\n"+
"              <p ng-if=!myApplicationDetails.claims>{{'cui-no-claims' | translate}}</p>\n"+
"              <span ng-repeat=\"claim in myApplicationDetails.claims.packageClaims\">\n"+
"                <p ng-repeat=\"claimValue in claim.claimValues\">{{claimValue.name | cuiI18n}}</p>\n"+
"              </span>\n"+
"            </div>\n"+
"          </div>\n"+
"\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n");



$templateCache.put('assets/modules/applications/myApplications/myApplications.html',
"<div class=cui-action>\n"+
"  <span class=cui-action__title>\n"+
"    <a ui-sref=applications.orgApplications class=\"cui-link--medium-light cui-link--no-decoration\">{{'organization-applications' | translate}}</a> | \n"+
"    <a ui-sref=applications.myApplications class=\"cui-link--medium-light cui-link--no-decoration\">{{'my-applications' | translate}}</a>\n"+
"  </span>\n"+
"  <div class=cui-action__actions>\n"+
"    \n"+
"    <div class=cui-action__action-container ng-click=\"myApplications.sortClicked =! myApplications.sortClicked\" id=sort-button off-click=\"myApplications.sortClicked=false\">\n"+
"      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"        <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#sort14></use>\n"+
"      </svg>\n"+
"      <span class=cui-action__action-label>{{'sort' | translate}}</span>\n"+
"      \n"+
"      <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#sort-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=myApplications.sortClicked>\n"+
"        <p ng-click=\"myApplications.sort('alphabetically')\">{{'cui-alphabetically' | translate}}</p>\n"+
"        <p ng-click=\"myApplications.sort('date'); \">{{'cui-by-date-added' | translate}}</p>\n"+
"      </div>\n"+
"    </div>\n"+
"    \n"+
"    <div class=cui-action__action-container ng-click=\"myApplications.refineClicked =! myApplications.refineClicked\" id=refine-button off-click=\"myApplications.refineClicked=false\">\n"+
"      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"        <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#filter10></use>\n"+
"      </svg>\n"+
"      <span class=cui-action__action-label>{{'refine' | translate}}</span>\n"+
"      \n"+
"      <div class=\"cui-popover cui-popover--top cui-popover__refine-popover\" tether target=#refine-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=myApplications.refineClicked>\n"+
"        <p ng-click=\"myApplications.parseAppsByStatus('all')\">{{'all' | translate}} ({{myApplications.statusCount[0]}})</p>\n"+
"        <div ng-repeat=\"status in myApplications.statusList\" ng-if=\"myApplications.statusCount[$index+1]!==0\">\n"+
"          <p ng-click=myApplications.parseAppsByStatus(status)>{{status | translate}} ({{myApplications.statusCount[$index+1]}})</p>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"    \n"+
"    <div class=cui-action__action-container ng-click=\"myApplications.categoriesClicked =! myApplications.categoriesClicked\" id=categories-button off-click=\"myApplications.categoriesClicked=false\">\n"+
"      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 48\">\n"+
"        <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#categories></use>\n"+
"      </svg>\n"+
"      <span class=cui-action__action-label>{{'categories' | translate}}</span>\n"+
"      \n"+
"      <div class=\"cui-popover cui-popover--top cui-popover__categories-popover\" tether target=#categories-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=myApplications.categoriesClicked>\n"+
"        <p ng-click=\"myApplications.parseAppsByCategory('all')\">{{'all' | translate}} ({{myApplications.categoryCount[0]}})</p>\n"+
"        <div ng-repeat=\"category in myApplications.categoryList\">\n"+
"          <p ng-click=myApplications.parseAppsByCategory(category)>{{category| cuiI18n}} ({{myApplications.categoryCount[$index+1]}})</p>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"    <svg ui-sref=applications.newRequest xmlns=http://www.w3.org/2000/svg class=\"cui-action__icon cui-action__icon--new\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n"+
"      <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#new></use>\n"+
"    </svg>\n"+
"  </div>\n"+
"</div>\n"+
"\n"+
"<div class=cui-applications__main-container>\n"+
"  <div class=cui-loading__container ng-if=!myApplications.doneLoading>\n"+
"    <div class=cui-loading--center><div class=cui-loading></div></div>\n"+
"  </div>\n"+
"  <div class=sorting>\n"+
"    \n"+
"  </div>\n"+
"  <div ng-if=myApplications.doneLoading>\n"+
"    <div class=\"cui-media cui-media--border cui-media--tr\" ng-repeat=\"application in myApplications.list track by application.id\">\n"+
"      <div class=cui-media__image-container>\n"+
"        <a ng-href={{application.mangledUrl}} target=_blank><div class=cui-media__image cui-avatar-color-class-prefix=cui-avatar__color cui-avatar-color-count=5 cui-avatar-names=application.name cui-avatar-cuii18n-filter cui-avatar=application.iconUrl></div></a>\n"+
"      </div>\n"+
"      <div class=\"cui-media__body cui-media__body--full\">\n"+
"        <div class=cui-media__title-container>\n"+
"          <a class=cui-media__app-launch ng-class=\"'cui-media__app-launch--'+application.status\" href={{application.urls[0].value}} title=\"launch application\" aria-labelledby=\"launch application\" target=_blank><cui-icon cui-svg-icon=cui:launch svg-class=cui-media__app-launch-icon viewbox=\"0 0 35 48\" preserveaspectratio=\"xMidYMid meet\"></cui-icon></a>\n"+
"          <h3 class=cui-media__title ng-bind=\"application.name | cuiI18n\" ng-click=myApplications.goToDetails(application)></h3>\n"+
"        </div>\n"+
"        \n"+
"        <span class=cui-media__content> {{application.category | cuiI18n}}</span>\n"+
"        <span class=cui-status ng-class=\"'cui-status--'+application.status\" ng-bind=\"application.status | lowercase\"></span>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/applications/newRequestReview/newRequest.html',
"<div class=cui-applications__new-request>\n"+
"    <div class=cui-action>\n"+
"        <div class=cui-action__title>{{'new-request' | translate}}</div>\n"+
"        <div class=cui-action__actions>\n"+
"            <svg ui-sref=applications.myApplications xmlns=http://www.w3.org/2000/svg class=\"cui-action__icon cui-action__icon--close\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n"+
"              <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close></use>\n"+
"            </svg>\n"+
"        </div>\n"+
"    </div>\n"+
"    <div class=\"cui-action cui-action--alt\">\n"+
"        <h3 class=cui-action__title>{{'select-applications' | translate}}</h3>\n"+
"        <div class=cui-action__actions>\n"+
"            <svg ng-click=\"newAppRequest.requestPopover=!newAppRequest.requestPopover\" off-click=\"newAppRequest.requestPopover=false\" xmlns=http://www.w3.org/2000/svg id=cui-applications__requested-apps class=\"cui-icon cui-icon--folder\" ng-class=\"{'cui-action__icon--active': newAppRequest.numberOfRequests != 0}\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 40 33\">\n"+
"              <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#folder></use>\n"+
"            </svg>\n"+
"            <sup class=cui-action__icon-counter ng-class=\"{'cui-action__icon-counter--active': newAppRequest.numberOfRequests != 0}\">{{newAppRequest.numberOfRequests}}</sup>\n"+
"            \n"+
"            <div tether class=cui-action__popover target=#cui-applications__requested-apps attachment=\"top middle\" targetattachment=\"bottom left\" offset=\"-20px 50px\" ng-if=newAppRequest.requestPopover constraints=\"[{to:'scrollParent',attachment:'together',pin:['right']}]\">\n"+
"              <span class=cui-action__popover-title>{{'collected-items-for-request' | translate}}</span>\n"+
"              <div class=cui-action__popover-section>\n"+
"                <span ng-if=\"newAppRequest.appsBeingRequested.length===0\">{{'no-selected-apps' | translate}}<br></span>\n"+
"                <ul ng-if=\"newAppRequest.appsBeingRequested.length > 0\">\n"+
"                    <li ng-repeat=\"application in newAppRequest.appsBeingRequested\">{{application.name | cuiI18n}}</li>\n"+
"                </ul>\n"+
"              </div>\n"+
"              <span ng-if=\"newAppRequest.appsBeingRequested.length > 0\" class=cui-action__popover-button ui-sref=applications.reviewRequest>{{'submit-request' | translate}}</span>\n"+
"            </div>\n"+
"        </div>\n"+
"    </div>\n"+
"    <div class=cui-applications__main-container>\n"+
"        <div>\n"+
"            <div class=cui-applications__search-options>\n"+
"                <div class=cui-input-button>\n"+
"                    <input type=text class=cui-input-button__input ng-model=newAppRequest.search placeholder=\"{{'search-by-app-name' | translate}}\" on-enter=\"newAppRequest.searchCallback\">\n"+
"                    <button class=cui-input-button__button ui-sref=applications.search({name:newAppRequest.search})>{{'go' | translate}}</button>\n"+
"                </div>\n"+
"                <div class=cui-applications__center-text>{{'or' | translate}}</div>\n"+
"                <button class=\"cui-button cui-button--full-width\" ui-sref=applications.search>{{'browse-applications' | translate}}</button>\n"+
"                \n"+
"            </div>\n"+
"            <div ng-if=!newAppRequest.loadingDone> \n"+
"                <div class=cui-loading__container ng-if=!myApplicationDetails.doneLoading>\n"+
"                    <div class=cui-loading--center><div class=cui-loading></div></div>\n"+
"                </div>\n"+
"            </div>\n"+
"            <div ng-repeat=\"category in newAppRequest.categories\" ng-if=newAppRequest.loadingDone>\n"+
"                \n"+
"                <div class=cui-applications__categories ui-sref=\"applications.search({category:'{{ category | cuiI18n }}' })\">\n"+
"                    <h4 class=cui-applications__category>{{ category | cuiI18n }}</h4>\n"+
"                    <svg xmlns=http://www.w3.org/2000/svg class=\"cui-icon cui-icon--light-grey\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"                      <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#chevron18></use>\n"+
"                    </svg>\n"+
"                </div>\n"+
"            </div>\n"+
"        </div>\n"+
"    </div>\n"+
"</div>");



$templateCache.put('assets/modules/applications/newRequestReview/review.html',
"<div class=\"class-toggle cui-modal\" ng-if=\"applicationReview.success\" toggled-class=\"cui-modal--hide\" ng-click=\"toggleClass()\">\n"+
"    <div class=\"cui-modal__pane\">\n"+
"        <div class=\"cui-modal__icon\">\n"+
"            <cui-icon cui-svg-icon=\"cui:check-with-border\" class=\"cui-modal__icon\"></cui-icon>\n"+
"        </div>\n"+
"        <span class=\"cui-modal__primary-message\">{{'cui-success' | translate}}</span>\n"+
"        <span class=\"cui-modal__secondary-message\">{{'your-app-request-in-review' | translate}}</span>\n"+
"    </div>\n"+
"</div>\n"+
"<div class=\"code-info\">Code for this page can be found <a class=\"cui-link\" href=\"https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/applications/mew-request&review\" target=\"blank\">here</a> and the layout styles <a href=\"https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/applications.scss\" class=\"cui-link\" target=\"blank\">here</a></div>\n"+
"<div class=\"cui-applications__review\">\n"+
"    <div class=\"cui-action\">\n"+
"        <div class=\"cui-action__title\">{{'new-request' | translate}}</div>\n"+
"        <div class=\"cui-action__actions\">\n"+
"            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-action__icon cui-action__icon--close\" ui-sref=\"applications.myApplications\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n"+
"              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#close\"></use>\n"+
"            </svg>\n"+
"        </div>\n"+
"    </div>\n"+
"    <div class=\"cui-action cui-action--alt\">\n"+
"        <div class=\"cui-action__title\" ng-if=\"!applicationSearch.category\" ng-click=\"base.goBack()\">< {{'new-request' | translate}}</div>\n"+
"        <span class=\"cui-action__title\" ng-if=\"applicationSearch.category\" ng-click=\"base.goBack()\">< {{applicationSearch.category}}</span>\n"+
"        <div class=\"cui-input-button cui-input-button--alt-bg\">\n"+
"            <input class=\"cui-input-button__input\" ng-model=\"applicationSearch.nameSearch\" ng-keypress=\"applicationSearch.listenForEnter($event)\" placeholder=\"{{'filter-list' | translate}}\"/>\n"+
"            <button class=\"cui-input-button__button\" ng-click=\"applicationSearch.parseAppsByCategoryAndName()\">{{'filter' | translate}}</button>\n"+
"        </div>\n"+
"        <div class=\"cui-action__actions\">\n"+
"            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-icon--folder\" ng-class=\"{'cui-action__icon--active': applicationReview.numberOfRequests != 0}\"preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 40 33\">\n"+
"              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#folder\"></use>\n"+
"            </svg>\n"+
"            <sup class=\"cui-action__icon-counter\" ng-class=\"{'cui-action__icon-counter--active': applicationReview.numberOfRequests != 0}\">{{applicationReview.numberOfRequests}}</sup>\n"+
"        </div>\n"+
"    </div>\n"+
"    <div class=\"cui-applications__main-container\" style=\"position:relative\">\n"+
"        <div class=\"cui-loading__container\" ng-if=\"applicationReview.attempting\">\n"+
"          <div class=\"cui-loading cui-loading--center\" ></div>\n"+
"        </div>\n"+
"            <div>\n"+
"                <h3 class=\"h4 h4--bold\">{{'requested-items' | translate}}:</h3>\n"+
"                <div class=\"cui-applications__review-apps\">\n"+
"                 <div class=\"cui-tile--headless\" ng-repeat=\"applicationGroup in applicationReview.appRequests\">\n"+
"                    <div ng-repeat=\"application in applicationGroup\" ng-if=\"application.name\"> <!-- Put the flex wrapper here @shane -->\n"+
"                        <div class=\"cui-media\">\n"+
"                          <!-- Image container to be added when images are available\n"+
"                          <div class=\"cui-media__image-container\">\n"+
"                            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-media__image\">\n"+
"                              <use xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#user\"></use>\n"+
"                            </svg>\n"+
"                          </div> -->\n"+
"                          <div class=\"cui-media__body\">\n"+
"                            <h3 class=\"cui-media__title\">{{application.name | cuiI18n}}</h3>\n"+
"                            <span class=\"cui-media__content\">{{'owning-org' | translate}}: {{application.owningOrganization.name}}</span>\n"+
"                          </div>\n"+
"                        </div>\n"+
"                        <!-- Terms and conditions is not provided by the API, leaving it out for now -->\n"+
"                        <div class=\"cui-applications__review-text-input\">\n"+
"                            <label class=\"cui-text-area__label\">{{'request-reason' | translate}}</label>\n"+
"                            <span class=\"cui-error h6\" ng-if=\"application.reasonRequired\">{{'you-must-enter-a-reason' | translate}}</span>\n"+
"                            <textarea class=\"cui-text-area\" ng-model=\"application.reason\" ng-class=\"{'<!-- @shane textarea invalid class here -->' : application.reasonRequired}\"></textarea>\n"+
"                        </div>\n"+
"                    </div>\n"+
"                </div>\n"+
"                </div>\n"+
"                <div class=\"cui-applications__submit-options\">\n"+
"                    <a class=\"cui-link\" ng-click=\"base.goBack()\">{{'cui-cancel' | translate}}</a>\n"+
"                    <button class=\"cui-button\" ng-click=\"applicationReview.submit()\">\n"+
"                        <span ng-if=\"!applicationReview.error\">{{'submit-request' | translate}}</span>\n"+
"                        <span ng-if=\"applicationReview.error===true\">{{'cui-error-try-again' | translate}}</span>\n"+
"                    </button>\n"+
"                </div>\n"+
"                <!-- @shane ng-if=\"applicationReview.attempting\" is when submit gets pressed and it's trying to submit the requests  ^ put a spinner on the button-->\n"+
"                <!-- if there's an error ng-if=\"applicationReview.error\" -->\n"+
"                <!-- if it's successful ng-if=\"applicationReview.success\" -->\n"+
"\n"+
"            </div>\n"+
"        </div>\n"+
"    </div>\n"+
"</div>");



$templateCache.put('assets/modules/applications/orgApplications/orgApplications.html',
"\n"+
"<div class=cui-action>\n"+
"  <span class=cui-action__title>\n"+
"    <a ui-sref=applications.orgApplications class=\"cui-link--medium-light cui-link--no-decoration\">{{'organization-applications' | translate}}</a> | \n"+
"    <a ui-sref=applications.myApplications class=\"cui-link--medium-light cui-link--no-decoration\">{{'my-applications' | translate}}</a>\n"+
"  </span>\n"+
"  <div class=cui-action__actions>\n"+
"    \n"+
"    <div class=cui-action__action-container ng-click=\"orgApplications.sortClicked =! orgApplications.sortClicked\" id=sort-button off-click=\"orgApplications.sortClicked=false\">\n"+
"      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"        <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#sort14></use>\n"+
"      </svg>\n"+
"      <span class=cui-action__action-label>{{'sort' | translate}}</span>\n"+
"      \n"+
"      <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#sort-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgApplications.sortClicked>\n"+
"        <p ng-click=\"orgApplications.sort('alphabetically')\">{{'cui-alphabetically' | translate}}</p>\n"+
"        <p ng-click=\"orgApplications.sort('date'); \">{{'cui-by-date-added' | translate}}</p>\n"+
"      </div>\n"+
"    </div>\n"+
"    \n"+
"    <div class=cui-action__action-container ng-click=\"orgApplications.refineClicked =! orgApplications.refineClicked\" id=refine-button off-click=\"orgApplications.refineClicked=false\">\n"+
"      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"        <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#filter10></use>\n"+
"      </svg>\n"+
"      <span class=cui-action__action-label>{{'refine' | translate}}</span>\n"+
"      \n"+
"      <div class=\"cui-popover cui-popover--top cui-popover__refine-popover\" tether target=#refine-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgApplications.refineClicked>\n"+
"        <p ng-click=\"orgApplications.parseAppsByStatus('all')\">{{'all' | translate}} ({{orgApplications.statusCount[0]}})</p>\n"+
"        <div ng-repeat=\"status in orgApplications.categoryList\" ng-if=\"orgApplications.statusCount[$index+1]!==0\">\n"+
"          <p ng-click=orgApplications.parseAppsByStatus(status)>{{status | translate}} ({{orgApplications.statusCount[$index+1]}})</p>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"    \n"+
"    <div class=cui-action__action-container ng-click=\"orgApplications.categoriesClicked =! orgApplications.categoriesClicked\" id=categories-button off-click=\"orgApplications.categoriesClicked=false\">\n"+
"      <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 48\">\n"+
"        <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#categories></use>\n"+
"      </svg>\n"+
"      <span class=cui-action__action-label>{{'categories' | translate}}</span>\n"+
"      \n"+
"      <div class=\"cui-popover cui-popover--top cui-popover__categories-popover\" tether target=#categories-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgApplications.categoriesClicked>\n"+
"        <p ng-click=\"orgApplications.parseAppsByCategory('all')\">{{'all' | translate}} ({{orgApplications.categoryCount[0]}})</p>\n"+
"        <div ng-repeat=\"category in orgApplications.categoryList\">\n"+
"          <p ng-click=orgApplications.parseAppsByCategory(category)>{{category| cuiI18n}} ({{orgApplications.categoryCount[$index+1]}})</p>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"    <svg ui-sref=applications.newRequest xmlns=http://www.w3.org/2000/svg class=\"cui-action__icon cui-action__icon--new\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n"+
"      <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#new></use>\n"+
"    </svg>\n"+
"  </div>\n"+
"</div>\n"+
"\n"+
"\n"+
"<div class=cui-applications__main-container>\n"+
"  \n"+
"  <div class=cui-loading__container ng-if=orgApplications.loading>\n"+
"    <div class=cui-loading--center><div class=cui-loading></div></div>\n"+
"  </div>\n"+
"\n"+
"  <div ng-if=!orgApplications.loading>\n"+
"    <div class=\"cui-media cui-media--border cui-media--tr\" ng-repeat=\"application in orgApplications.appList track by application.id\" ng-click=orgApplications.goToDetails(application)>\n"+
"      <div class=cui-media__image-container>\n"+
"        <a ng-href={{application.mangledUrl}} target=_blank><div class=cui-media__image cui-avatar-color-class-prefix=cui-avatar__color cui-avatar-color-count=5 cui-avatar-names=application.name cui-avatar-cuii18n-filter cui-avatar=application.iconUrl></div></a>\n"+
"      </div>\n"+
"      <div class=\"cui-media__body cui-media__body--full\">\n"+
"        <div class=cui-media__title-container>\n"+
"          <a class=cui-media__app-launch ng-class=\"'cui-media__app-launch--'+application.status\" href={{application.urls[0].value}} title=\"launch application\" aria-labelledby=\"launch application\" target=_blank><cui-icon cui-svg-icon=cui:launch svg-class=cui-media__app-launch-icon viewbox=\"0 0 35 48\" preserveaspectratio=\"xMidYMid meet\"></cui-icon></a>\n"+
"          <h3 class=cui-media__title ng-bind=\"application.name | cuiI18n\"></h3>\n"+
"        </div>\n"+
"        <span class=cui-media__content ng-if=application.category> {{application.category | cuiI18n}}</span>\n"+
"        <span class=cui-status ng-class=\"'cui-status--'+application.status\" ng-bind=\"application.status | lowercase\"></span>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/applications/search/applicationSearch.html',
"\n"+
"<div class=\"cui-applications__search\">\n"+
"    <div class=\"cui-action\">\n"+
"        <div class=\"cui-action__title\">{{'new-request' | translate}}</div>\n"+
"        <div class=\"cui-action__actions\">\n"+
"            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-action__icon cui-action__icon--close\" ui-sref=\"applications.myApplications\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n"+
"              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#close\"></use>\n"+
"            </svg>\n"+
"        </div>\n"+
"    </div>\n"+
"    <div class=\"cui-action cui-action--alt\">\n"+
"        <div class=\"cui-action__title\" ng-if=\"!applicationSearch.category\" ui-sref=\"applications.newRequest\"><\n"+
"            {{'categories' | translate}}</div>\n"+
"        <span class=\"cui-action__title\" ng-if=\"applicationSearch.category\" ui-sref=\"applications.newRequest\">< {{applicationSearch.category}}</span>\n"+
"        <div class=\"cui-input-button cui-input-button--alt-bg\">\n"+
"            <input class=\"cui-input-button__input\" ng-model=\"applicationSearch.nameSearch\" placeholder=\"{{'filter-list' | translate}}\" on-enter=\"applicationSearch.parseAppsByCategoryAndName\"/>\n"+
"            <button class=\"cui-input-button__button\" ng-click=\"applicationSearch.parseAppsByCategoryAndName()\">{{'filter' | translate}}</button>\n"+
"        </div>\n"+
"        <div class=\"cui-action__actions\">\n"+
"            <svg ng-click=\"applicationSearch.requestPopover=!applicationSearch.requestPopover\" off-click=\"applicationSearch.requestPopover=false\" xmlns=\"http://www.w3.org/2000/svg\" id=\"cui-applications__requested-apps\" class=\"cui-icon--folder\" ng-class=\"{'cui-action__icon--active': applicationSearch.numberOfRequests != 0}\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 40 33\">\n"+
"              <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#folder\"></use>\n"+
"            </svg>\n"+
"            <sup class=\"cui-action__icon-counter\" ng-class=\"{'cui-action__icon-counter--active': applicationSearch.numberOfRequests != 0}\">{{applicationSearch.numberOfRequests}} </sup>\n"+
"\n"+
"            <div tether class=\"cui-action__popover\" target=\"#cui-applications__requested-apps\" attachment=\"top middle\" targetAttachment=\"bottom left\" offset=\"-20px 50px\" ng-if=\"applicationSearch.requestPopover\">\n"+
"              <span class=\"cui-action__popover-title\">{{'collected-items-for-request' | translate}}</span>\n"+
"              <div class=\"cui-action__popover-section\">\n"+
"                <span ng-if=\"applicationSearch.numberOfRequests === 0\">{{'no-selected-apps' | translate}}<br/></span>\n"+
"                <ul ng-if=\"applicationSearch.numberOfRequests > 0\">\n"+
"                    <li ng-repeat=\"(key,value) in applicationSearch.packageRequests\">{{value.name | cuiI18n}}</li>\n"+
"                </ul>\n"+
"              </div>\n"+
"              <span ng-if=\"applicationSearch.numberOfRequests > 0\" class=\"cui-action__popover-button\" ui-sref=\"applications.reviewRequest\">{{'submit-request' | translate}}</span>\n"+
"            </div>\n"+
"        </div>\n"+
"    </div>\n"+
"    <div class=\"cui-applications__main-container\">\n"+
"        <div class=\"cui-loading__container\" ng-if=\"!applicationSearch.doneLoading\">\n"+
"            <div class=\"cui-loading--center\"><div class=\"cui-loading\"></div></div>\n"+
"        </div>\n"+
"        <cui-expandable class=\"cui-expandable\" ng-repeat=\"application in applicationSearch.list track by application.id\" ng-if=\"applicationSearch.doneLoading\" transition-speed=\"150\">\n"+
"            <cui-expandable-title class=\"cui-expandable__title cui-expandable__title--flex\" >\n"+
"                <!-- @Shane, right now the above ng-click triggers when you click the checkbox, move that ng-click wherever you see appropriate -->\n"+
"                <!-- application image -->\n"+
"                <div class=\"cui-applications__expandable-info\" ng-click=\"toggleExpand();!applicationSearch.detailsLoadingDone[application.id] && applicationSearch.getRelatedAndBundled($index,application);\">\n"+
"                    <h3 class=\"cui-expandable__title-left\">{{application.name | cuiI18n}}</h3>\n"+
"                    <span class=\"cui-expandable__title-middle\" ng-if=\"application.orgHasGrants\">{{'granted-to-my-org' | translate}}</span>\n"+
"                    <div></div>\n"+
"                </div>\n"+
"                <!-- Not sure what the exclamation mark bubble means or what triggers it, but you can put it in here @Shane, I'll come back to this once we get an answer -->\n"+
"                <!-- TODO Figure out above ^  (leave this so I can find it later)-->\n"+
"                <div class=\"cui-expandable__title-end\">\n"+
"                    <span class=\"cui-checkbox__container\">\n"+
"                        <input class=\"cui-checkbox\" type=\"checkbox\" ng-model=\"applicationSearch.appCheckbox[application.id]\" />\n"+
"                        <label class=\"cui-checkbox__label\" ng-click=\"applicationSearch.appCheckbox[application.id]=!applicationSearch.appCheckbox[application.id]; applicationSearch.toggleRequest(application)\"></label>\n"+
"                    </span>\n"+
"                </div>\n"+
"            </cui-expandable-title>\n"+
"            <cui-expandable-body class=\"cui-expandable__body\">\n"+
"                <div class=\"cui-expandable__body-pane\">\n"+
"                    <span class=\"cui-expandable__body-close\" ng-click=\"collapse()\">\n"+
"                        <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"cui-icon\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\">\n"+
"                          <use class=\"cui-icon__ref\" xlink:href=\"bower_components/cui-icons/dist/icons/icons-out.svg#close\"></use>\n"+
"                        </svg>\n"+
"                    </span>\n"+
"                    <div class=\"cui-loading__container\" ng-if=\"!applicationSearch.detailsLoadingDone[application.id]\"> <!-- @Shane, this loading seems to be overlapping the expandable title -->\n"+
"                        <div class=\"cui-loading--center\"><div class=\"cui-loading\"></div></div>\n"+
"                    </div>\n"+
"                    <div class=\"cui-expandable__pane-col\" ng-if=\"application.details.bundled.length!==0\">\n"+
"                        <h4 class=\"cui-expandable__pane-title\">{{'bundled-applications' | translate}}</h4>\n"+
"                        <div class=\"cui-expandable__pane-content\">\n"+
"                            <span ng-repeat=\"bundledApp in application.details.bundled\" ng-if=\"application.details.bundled.length!==0\">\n"+
"                                {{bundledApp.name | cuiI18n}}\n"+
"                            </span>\n"+
"                        </div>\n"+
"                    </div>\n"+
"                    <div class=\"cui-expandable__pane-col\" ng-if=\"application.details.related.length!==0\">\n"+
"                        <h4 class=\"cui-expandable__pane-title\">{{'related-applications' | translate}}</h4>\n"+
"                        <div class=\"cui-expandable__pane-content\">\n"+
"                            <span class=\"cui-expandable__pane-content-item\" ng-repeat=\"relatedApp in application.details.related\">\n"+
"                                <span class=\"\">{{relatedApp.name | cuiI18n}} </span>\n"+
"                                <span class=\"cui-checkbox__container\">\n"+
"                                    <input class=\"cui-checkbox\" type=\"checkbox\" ng-model=\"applicationSearch.appCheckbox[relatedApp.id]\" />\n"+
"                                    <label class=\"cui-checkbox__label\" ng-click=\"applicationSearch.appCheckbox[relatedApp.id]=!applicationSearch.appCheckbox[relatedApp.id]; applicationSearch.toggleRequest(relatedApp)\"></label>\n"+
"                                </span>\n"+
"                            </span>\n"+
"\n"+
"                        </div>\n"+
"                    </div>\n"+
"                </div>\n"+
"            </cui-expandable-body>\n"+
"        </cui-expandable>\n"+
"        <div class=\"cui-applications__search-button\">\n"+
"            <button class=\"cui-button\" ng-class=\"{'cui-button--error' : applicationSearch.numberOfRequests===0}\" ng-click=\"applicationSearch.numberOfRequests != 0 && applicationSearch.saveRequestsAndCheckout()\">{{'review-request' | translate}}</button>\n"+
"        </div>\n"+
"    </div>\n"+
"</div>\n"+
"\n");



$templateCache.put('assets/modules/common/empty/empty.html',
"<div ui-view></div>");



$templateCache.put('assets/modules/misc/status/status-404.html',
"<div class=cui-tile>\n"+
"	<div class=cui-tile__title>{{'cui-page-not-found' | translate}}</div>\n"+
"	<div class=cui-tile__body>\n"+
"		<div class=misc-body>\n"+
"			<h1>{{'cui-page-not-found' | translate}}.</h1>\n"+
"			<div class=cui-card__image-container>\n"+
"      	<svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n"+
"          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#ask-file></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"			<p>{{'cui-page-not-found-content' | translate}}</p>\n"+
"		</div>\n"+
"		<button class=cui-card__button ui-sref=welcome>{{ 'cui-home' | translate }}</button>\n"+
"	</div>\n"+
"</div>");



$templateCache.put('assets/modules/misc/status/status-notAuth.html',
"<div class=cui-tile>\n"+
"	<div class=cui-tile__title>{{'cui-access-denied' | translate}}</div>\n"+
"	<div class=cui-tile__body>\n"+
"		<div class=misc-body>\n"+
"			<h1>{{'cui-access-denied' | translate}}.</h1>\n"+
"			<div class=cui-card__image-container>\n"+
"        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n"+
"          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#not-authorized></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"			<p>{{'cui-access-denied-content' | translate}}</p>\n"+
"		</div>\n"+
"		<button class=cui-card__button ui-sref=welcome>{{ 'cui-home' | translate }}</button>\n"+
"	</div>\n"+
"</div>");



$templateCache.put('assets/modules/misc/status/status-pendingStatus.html',
"<div class=cui-tile>\n"+
"	<div class=cui-tile__title>{{'cui-registration-status' | translate}}</div>\n"+
"	<div class=cui-tile__body>\n"+
"		<div class=misc-body>\n"+
"			<h1>{{'cui-pending-status' | translate}}...</h1>\n"+
"			<div class=cui-card__image-container>\n"+
"        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n"+
"          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#status-pending></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"			<p>{{'cui-pending-status-content' | translate}}</p>\n"+
"			<p>{{'cui-thank-you' | translate}}!</p>\n"+
"		</div>\n"+
"		<button class=cui-card__button ui-sref=welcome>{{ 'cui-home' | translate }}</button>\n"+
"	</div>\n"+
"</div>");



$templateCache.put('assets/modules/misc/status/status-success.html',
"<div class=cui-tile>\n"+
"	<div class=cui-tile__title>{{'cui-request-submitted' | translate}}</div>\n"+
"	<div class=cui-tile__body>\n"+
"		<div class=misc-body>\n"+
"			<h1>{{'cui-success' | translate}}!</h1>\n"+
"			<div class=cui-card__image-container>\n"+
"        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n"+
"          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#success></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"			<p>{{'cui-success-content' | translate}}</p>\n"+
"			<p>{{'cui-check-your' | translate}} <a href=\"\">{{'cui-registration-status-lower' | translate}}</a>.</p>\n"+
"		</div>\n"+
"		<button class=cui-card__button ui-sref=welcome>{{ 'cui-home' | translate }}</button>\n"+
"	</div>\n"+
"</div>");



$templateCache.put('assets/modules/misc/status/status.html',
"<div ui-view></div>");



$templateCache.put('assets/modules/misc/welcome/welcome.html',
"<div class=welcome-wrapper>\n"+
"\n"+
"  \n"+
"  <div class=welcome-title>\n"+
"    <h1>{{ 'welcome-title' | translate }}:</h1>\n"+
"  </div>\n"+
"\n"+
"  <div class=cui-card__container>\n"+
"    \n"+
"    <div class=cui-card>\n"+
"      <div class=cui-card__image-container>\n"+
"        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n"+
"          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#skyscraper></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"      <div class=cui-card__content>\n"+
"        <p class=cui-card__content-header>{{ 'cui-new-TLO' | translate }}</p>\n"+
"        <p>{{ 'cui-new-TLO-description' | translate }}</p>\n"+
"      </div>\n"+
"      <button class=cui-card__button ui-sref=registration.tlo>{{ 'cui-sign-up' | translate }}</button>\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=cui-card>\n"+
"      <div class=cui-card__image-container>\n"+
"        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n"+
"          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#division></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"      <div class=cui-card__content>\n"+
"        <p class=cui-card__content-header id=newDivision-header>{{ 'cui-new-division' | translate }}</p>\n"+
"        <p>{{ 'cui-new-division-description-start' | translate }} <a href=\"\" class=cui-link--medium-light ng-click=\"welcome.divisionPopover=true\">{{ 'cui-security-administrator' | translate }}</a>* {{ 'cui-new-division-description-end' | translate }}</p>\n"+
"      </div>\n"+
"      <button class=cui-card__button ui-sref=registration.division>{{ 'cui-sign-up' | translate }}</button>\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=cui-styeguide__popover-container ng-if=welcome.divisionPopover off-click=\"welcome.divisionPopover=false\" tether target=#newDivision-header attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"15px 145px\">\n"+
"      <div class=\"cui-popover cui-popover--dark cui-popover--top cui-popover__new-division\">\n"+
"        <p>{{ 'cui-welcome-popover' | translate }}</p>\n"+
"        <p class=cui-popover_link><a href=\"\" ng-click=\"welcome.divisionPopover=false\">Cool, got it!</a></p>\n"+
"      </div>\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=cui-card>\n"+
"      <div class=cui-card__image-container>\n"+
"        <svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=88px height=88px viewBox=\"0 0 48 48\" enable-background=\"new 0 0 48 48\" xml:space=preserve>\n"+
"          <use class=cui-card__icon xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#user></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"      <div class=cui-card__content>\n"+
"        <p class=cui-card__content-header>{{ 'cui-new-user' | translate }}</p>\n"+
"        <p>{{ 'cui-new-user-description' | translate }}</p>\n"+
"      </div>\n"+
"      <button class=cui-card__button ui-sref=registration.walkup>{{ 'cui-sign-up' | translate }}</button>\n"+
"    </div>\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/organization/directory/directory.html',
"<div ui-view></div>");



$templateCache.put('assets/modules/organization/directory/organization-directory.html',
"<div class=cui-organization>\n"+
"  \n"+
"  <div class=cui-action>\n"+
"    <span class=cui-action__title>\n"+
"      <a ui-sref=organization.profile({id:orgDirectory.organization.id}) class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-profile' | translate}}</a> | \n"+
"      <a ui-sref=organization.hierarchy class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-hierarchy' | translate}}</a> | \n"+
"      <a ui-sref=organization.directory class=\"cui-link--medium-light cui-link--no-decoration\">{{'directory' | translate}}</a> | \n"+
"      <a ui-sref=organization.roles class=\"cui-link--medium-light cui-link--no-decoration\">{{'roles' | translate}}</a>\n"+
"    </span>\n"+
"    <div class=cui-action__actions>\n"+
"      <div class=cui-action__action-container id=invitation-button ng-click=\"orgDirectory.invitationClicked=!orgDirectory.invitationClicked\" off-click=\"orgDirectory.invitationClicked=false\">\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#envelope4></use>\n"+
"        </svg>\n"+
"        \n"+
"        <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#invitation-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgDirectory.invitationClicked>\n"+
"          <p>{{'user' | translate}}</p>\n"+
"          <p>{{'cui-org' | translate}}</p>\n"+
"          <p>{{'top-level-orgs' | translate}}</p>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-action>\n"+
"    <span class=cui-action__title>{{orgDirectory.organization.name}}</span>\n"+
"    <div class=cui-action__actions>\n"+
"      \n"+
"      <div class=cui-action__action-container ng-click=\"orgDirectory.sortClicked=!orgDirectory.sortClicked\" id=sort-button off-click=\"orgDirectory.sortClicked=false\">\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#sort14></use>\n"+
"        </svg>\n"+
"        <span class=cui-action__action-label>{{'sort' | translate}}</span>\n"+
"        \n"+
"        <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#sort-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgDirectory.sortClicked>\n"+
"          <p ng-click=\"orgDirectory.sort('alphabetically')\">{{'cui-alphabetically' | translate}}</p>\n"+
"          <p ng-click=\"orgDirectory.sort('date')\">{{'cui-by-date-added' | translate}}</p>\n"+
"        </div>\n"+
"      </div>\n"+
"      \n"+
"      <div class=cui-action__action-container ng-click=\"orgDirectory.refineClicked=!orgDirectory.refineClicked\" id=refine-button off-click=\"orgDirectory.refineClicked=false\">\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#filter10></use>\n"+
"        </svg>\n"+
"        <span class=cui-action__action-label>{{'refine' | translate}}</span>\n"+
"        \n"+
"        <div class=\"cui-popover cui-popover--top cui-popover__refine-popover\" tether target=#refine-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgDirectory.refineClicked>\n"+
"          <p ng-click=\"orgDirectory.parseUsersByStatus('all')\">{{'all' | translate}} ({{orgDirectory.statusCount[0]}})</p>\n"+
"          <div ng-repeat=\"status in orgDirectory.statusList\" ng-if=\"myApplications.statusCount[$index+1]!==0\">\n"+
"            <p ng-click=orgDirectory.parseUsersByStatus(status)>{{status | translate}} ({{orgDirectory.statusCount[$index+1]}})</p>\n"+
"          </div>\n"+
"        </div>\n"+
"      </div>\n"+
"      \n"+
"      <div class=cui-action__action-container ng-click=\"orgDirectory.organizationsClicked=!orgDirectory.organizationsClicked\" id=organizations-button off-click=\"orgDirectory.organizationsClicked=false\">\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#nine10></use>\n"+
"        </svg>\n"+
"        <span class=cui-action__action-label>{{'organizations' | translate}}</span>\n"+
"        \n"+
"        <div class=\"cui-popover cui-popover--top cui-popover__categories-popover\" tether target=#organizations-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgDirectory.organizationsClicked>\n"+
"          <div ng-repeat=\"organization in orgDirectory.organizationList | orderBy:'name' track by organization.id\">\n"+
"            <p ng-if=\"organization.id!==orgDirectory.organization.id\" ng-click=\"orgDirectory.getOrgMembers(organization.id, organization.name)\">{{organization.name}}</p>\n"+
"          </div>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-organization__main-container>\n"+
"    \n"+
"    <div class=cui-loading__container ng-if=orgDirectory.loading>\n"+
"      <div class=cui-loading--center><div class=cui-loading></div></div>\n"+
"    </div>\n"+
"\n"+
"    <table class=\"cui-table cui-table--borderless\">\n"+
"      <thead>\n"+
"        <tr>\n"+
"          <th>{{'cui-name' | translate}}</th>\n"+
"          <th></th>\n"+
"          <th>{{'userID' | translate}}</th>\n"+
"          <th>{{'cui-registered' | translate}}</th>\n"+
"          <th>{{'status' | translate}}</th>\n"+
"        </tr>\n"+
"      </thead>\n"+
"      <tbody>\n"+
"        <tr ng-repeat=\"user in orgDirectory.userList track by user.id\" ui-sref=directory.userDetails({id:user.id})>\n"+
"          <th><div class=cui-media__image cui-avatar cui-avatar-names=\"[user.name.given, user.name.surname]\" cui-avatar-color-class-prefix=cui-avatar__color cui-avatar-color-count=5></div></th>\n"+
"          <th><span>{{user.name.given}} {{user.name.surname}}</span></th>\n"+
"          <th>{{user.username}}</th>\n"+
"          <th>{{user.creation | date:base.appConfig.dateFormat}}</th>\n"+
"          <th>{{user.status | translate}}</th>\n"+
"        </tr>\n"+
"      </tbody>\n"+
"    </table>\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/organization/directory/user-details/directory-userDetails.html',
"<div class=cui-organization>\n"+
"  \n"+
"  <div class=cui-loading__container ng-if=orgDirectory.loading>\n"+
"    <div class=cui-loading--center><div class=cui-loading></div></div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-action>\n"+
"    <span class=cui-action__title>\n"+
"      <a ui-sref=organization.profile class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-profile' | translate}}</a> | \n"+
"      <a ui-sref=organization.hierarchy class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-hierarchy' | translate}}</a> | \n"+
"      <a ui-sref=organization.directory class=\"cui-link--medium-light cui-link--no-decoration\">{{'directory' | translate}}</a>\n"+
"    </span>\n"+
"    <div class=cui-action__actions>\n"+
"      <div class=cui-action__action-container>\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#envelope4></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"    <div class=\"cui-media [modifier class]\">\n"+
"        <div class=cui-media__image-container>\n"+
"            <svg xmlns=http://www.w3.org/2000/svg class=cui-media__image>\n"+
"                <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#user></use>\n"+
"            </svg>\n"+
"        </div>\n"+
"        <div class=cui-profile>\n"+
"            \n"+
"            <span class=cui-profile__user-name>{{'cui-name' | translate}}: {{userProfile.user.name.given}} {{userProfile.user.name.surname}}</span>\n"+
"            \n"+
"            <p class=cui-media__content--small>{{'cui-registered' | translate}}: {{userProfile.user.creation | date:base.appConfig.dateFormat}}</p>\n"+
"            <p class=cui-media__content--small>{{'cui-user-id' | translate}}: {{userProfile.user.id}}</p>\n"+
"\n"+
"            <span>\n"+
"                <button class=cui-button>Suspend</button>\n"+
"                <button class=cui-button>Password Reset</button>\n"+
"                <button class=cui-button>New Grants</button>\n"+
"		    </span>\n"+
"        </div>\n"+
"    </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-action>\n"+
"    <div class=cui-action__actions>\n"+
"      \n"+
"      <div class=cui-action__action-container ng-click=\"userDetails.profileRolesSwitch=true\" id=profile-button off-click=\"\">\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 48\">\n"+
"          <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#profile></use>\n"+
"        </svg>\n"+
"        <span class=cui-action__action-label>Profile</span>\n"+
"      </div>\n"+
"      \n"+
"      <div class=cui-action__action-container ng-click=\"userDetails.profileRolesSwitch=false\" id=roles-button>\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 48\">\n"+
"          <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#help></use>\n"+
"        </svg>\n"+
"        <span class=cui-action__action-label>Roles</span>\n"+
"      </div>\n"+
"      \n"+
"      <div class=cui-action__action-container ng-click=\"\" id=sort-button off-click=\"\">\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#sort14></use>\n"+
"        </svg>\n"+
"        <span class=cui-action__action-label>Sort</span>\n"+
"        \n"+
"        <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#sort-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=\"\">\n"+
"          <p ng-click=\"\">{{'cui-alphabetically' | translate}}</p>\n"+
"          <p ng-click=\"\">{{'cui-by-date-added' | translate}}</p>\n"+
"        </div>\n"+
"      </div>\n"+
"      \n"+
"      <div class=cui-action__action-container ng-click=\"\" id=categories-button off-click=\"\">\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 48\">\n"+
"          <use xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#categories></use>\n"+
"        </svg>\n"+
"        <span class=cui-action__action-label>Categories</span>\n"+
"        \n"+
"        <div class=\"cui-popover cui-popover--top cui-popover__categories-popover\" tether target=#categories-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=\"\">\n"+
"          <p ng-click=\"\">TODO!</p>\n"+
"          <div ng-repeat=\"\">\n"+
"            <p ng-click=\"\">TODO!</p>\n"+
"          </div>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"\n"+
"\n"+
"  \n"+
"  <div class=cui-organization__main-container>\n"+
"    \n"+
"		<div class=cui-users__info-block ng-if=userDetails.profileRolesSwitch>\n"+
"    	\n"+
"     	<div ng-include=\"'assets/app/organization/directory/user-details/sections/userDetails.profile.html'\"></div>\n"+
"    </div>\n"+
"\n"+
"    <div class=cui-users__info-block ng-if=!userDetails.profileRolesSwitch>\n"+
"    	\n"+
"     	<div ng-include=\"'assets/app/organization/directory/user-details/sections/userDetails.roles.html'\"></div>\n"+
"    </div>\n"+
"\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/organization/directory/user-details/sections/userDetails-apps.html',
"<p>Apps Section</p>");



$templateCache.put('assets/modules/organization/directory/user-details/sections/userDetails-history.html',
"<p>History Section</p>");



$templateCache.put('assets/modules/organization/directory/user-details/sections/userDetails-profile.html',
"<ng-form name=profile>\n"+
"  <div class=cui-users__field>\n"+
"    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n"+
"      <div class=cui-users__field>\n"+
"        <span class=cui-field-val__field>Profile Section TODO</span>\n"+
"        <span class=cui-link href=\"\" ng-if=!toggled ng-click=\"\">{{'cui-open' | translate}}</span>\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n"+
"          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"\n"+
"      <div ng-if=!toggled>\n"+
"\n"+
"        \n"+
"        <h3 class=cui-media__title>{{'cui-name' | translate}}: {{userProfile.user.name.given}} {{userProfile.user.name.surname}}</h3>\n"+
"        \n"+
"        <p class=cui-media__content--small>{{'cui-registered' | translate}}: {{userProfile.user.creation | date:base.appConfig.dateFormat}}</p>\n"+
"        <p class=cui-media__content--small>{{'cui-user-id' | translate}}: {{userProfile.user.id}}</p>\n"+
"\n"+
"\n"+
"        \n"+
"      </div>\n"+
"\n"+
"\n"+
"      <div class=cui-users__profile>\n"+
"        <div class=cui-users__profile-info>\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/app/user/profile/sections/basic-info.html'\"></div>\n"+
"          </div>\n"+
"\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/app/user/profile/sections/password.html'\"></div>\n"+
"          </div>\n"+
"\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/app/user/profile/sections/challenge-questions.html'\"></div>\n"+
"          </div>\n"+
"\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/app/user/profile/sections/timezone-language.html'\"></div>\n"+
"          </div>\n"+
"        </div>\n"+
"\n"+
"        <div class=cui-users__profile-info>\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/app/user/profile/sections/address.html'\"></div>\n"+
"          </div>\n"+
"\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/app/user/profile/sections/phone-fax.html'\"></div>\n"+
"          </div>\n"+
"        </div>\n"+
"\n"+
"      </div>\n"+
"\n"+
"    </div>\n"+
"  </div>\n"+
"</ng-form>");



$templateCache.put('assets/modules/organization/directory/user-details/sections/userDetails-roles.html',
"<ng-form name=profile>\n"+
"  <div class=cui-users__field>\n"+
"    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n"+
"      <div class=cui-users__field>\n"+
"        <span class=cui-field-val__field>Roles Section TODO</span>\n"+
"        <span class=cui-link href=\"\" ng-if=!toggled ng-click=\"\">{{'cui-open' | translate}}</span>\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n"+
"          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</ng-form>");



$templateCache.put('assets/modules/organization/hierarchy/organization-hierarchy.html',
"<div class=cui-organization>\n"+
"  \n"+
"  <div class=cui-loading__container ng-if=orgHierarchy.loading>\n"+
"    <div class=cui-loading--center><div class=cui-loading></div></div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-action>\n"+
"    <span class=cui-action__title>\n"+
"      <a ui-sref=organization.profile class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-profile' | translate}}</a> | \n"+
"      <a ui-sref=organization.hierarchy class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-hierarchy' | translate}}</a> | \n"+
"      <a ui-sref=organization.directory class=\"cui-link--medium-light cui-link--no-decoration\">{{'directory' | translate}}</a> | \n"+
"      <a ui-sref=organization.roles class=\"cui-link--medium-light cui-link--no-decoration\">{{'roles' | translate}}</a>\n"+
"    </span>\n"+
"    <div class=cui-action__actions>\n"+
"      <div class=cui-action__action-container id=invitation-button ng-click=\"orgHierarchy.invitationClicked=!orgHierarchy.invitationClicked\" off-click=\"orgHierarchy.invitationClicked=false\">\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#envelope4></use>\n"+
"        </svg>\n"+
"        \n"+
"        <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#invitation-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgHierarchy.invitationClicked>\n"+
"          <p>{{'user' | translate}}</p>\n"+
"          <p>{{'cui-org' | translate}}</p>\n"+
"          <p>{{'top-level-orgs' | translate}}</p>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-action>\n"+
"    <span class=cui-action__title>{{orgHierarchy.organization.name}}</span>\n"+
"    <div class=cui-action__actions>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-organization__main-container>\n"+
"    <p>API Blocker: Get Organization Hierarchy</p>\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/organization/organization.html',
"<div ui-view></div>");



$templateCache.put('assets/modules/organization/profile/organization-profile.html',
"<div class=cui-organization>\n"+
"  \n"+
"  <div class=cui-action>\n"+
"    <span class=cui-action__title>\n"+
"      <a ui-sref=organization.profile({id:orgProfile.organization.id}) class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-profile' | translate}}</a> | \n"+
"      <a ui-sref=organization.hierarchy({id:orgProfile.organization.id}) class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-hierarchy' | translate}}</a> | \n"+
"      <a ui-sref=organization.directory({id:orgProfile.organization.id}) class=\"cui-link--medium-light cui-link--no-decoration\">{{'directory' | translate}}</a> | \n"+
"      <a ui-sref=organization.roles class=\"cui-link--medium-light cui-link--no-decoration\">{{'roles' | translate}}</a>\n"+
"    </span>\n"+
"    <div class=cui-action__actions>\n"+
"      <div class=cui-action__action-container id=invitation-button ng-click=\"orgProfile.invitationClicked =! orgProfile.invitationClicked\" off-click=\"orgProfile.invitationClicked=false\">\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 216 146\">\n"+
"          <use xlink:href=bower_components/cui-icons/dist/font-awesome/font-awesome-out.svg#envelope4></use>\n"+
"        </svg>\n"+
"        \n"+
"        <div class=\"cui-popover cui-popover--top cui-popover__sort-popover\" tether target=#invitation-button attachment=\"top middle\" target-attachment=\"bottom middle\" offset=\"-10px 0\" ng-if=orgProfile.invitationClicked>\n"+
"          <p>{{'user' | translate}}</p>\n"+
"          <p>{{'cui-org' | translate}}</p>\n"+
"          <p>{{'top-level-orgs' | translate}}</p>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-organization__main-container>\n"+
"    \n"+
"    <div class=cui-loading__container ng-if=orgProfile.loading>\n"+
"        <div class=cui-loading--center><div class=cui-loading></div></div>\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div ng-if=!orgProfile.loading>\n"+
"      <h3 class=cui-organization__page-title>{{orgProfile.organization.name}}</h3>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-field-val cui-field-val--stack cui-organization__info-block\">\n"+
"      <h4 class=cui-field-val__field ng-if=orgProfile.securityAdmins>{{'cui-admins' | translate}}</h4>\n"+
"      <div class=cui-organization__admin-block-wrapper ng-if=orgProfile.securityAdmins>\n"+
"        <div class=cui-organization__admin-block ng-repeat=\"admin in orgProfile.securityAdmins\">\n"+
"          \n"+
"          <span class=cui-field-val__field>{{'cui-name' | translate}}: </span>\n"+
"          <span class=cui-field-val__val>{{admin.name.given}} {{admin.name.surname}}</span><br>\n"+
"          \n"+
"          <span class=cui-field-val__field>{{'id' | translate}}: </span>\n"+
"          <span class=cui-field-val__val>{{admin.username}}</span><br>\n"+
"          \n"+
"          <span class=cui-field-val__field>{{'title' | translate}}: </span>\n"+
"          <span class=cui-field-val__val>{{admin.title}}</span><br>\n"+
"          \n"+
"          <span class=cui-field-val__field ng-if=admin.phones>{{'cui-phone' | translate}}: </span>\n"+
"          <span class=cui-field-val__val ng-if=admin.phones>{{admin.phones[0].number}}</span><br>\n"+
"          \n"+
"          <span class=cui-field-val__field>{{'cui-email' | translate}}: </span>\n"+
"          <span class=cui-field-val__val>{{admin.email}}</span>\n"+
"        </div>\n"+
"      </div>\n"+
"\n"+
"      \n"+
"      <div class=\"cui-field-val cui-field-val--stack cui-organization__info-block\">\n"+
"      <h4 class=cui-field-val__field>{{'cui-address' | translate}}: </h4>\n"+
"        <span class=cui-field-val__val>{{orgProfile.organization.addresses[0].streets[0]}}</span>\n"+
"        <span class=cui-field-val__val>{{orgProfile.organization.addresses[0].city}}</span>\n"+
"        <span class=cui-field-val__val>{{orgProfile.organization.addresses[0].state}}, {{orgProfile.organization.addresses[0].postal}}</span>\n"+
"        <span class=cui-field-val__val>{{orgProfile.organization.phones[0].number}}</span>\n"+
"      </div>\n"+
"\n"+
"      \n"+
"      <div class=cui-organization__info-block>\n"+
"        <h4 class=cui-field-val__field>{{'cui-info' | translate}}: </h4>\n"+
"        <div>\n"+
"          <span>{{'url' | translate}}: </span>\n"+
"          <span class=cui-field-val__val><a ng-href={{orgProfile.organization.url}}>{{orgProfile.organization.url}}</a></span>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</div></div>");



$templateCache.put('assets/modules/organization/roles/organization-roles.html',
"<div class=cui-organization>\n"+
"  \n"+
"  <div class=cui-action>\n"+
"    <span class=cui-action__title>\n"+
"      <a ui-sref=organization.profile({id:orgDirectory.organization.id}) class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-profile' | translate}}</a> | \n"+
"      <a ui-sref=organization.hierarchy class=\"cui-link--medium-light cui-link--no-decoration\">{{'cui-org-hierarchy' | translate}}</a> | \n"+
"      <a ui-sref=organization.directory class=\"cui-link--medium-light cui-link--no-decoration\">{{'directory' | translate}}</a> | \n"+
"      <a ui-sref=organization.roles class=\"cui-link--medium-light cui-link--no-decoration\">{{'roles' | translate}}</a>\n"+
"    </span>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-organization__main-container>\n"+
"    \n"+
"    <div class=cui-loading__container ng-if=orgRoles.loading>\n"+
"      <div class=cui-loading--center><div class=cui-loading></div></div>\n"+
"    </div>\n"+
"\n"+
"    <p>Organization Roles Page</p>\n"+
"\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/registration/newDivision/newDivision-steps/newDivision-login.html',
"<form name=\"userLogin\" novalidate>\n"+
"\n"+
"	<!-- First Row -->\n"+
"	<!-- User ID -->\n"+
"	<label for=\"userID\">{{'cui-user-id' | translate}}</label>\n"+
"	<div class=\"cui-error\" ng-messages=\"userLogin.name.$error\" ng-if=\"userLogin.name.$touched\">\n"+
"		<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"	</div>\n"+
"	<input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.username\">\n"+
"\n"+
"	<!-- Second row -->\n"+
"	<div class=\"cui-wizard__field-row\">\n"+
"		<!-- Password -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<div class=\"cui-input__password-holder\">\n"+
"				<label>{{'cui-password' | translate}}</label>\n"+
"				<div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n"+
"					<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"				</div>\n"+
"				<input type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.password\" ng-class=\"{'cui-input--error': userLogin.password.$touched && userLogin.password.$invalid}\" password-validation=\"newDivision.passwordPolicies\">\n"+
"				<div ng-messages=\"userLogin.password.$error\" ng-messages-multiple ng-if=\"userLogin.password.$invalid\" class=\"cui-error__password\">\n"+
"					<div ng-messages-include=\"assets/app/registration/password-validation.html\"></div>\n"+
"				</div>\n"+
"			</div>\n"+
"		</div>\n"+
"\n"+
"		<!-- Re-enter Password -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-password-re' | translate}}</label>\n"+
"			<div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n"+
"				<div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n"+
"			</div>\n"+
"			<input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.passwordRe\" match=\"newDivision.userLogin.password\">\n"+
"		</div>\n"+
"	</div>\n"+
"\n"+
"	<!-- Third row -->\n"+
"	<div class=\"cui-wizard__field-row\">\n"+
"		<!-- Challenge Question 1 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-question' | translate}} 1</label>\n"+
"			<div class=\"cui-error\" ng-messages=\"userLogin.challenge1.$error\" ng-if=\"userLogin.challenge1.$touched\">\n"+
"				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"			</div>\n"+
"			<select ng-model=\"newDivision.userLogin.question1\" name=\"challenge1\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge1.$touched && userLogin.challenge1.$invalid }\" ng-options=\"question as question.question[0].text for question in newDivision.userLogin.challengeQuestions1\">\n"+
"			</select>\n"+
"		</div>\n"+
"\n"+
"		<!-- Challenge Answer 1 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-answer' | translate}} 1</label>\n"+
"			<div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n"+
"				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"			</div>\n"+
"			<input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.challengeAnswer1\">\n"+
"		</div>\n"+
"	</div>\n"+
"\n"+
"	<!-- Fourth row -->\n"+
"	<div class=\"cui-wizard__field-row\">\n"+
"		<!-- Challenge Question 2 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-question' | translate}} 2</label>\n"+
"			<div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n"+
"				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"			</div>\n"+
"			<select ng-model=\"newDivision.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as question.question[0].text for question in newDivision.userLogin.challengeQuestions2\">\n"+
"			</select>\n"+
"		</div>\n"+
"\n"+
"		<!-- Challenge Answer 2 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-answer' | translate}} 2</label>\n"+
"			<div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n"+
"				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"			</div>\n"+
"			<input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newDivision.userLogin.challengeAnswer2\">\n"+
"		</div>\n"+
"	</div>\n"+
"\n"+
"</form>\n"+
"\n"+
"<div class=\"cui-wizard__controls\">\n"+
"	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"	<button class=\"cui-wizard__next\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n"+
"</div>\n");



$templateCache.put('assets/modules/registration/newDivision/newDivision-steps/newDivision-organization.html',
"<form name=\"organizationSelect\" novalidate>\n"+
"  <p>{{'cui-all-organizations' | translate}}</p>\n"+
"  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-org-name' | translate}}\" ng-model=\"newDivision.orgSearch.name\">\n"+
"\n"+
"  <cui-expandable class=\"cui-expandable\" ng-repeat=\"organization in newDivision.organizationList\">\n"+
"    <cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n"+
"      {{organization.name}}\n"+
"      <span class=\"chevron\">></span>\n"+
"    </cui-expandable-title>\n"+
"    \n"+
"    <cui-expandable-body class=\"cui-expandable__body\">\n"+
"      <p>{{organization.id}}</p>\n"+
"      <p>{{organization.url}}</p>\n"+
"      <p>{{organization.phones[0].number}}</p>\n"+
"\n"+
"      <div class=\"cui-wizard__controls\">\n"+
"        <button class=\"cui-wizard__next\"  ng-click=\"next(); $parent.newDivision.organizationSelect.organization = organization\">{{'cui-select-org' | translate}}</button>\n"+
"      </div>\n"+
"    </cui-expandable-body>\n"+
"  </cui-expandable>\n"+
"</form>\n"+
"\n"+
"<div class=\"cui-wizard__controls\">\n"+
"  <button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"</div>\n");



$templateCache.put('assets/modules/registration/newDivision/newDivision-steps/newDivision-review.html',
"<!-- User Information -->\n"+
"<cui-expandable class=\"cui-expandable expanded\">\n"+
"	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n"+
"  	{{'cui-user-information' | translate}}\n"+
"    <span class=\"chevron\">></span>\n"+
"  </cui-expandable-title>\n"+
"\n"+
"  <cui-expandable-body class=\"cui-expandable__body\">\n"+
"  	<!-- First Name -->\n"+
"  	<inline-edit label=\"cui-first-name\" model=\"newDivision.user.name.given\"></inline-edit>\n"+
"		<!-- Last Name -->\n"+
"		<inline-edit label=\"cui-last-name\" model=\"newDivision.user.name.surname\"></inline-edit>\n"+
"		<!-- Email -->\n"+
"		<inline-edit label=\"cui-email\" model=\"newDivision.user.email\"></inline-edit>\n"+
"		<!-- Country -->\n"+
"		<inline-edit type=\"auto-complete\" model=\"newDivision.user.addresses[0].country\" display=\"newDivision.user.addresses[0].country.title || newDivision.user.addresses[0].country\" label=\"cui-country\" selected-object=\"newDivision.user.addresses[0].country\" model=\"newDivision.user.addresses[0].country\" local-data=\"base.countries.list\" search-fields=\"name\" title-field=\"name\"></inline-edit>\n"+
"		<!-- Address 1 -->\n"+
"		<inline-edit label=\"cui-address-1\" model=\"newDivision.user.addresses[0].streets[0]\"></inline-edit>\n"+
"		<!-- Address 2 -->\n"+
"		<inline-edit label=\"cui-address-2\" model=\"newDivision.user.addresses[0].streets[1]\"></inline-edit>\n"+
"		<!-- City -->\n"+
"		<inline-edit label=\"cui-city\" model=\"newDivision.user.addresses[0].city\"></inline-edit>\n"+
"		<!-- State -->\n"+
"		<inline-edit label=\"cui-state\" model=\"newDivision.user.addresses[0].state\"></inline-edit>\n"+
"	  <!-- Postal -->\n"+
"	  <inline-edit label=\"cui-postal\" model=\"newDivision.user.addresses[0].postal\"></inline-edit>\n"+
"	  <!-- Phone Number -->\n"+
"	  <inline-edit label=\"cui-telephone\" model=\"newDivision.user.phones[0].number\"></inline-edit>\n"+
"	</cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"<!-- Organization Information -->\n"+
"<cui-expandable class=\"cui-expandable\">\n"+
"  <cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n"+
"      {{'cui-organization-information' | translate}}\n"+
"      <span class=\"chevron\">></span>\n"+
"    </cui-expandable-title>\n"+
"\n"+
"    <cui-expandable-body class=\"cui-expandable__body\">\n"+
"      <!-- Company/Division -->\n"+
"      <inline-edit type=\"dropdown\" display=\"newDivision.organizationSelect.organization.name\" label=\"cui-org\" options=\"newDivision.organizationList\" options-expression=\"organization as organization.name for organization in options\" model=\"newDivision.organizationSelect.organization\"></inline-edit>\n"+
"  </cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"<!-- Sign In Information -->\n"+
"<cui-expandable class=\"cui-expandable\">\n"+
"  <cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n"+
"    {{'cui-sign-in-information' | translate}}\n"+
"    <span class=\"chevron\">></span>\n"+
"  </cui-expandable-title>\n"+
"\n"+
"  <cui-expandable-body class=\"cui-expandable__body\">\n"+
"    <!-- User ID -->\n"+
"    <inline-edit label=\"cui-user-id\" model=\"newDivision.userLogin.username\"></inline-edit>\n"+
"    <!-- Password -->\n"+
"    <inline-edit label=\"cui-password\" model=\"newDivision.userLogin.password\"></inline-edit>\n"+
"    <!-- Re-Enter Password -->\n"+
"    <inline-edit label=\"cui-password-re\" model=\"newDivision.userLogin.passwordRe\"></inline-edit>\n"+
"    <!-- Challenge Question 1 -->\n"+
"    test\n"+
"    <inline-edit type=\"dropdown\" display=\"newDivision.userLogin.question1.question | cuiI18n\" label=\"cui-challenge-question\" options=\"newDivision.userLogin.challengeQuestions1\" options-expression=\"question as (question.question | cuiI18n) for question in options\" model=\"newDivision.userLogin.question1\"></inline-edit>\n"+
"    <!-- Challenge Answer 1 -->\n"+
"    <inline-edit label=\"cui-challenge-answer\" model=\"newDivision.userLogin.challengeAnswer1\"></inline-edit>\n"+
"    <!-- Challenge Question 2 -->\n"+
"    <inline-edit type=\"dropdown\" display=\"newDivision.userLogin.question2.question[0].text\" label=\"cui-challenge-question\" options=\"newDivision.userLogin.challengeQuestions2\" options-expression=\"question as question.question[0].text for question in options\" model=\"newDivision.userLogin.question2\"></inline-edit>\n"+
"    <!-- Challenge Answer 2 -->\n"+
"    <inline-edit label=\"cui-challenge-answer\" model=\"newDivision.userLogin.challengeAnswer2\"></inline-edit>\n"+
"  </cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"<div class=\"cui-wizard__controls\">\n"+
"	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"  <button class=\"cui-wizard__next\" ng-click=\"\">{{'cui-submit' | translate}}</button>\n"+
"</div>\n");



$templateCache.put('assets/modules/registration/newDivision/newDivision-steps/newDivision-userProfile.html',
"<form name=user novalidate>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"newDivision.user.name.given\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <input type=text ng-model=newDivision.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{'cui-email' | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.email.$error ng-if=user.email.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <input type=email name=email class=cui-input ng-required=true ng-model=\"newDivision.user.email\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{'cui-email-re' | translate}}</label>\n"+
"      <div class=cui-error ng-if=\"user.emailRe.$touched && user.emailRe.$error.match\">\n"+
"        <div class=cui-error__message>{{'email-mismatch' | translate}}</div>\n"+
"      </div>\n"+
"      <input type=text ng-model=newDivision.emailRe name=emailRe class=cui-input ng-required=true match=\"newDivision.user.email\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=country>{{\"cui-country\" | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <div auto-complete input-name=country pause=100 selected-object=newDivision.user.addresses[0].country local-data=base.countries.list search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=newDivision.user.addresses[0].country></div>\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-address\" | translate}} 1</label>\n"+
"      <input type=text ng-model=newDivision.user.addresses[0].streets[0] class=cui-input name=address1>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-address\" | translate}} 2</label>\n"+
"      <input type=text ng-model=newDivision.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-city\" | translate}}</label>\n"+
"      <input type=text ng-model=newDivision.user.addresses[0].city class=cui-input name=city>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-state\" | translate}}</label>\n"+
"      <input type=text ng-model=newDivision.user.addresses[0].state class=cui-input name=state>\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n"+
"      <input type=text ng-model=newDivision.user.addresses[0].postal class=cui-input name=\"postal\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-telephone\" | translate}}</label>\n"+
"      <input type=text ng-model=newDivision.user.phones[0].number class=cui-input name=\"postal\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"   <div class=cui-tos-container>\n"+
"    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n"+
"    <label for=TOS class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n"+
"      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n"+
"      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n"+
"    </label>\n"+
"    <span class=cui-wizard__step-error ng-if=\"user.TOS.$error.required && user.TOS.$touched\"><br><br> {{'cui-tos-agree' | translate}} </span>\n"+
"  </div>\n"+
"\n"+
"\n"+
"  <div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n"+
"    <button class=cui-wizard__next ng-click=nextWithErrorChecking(user) ng-class=\"{'cui-wizard__next--error':!user.$valid}\">{{'cui-next' | translate}}</button>\n"+
"  </div>\n"+
"</form>");



$templateCache.put('assets/modules/registration/newDivision/newDivision.html',
"<div class=cui-form--mobile-steps>\n"+
"  <div class=cui-form__title>{{'create-account' | translate}}</div>\n"+
"  <div class=cui-form__body>\n"+
"    <cui-wizard bar mobile-stack class=cui-wizard step=1 minimum-padding=30>\n"+
"      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n"+
"\n"+
"      <step step-title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n"+
"        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.userProfile.html'\"></div>\n"+
"      </step>\n"+
"\n"+
"      <step step-title=\"{{'cui-org' | translate}}\" icon=cui:skyscraper>\n"+
"        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.organization.html'\"></div>\n"+
"      </step>\n"+
"\n"+
"      <step step-title=\"{{'cui-login' | translate}}\" icon=cui:login>\n"+
"        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.login.html'\"></div>\n"+
"      </step>\n"+
"\n"+
"      <step step-title=\"{{'cui-review' | translate}}\" icon=cui:review>\n"+
"        <div ng-include=\"'assets/app/registration/newDivision/division.registration-steps/division.review.html'\"></div>\n"+
"      </step>\n"+
"\n"+
"    </cui-wizard>\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/registration/newTopLevelOrg/newTLO-steps/newTLO-login.html',
"<form name=\"userLogin\" novalidate>\n"+
"\n"+
"	<!-- First Row -->\n"+
"	<!-- User ID -->\n"+
"	<label for=\"userID\">{{'cui-user-id' | translate}}</label>\n"+
"	<div class=\"cui-error\" ng-messages=\"userLogin.name.$error\" ng-if=\"userLogin.name.$touched\">\n"+
"		<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"	</div>\n"+
"	<input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.username\">\n"+
"\n"+
"	<!-- Second row -->\n"+
"	<div class=\"cui-wizard__field-row\">\n"+
"		<!-- Password -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<div class=\"cui-input__password-holder\">\n"+
"				<label>{{'cui-password' | translate}}</label>\n"+
"				<div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n"+
"					<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"				</div>\n"+
"				<input type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.password\" ng-class=\"{'cui-input--error': userLogin.password.$touched && userLogin.password.$invalid}\" password-validation=\"newTlo.passwordPolicies\">\n"+
"				<div ng-messages=\"userLogin.password.$error\" ng-messages-multiple ng-if=\"userLogin.password.$invalid\" class=\"cui-error__password\">\n"+
"					<div ng-messages-include=\"assets/app/registration/password-validation.html\"></div>\n"+
"				</div>\n"+
"			</div>\n"+
"		</div>\n"+
"\n"+
"		<!-- Re-enter Password -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-password-re' | translate}}</label>\n"+
"			<div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n"+
"				<div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n"+
"			</div>\n"+
"			<input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.passwordRe\" match=\"newTlo.userLogin.password\">\n"+
"		</div>\n"+
"	</div>\n"+
"\n"+
"	<!-- Third row -->\n"+
"	<div class=\"cui-wizard__field-row\">\n"+
"		<!-- Challenge Question 1 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-question' | translate}} 1</label>\n"+
"			<div class=\"cui-error\" ng-messages=\"userLogin.challenge1.$error\" ng-if=\"userLogin.challenge1.$touched\">\n"+
"				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"			</div>\n"+
"			<select ng-model=\"newTlo.userLogin.question1\" name=\"challenge1\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge1.$touched && userLogin.challenge1.$invalid }\" ng-options=\"question as question.question[0].text for question in newTlo.userLogin.challengeQuestions1\">\n"+
"			</select>\n"+
"		</div>\n"+
"\n"+
"		<!-- Challenge Answer 1 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-answer' | translate}} 1</label>\n"+
"			<div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n"+
"				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"			</div>\n"+
"			<input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.challengeAnswer1\">\n"+
"		</div>\n"+
"	</div>\n"+
"\n"+
"	<!-- Fourth row -->\n"+
"	<div class=\"cui-wizard__field-row\">\n"+
"		<!-- Challenge Question 2 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-question' | translate}} 2</label>\n"+
"			<div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n"+
"				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"			</div>\n"+
"			<select ng-model=\"newTlo.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as question.question[0].text for question in newTlo.userLogin.challengeQuestions2\">\n"+
"			</select>\n"+
"		</div>\n"+
"\n"+
"		<!-- Challenge Answer 2 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-answer' | translate}} 2</label>\n"+
"			<div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n"+
"				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"			</div>\n"+
"			<input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTlo.userLogin.challengeAnswer2\">\n"+
"		</div>\n"+
"	</div>\n"+
"</form>\n"+
"\n"+
"<div class=\"cui-wizard__controls\">\n"+
"	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"	<button class=\"cui-wizard__next\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n"+
"</div>\n");



$templateCache.put('assets/modules/registration/newTopLevelOrg/newTLO-steps/newTLO-organization.html',
"<form name=\"organization\" novalidate>\n"+
"\n"+
"  <!-- First Row -->\n"+
"  <div class=\"cui-wizard__field-row\">\n"+
"    <!-- Company/Division -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=\"organization-name\">{{'cui-organization-name' | translate}}</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"organization.name.$error\" ng-if=\"organization.name.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <input type=\"text\" name=\"name\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.name\">\n"+
"    </div>\n"+
"\n"+
"    <!-- Phone -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=\"organization-phone\">{{'cui-telephone' | translate}}</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"organization.phone.$error\" ng-if=\"organization.phone.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <input type=\"text\" name=\"phone\" class=\"cui-input\" ng-model=\"newTLO.organization.phones[0].number\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  <!-- Second Row -->\n"+
"  <div class=\"cui-wizard__field-row\">\n"+
"    <!-- Address 1 -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=\"organization-address1\">{{'cui-address' | translate}} 1</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"organization.address1.$error\" ng-if=\"organization.address1.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <input type=\"text\" name=\"address1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.addresses[0].streets[0]\">\n"+
"    </div>\n"+
"\n"+
"    <!-- Address 2 -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=\"organization-address2\">{{'cui-address' | translate}} 2</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"organization.address2.$error\" ng-if=\"organization.address2.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <input type=\"text\" name=\"address2\" class=\"cui-input\" ng-model=\"newTLO.organization.addresses[0].streets[1]\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  <!-- Third Row -->\n"+
"  <div class=\"cui-wizard__field-row\">\n"+
"    <!-- City -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=\"organization-city\">{{'cui-city' | translate}}</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"organization.city.$error\" ng-if=\"organization.city.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <input type=\"text\" name=\"city\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.addresses[0].city\">\n"+
"    </div>\n"+
"\n"+
"    <!-- State/Province -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=\"organization-state\">{{'cui-state' | translate}}</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"organization.state.$error\" ng-if=\"organization.state.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <input type=\"text\" name=\"state\" class=\"cui-input\" ng-required=\"true\" ng-model=\"newTLO.organization.addresses[0].state\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  <!-- Fourth Row -->\n"+
"  <div class=\"cui-wizard__field-row\">\n"+
"    <!-- Postal Code -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"    <label for=\"organization-postal\">{{'cui-postal' | translate}}</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"organization.postal.$error\" ng-if=\"organization.postal.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <input type=\"text\" name=\"postal\" class=\"cui-input\" ng-model=\"newTLO.organization.addresses.postal\">\n"+
"    </div>\n"+
"\n"+
"    <!-- Country -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=\"organization-country\">{{\"cui-country\" | translate}}</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"organization.country.$error\" ng-if=\"organization.country.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <div auto-complete input-name=\"country\" pause=\"100\" selected-object=\"newTLO.organization.addresses[0].country\" local-data=\"base.countries.list\" search-fields=\"name\" title-field=\"name\" input-class=\"cui-input\" match-class=\"highlight\" auto-match=\"true\" field-required=\"newTLO.organization.addresses[0].country\">\n"+
"        <input type=\"text\" name=\"country\" class=\"cui-input\" ng-model=\"newTLO.organization.addresses[0].country\">\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</form>\n"+
"\n"+
"<div class=\"cui-wizard__controls\">\n"+
"  <button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"  <button class=\"cui-wizard__next\" ng-click=\"nextWithErrorChecking(organization)\" ng-class=\"(organization.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n"+
"</div>\n");



$templateCache.put('assets/modules/registration/newTopLevelOrg/newTLO-steps/newTLO-review.html',
"<!-- User Information -->\n"+
"<cui-expandable class=\"cui-expandable expanded\">\n"+
"	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n"+
"		{{'cui-user-information' | translate}}\n"+
"		<span class=\"chevron\">></span>\n"+
"	</cui-expandable-title>\n"+
"\n"+
"	<cui-expandable-body class=\"cui-expandable__body\">\n"+
"		<!-- First Name -->\n"+
"		<inline-edit label=\"cui-first-name\" model=\"newTLO.user.name.given\"></inline-edit>\n"+
"		<!-- Last Name -->\n"+
"		<inline-edit label=\"cui-last-name\" model=\"newTLO.user.name.surname\"></inline-edit>\n"+
"		<!-- Email -->\n"+
"		<inline-edit label=\"cui-email\" model=\"newTLO.user.email\"></inline-edit>\n"+
"		<!-- Country -->\n"+
"		<inline-edit type=\"auto-complete\" model=\"newTLO.user.addresses[0].country\" display=\"newTLO.user.addresses[0].country.title || newTLO.user.addresses[0].country\" label=\"cui-country\" selected-object=\"newTLO.user.addresses[0].country\" model=\"newTLO.user.addresses[0].country\" local-data=\"base.countries.list\" search-fields=\"name\" title-field=\"name\"></inline-edit>\n"+
"		<!-- Address 1 -->\n"+
"		<inline-edit label=\"cui-address-1\" model=\"newTLO.user.addresses[0].streets[0]\"></inline-edit>\n"+
"		<!-- Address 2 -->\n"+
"		<inline-edit label=\"cui-address-2\" model=\"newTLO.user.addresses[0].streets[1]\"></inline-edit>\n"+
"		<!-- City -->\n"+
"		<inline-edit label=\"cui-city\" model=\"newTLO.user.addresses[0].city\"></inline-edit>\n"+
"		<!-- State -->\n"+
"		<inline-edit label=\"cui-state\" model=\"newTLO.user.addresses[0].state\"></inline-edit>\n"+
"		<!-- Postal -->\n"+
"		<inline-edit label=\"cui-postal\" model=\"newTLO.user.addresses[0].postal\"></inline-edit>\n"+
"		<!-- Phone Number -->\n"+
"		<inline-edit label=\"cui-telephone\" model=\"newTLO.user.phones[0].number\"></inline-edit>\n"+
"	</cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"<!-- Organization Information -->\n"+
"<cui-expandable class=\"cui-expandable\">\n"+
"	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n"+
"		{{'cui-organization-information' | translate}}\n"+
"		<span class=\"chevron\">></span>\n"+
"	</cui-expandable-title>\n"+
"\n"+
"	<cui-expandable-body class=\"cui-expandable__body\">\n"+
"		<!-- Company/Division -->\n"+
"		<inline-edit label=\"cui-organization-name\" model=\"newTLO.organization.name\"></inline-edit>\n"+
"		<!-- Telephone -->\n"+
"		<inline-edit label=\"cui-telephone\" model=\"newTLO.organization.phones[0].number\"></inline-edit>\n"+
"		<!-- Address 1 -->\n"+
"		<inline-edit label=\"cui-address-1\" model=\"newTLO.organization.addresses[0].streets[0]\"></inline-edit>\n"+
"		<!-- Address 2 -->\n"+
"		<inline-edit label=\"cui-address-2\" model=\"newTLO.organization.addresses[0].streets[1]\"></inline-edit>\n"+
"		<!-- City -->\n"+
"		<inline-edit label=\"cui-city\" model=\"newTLO.organization.addresses[0].city\"></inline-edit>\n"+
"		<!-- State -->\n"+
"		<inline-edit label=\"cui-state\" model=\"newTLO.organization.addresses[0].state\"></inline-edit>\n"+
"		<!-- Postal -->\n"+
"		<inline-edit label=\"cui-postal\" model=\"newTLO.organization.addresses[0].postal\"></inline-edit>\n"+
"		<!-- Country -->\n"+
"		<inline-edit label=\"cui-country\" model=\"newTLO.organization.addresses[0].country.title\"></inline-edit>\n"+
"	</cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"<!-- Sign In Information -->\n"+
"<cui-expandable class=\"cui-expandable\">\n"+
"	<cui-expandable-title class=\"cui-expandable__title\" ng-click=\"toggleExpand()\">\n"+
"		{{'cui-sign-in-information' | translate}}\n"+
"		<span class=\"chevron\">></span>\n"+
"	</cui-expandable-title>\n"+
"\n"+
"	<cui-expandable-body class=\"cui-expandable__body\">\n"+
"		<!-- User ID -->\n"+
"		<inline-edit label=\"cui-user-id\" model=\"newTLO.userLogin.username\"></inline-edit>\n"+
"		<!-- Password -->\n"+
"		<inline-edit label=\"cui-password\" model=\"newTLO.userLogin.password\"></inline-edit>\n"+
"		<!-- Re-Enter Password -->\n"+
"		<inline-edit label=\"cui-password-re\" model=\"newTLO.userLogin.passwordRe\"></inline-edit>\n"+
"		<!-- Challenge Question 1 -->\n"+
"		<inline-edit type=\"dropdown\" display=\"newTLO.userLogin.question1.question[0].text\" label=\"cui-challenge-question\" options=\"newTLO.userLogin.challengeQuestions1\" options-expression=\"question as question.question[0].text for question in options\" model=\"newTLO.userLogin.question1\"></inline-edit>\n"+
"		<!-- Challenge Answer 1 -->\n"+
"		<inline-edit label=\"cui-challenge-answer\" model=\"newTLO.userLogin.challengeAnswer1\"></inline-edit>\n"+
"		<!-- Challenge Question 2 -->\n"+
"		<inline-edit type=\"dropdown\" display=\"newTLO.userLogin.question2.question[0].text\" label=\"cui-challenge-question\" options=\"newTLO.userLogin.challengeQuestions2\" options-expression=\"question as question.question[0].text for question in options\" model=\"newTLO.userLogin.question2\"></inline-edit>\n"+
"		<!-- Challenge Answer 2 -->\n"+
"		<inline-edit label=\"cui-challenge-answer\" model=\"newTLO.userLogin.challengeAnswer2\"></inline-edit>\n"+
"	</cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"<div class=\"cui-wizard__controls\">\n"+
"	<button class=\"cui-wizard__previous\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"	<button class=\"cui-wizard__next\" ng-click=\"\">{{'cui-submit' | translate}}</button>\n"+
"</div>\n");



$templateCache.put('assets/modules/registration/newTopLevelOrg/newTLO-steps/newTLO-userProfile.html',
"<form name=user novalidate>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"newTLO.user.name.given\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <input type=text ng-model=newTLO.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{'cui-email' | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.email.$error ng-if=user.email.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <input type=email name=email class=cui-input ng-required=true ng-model=\"newTLO.user.email\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{'cui-email-re' | translate}}</label>\n"+
"      <div class=cui-error ng-if=\"user.emailRe.$touched && user.emailRe.$error.match\">\n"+
"        <div class=cui-error__message>{{'email-mismatch' | translate}}</div>\n"+
"      </div>\n"+
"      <input type=text ng-model=newTLO.emailRe name=emailRe class=cui-input ng-required=true match=\"newTLO.user.email\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=country>{{\"cui-country\" | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <div auto-complete input-name=country pause=100 selected-object=newTLO.user.addresses[0].country local-data=base.countries.list search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=newTLO.user.addresses[0].country></div>\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-address\" | translate}} 1</label>\n"+
"      <input type=text ng-model=newTLO.user.addresses[0].streets[0] class=cui-input name=address1>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-address\" | translate}} 2</label>\n"+
"      <input type=text ng-model=newTLO.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-city\" | translate}}</label>\n"+
"      <input type=text ng-model=newTLO.user.addresses[0].city class=cui-input name=city>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-state\" | translate}}</label>\n"+
"      <input type=text ng-model=newTLO.user.addresses[0].state class=cui-input name=state>\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n"+
"      <input type=text ng-model=newTLO.user.addresses[0].postal class=cui-input name=\"postal\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-telephone\" | translate}}</label>\n"+
"      <input type=text ng-model=newTLO.user.phones[0].number class=cui-input name=\"postal\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-tos-container>\n"+
"    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n"+
"    <label for=TOS class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n"+
"      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n"+
"      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n"+
"    </label>\n"+
"    <span class=cui-wizard__step-error ng-if=\"user.TOS.$error.required && user.TOS.$touched\"><br><br> {{'cui-tos-agree' | translate}} </span>\n"+
"  </div>\n"+
"\n"+
"</form>\n"+
"\n"+
"<div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n"+
"  <button class=cui-wizard__next ng-click=nextWithErrorChecking(user) ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n"+
"</div>");



$templateCache.put('assets/modules/registration/newTopLevelOrg/newTLO.html',
"<div class=cui-form--mobile-steps>\n"+
"  <div class=cui-form__title>{{'create-account' | translate}}</div>\n"+
"  <div class=cui-form__body>\n"+
"    <cui-wizard bar mobile-stack class=cui-wizard step=1 minimum-padding=30>\n"+
"      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n"+
"\n"+
"      <step step-title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n"+
"        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.userProfile.html'\"></div>\n"+
"      </step>\n"+
"\n"+
"      <step step-title=\"{{'cui-org' | translate}}\" icon=cui:skyscraper>\n"+
"        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.organization.html'\"></div>\n"+
"      </step>\n"+
"\n"+
"      <step step-title=\"{{'cui-login' | translate}}\" icon=cui:login>\n"+
"        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.login.html'\"></div>\n"+
"      </step>\n"+
"\n"+
"      <step step-title=\"{{'cui-review' | translate}}\" icon=cui:review>\n"+
"        <div ng-include=\"'assets/app/registration/newTopLevelOrg/topLevelOrg.registration-steps/topLevelOrg.review.html'\"></div>\n"+
"      </step>\n"+
"\n"+
"    </cui-wizard>\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/registration/registration.html',
"<div ui-view></div>");



$templateCache.put('assets/modules/registration/userInvited/complete-registration-popover.html',
"<div class=cui-popover-container--relative ng-if=usersRegister.showCovisintInfo off-click=\"usersRegister.showCovisintInfo = false\" off-click-if=usersRegister.showCovisintInfo>\n"+
"  <div class=cui-styeguide__popover-container>\n"+
"    <div class=\"cui-popover cui-popover--top\">\n"+
"      <p>{{usersRegister.targetOrganization.name}}<br>\n"+
"      {{usersRegister.targetOrganization.phones[0].number}}<br>\n"+
"      {{usersRegister.targetOrganization.addresses[0].streets[0]}}<br>\n"+
"      {{usersRegister.targetOrganization.addresses[0].city}}, {{usersRegister.targetOrganization.addresses[0].state}} \n"+
"      {{usersRegister.targetOrganization.addresses[0].postal}}<br>\n"+
"      {{usersRegister.targetOrganization.addresses[0].country}}</p>\n"+
"\n"+
"      <p>{{'cui-inv-user-popover-info' | translate}}</p>\n"+
"    </div>\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/registration/userInvited/userInvited-steps/userInvited-applications.html',
"<!-- No Organization Applications -->\n"+
"<div ng-if=\"!usersRegister.applications.list\">\n"+
"  {{'cui-org-no-applications' | translate}}\n"+
"  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n"+
"    <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"next()\">{{'cui-next' | translate}}</button>\n"+
"    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"goToStep(4)\">{{'cui-back-to-review' | translate}}</button>\n"+
"  </div>\n"+
"</div>\n"+
"\n"+
"<!-- Organization Applications -->\n"+
"<div ng-if=\"usersRegister.applications.list && (!usersRegister.applications.step || usersRegister.applications.step===1)\" ng-init=\"usersRegister.applications.step=1\">\n"+
"  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-app-name' | translate}}\" style=\"margin-bottom:20px;\" ng-model=\"usersRegister.applications.search\" ng-change=\"usersRegister.applications.searchApplications()\"/>\n"+
"  <div style=\"float:right\" class=\"cui-link\">\n"+
"    {{'cui-selections' | translate }}\n"+
"    <div class=\"cui-badge\" ng-bind=\"usersRegister.applications.numberOfSelected\"></div>\n"+
"  </div>\n"+
"\n"+
"  <div ng-repeat=\"application in usersRegister.applications.list | orderBy:'name' track by application.id\" style=\"margin-bottom:10px\">\n"+
"    <input id=\"application{{$index}}\" type=\"checkbox\" ng-model=\"usersRegister.applications.selected[$index]\" ng-true-value=\"'{{application.packageId}},{{application.name | cuiI18n}}'\" ng-false-value=\"null\" ng-change=\"usersRegister.applications.updateNumberOfSelected(usersRegister.applications.selected[$index])\" style=\"margin-right:10px\"/>\n"+
"    <label for=\"application{{$index}}\" ng-bind=\"application.name | cuiI18n\"></label>\n"+
"    <span style=\"float:right;clear:both;\">{{'cui-more-information' | translate }}</span>\n"+
"  </div>\n"+
"\n"+
"  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n"+
"    <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"    <button class=\"cui-wizard__next\" ng-click=\"usersRegister.applications.process()===0? next() : usersRegister.applications.step=2\">{{'cui-next' | translate}}</button>\n"+
"  </div>\n"+
"</div>\n"+
"\n"+
"<!-- Checkout Applications -->\n"+
"<div ng-if=\"usersRegister.applications.step===2\">\n"+
"  <span ng-click=\"usersRegister.applications.step=1\" translate>< {{'cui-all-applications'}}</span>\n"+
"  <div style=\"float:right\" class=\"cui-link\">\n"+
"    {{'cui-selections' | translate }}\n"+
"    <div class=\"cui-badge\" ng-bind=\"usersRegister.applications.numberOfSelected\"></div>\n"+
"  </div>\n"+
"  <ng-form name=\"selectApps\" class=\"application-review\">\n"+
"    <div class=\"application-review__name application-review__label\">\n"+
"      <span translate>{{ 'cui-application-name' }}</span>\n"+
"    </div>\n"+
"    <div class=\"application-review__tos-link application-review__label\">\n"+
"      <span translate>{{ 'cui-application-tos' }}</span>\n"+
"    </div>\n"+
"    <div class=\"application-review__tos-agreement application-review__label\">\n"+
"      <span translate>{{ 'cui-application-tos-agreement' }}</span>\n"+
"    </div>\n"+
"    <div ng-repeat=\"application in usersRegister.applications.processedSelected\" class=\"application-review__list\">\n"+
"      <div class=\"application-review__name\">\n"+
"        <span>{{application.name}}</span>\n"+
"      </div>\n"+
"      <div class=\"application-review__tos-link\">\n"+
"        <a class=\"cui-link\" translate>{{'cui-view-tos'}}</a>\n"+
"      </div>\n"+
"      <div class=\"application-review__tos-agreement\">\n"+
"        <div class=\"cui-switch\">\n"+
"          <input class=\"cui-switch__input\" ng-model=\"usersRegister.applications.processedSelected[$index].acceptedTos\" name=\"application{{$index}}\" id=\"application{{$index}}\" type=\"checkbox\" ng-required=\"true\"/>\n"+
"          <label class=\"cui-switch__label\" for=\"application{{$index}}\">\n"+
"            <div class=\"cui-switch__container\">\n"+
"              <span class=\"cui-switch__checked-message\">Accept</span>\n"+
"              <span class=\"cui-switch__unchecked-message\">Don't Accept</span>\n"+
"            </div>\n"+
"          </label>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </ng-form>\n"+
"\n"+
"  <div class=\"cui-wizard__step-error\" ng-if=\"!selectApps.$valid && usersRegister.applications.formTouched\">{{ 'cui-package-tos' | translate }}</div>\n"+
"  <div class=\"cui-wizard__controls\">\n"+
"    <button class=\"cui-wizard__previous\" ng-click=\"usersRegister.applications.step=usersRegister.applications.step-1\"><< {{'cui-all-applications' | translate}}</button>\n"+
"    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"usersRegister.applications.formTouched=true;nextWithErrorChecking(selectApps)\" ng-class=\"{'cui-wizard__next--error' : !selectApps.$valid }\">{{'cui-next' | translate}}</button>\n"+
"    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"selectApps.$valid && goToStep(4)\" ng-class=\"{'cui-wizard__next--error': !selectApps.$valid}\">{{'cui-back-to-review' | translate}}</button>\n"+
"  </div>\n"+
"</div>\n");



$templateCache.put('assets/modules/registration/userInvited/userInvited-steps/userInvited-login.html',
"<ng-form name=\"userLogin\" novalidate>\n"+
"\n"+
"  <!-- First Row -->\n"+
"  <!-- User ID -->\n"+
"  <label for=\"userID\">{{'cui-user-id' | translate}}</label>\n"+
"  <div class=\"cui-error\" ng-messages=\"userLogin.userID.$error\" ng-if=\"userLogin.userID.$touched\">\n"+
"    <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"  </div>\n"+
"  <input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.username\">\n"+
"\n"+
"  <!-- Second row -->\n"+
"  <div class=\"cui-wizard__field-row\">\n"+
"    <!-- Password -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <div class=\"cui-input__password-holder\">\n"+
"        <label>{{'cui-password' | translate}}</label>\n"+
"        <div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n"+
"          <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"        </div>\n"+
"        <input type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.password\" ng-class=\"{'cui-input--error': usersRegister.password.$touched && usersRegister.password.$invalid}\" password-validation ng-model-options=\"{allowInvalid:true}\" ng-change=\"usersRegister.userLogin.hiddenPassword=base.generateHiddenPassword(usersRegister.userLogin.password)\">\n"+
"        <div password-popover ng-messages=\"userLogin.password.$error\" ng-messages-multiple ng-if=\"userLogin.password.$invalid\" class=\"cui-error__password\">\n"+
"          <div ng-messages-include=\"assets/app/common-templates/password-validation.html\"></div>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"\n"+
"    <!-- Re-enter Password -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{'cui-password-re' | translate}}</label>\n"+
"      <div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n"+
"        <div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n"+
"      </div>\n"+
"      <input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.passwordRe\" match=\"usersRegister.userLogin.password\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  <!-- Third row -->\n"+
"  <div class=\"cui-wizard__field-row\">\n"+
"    <!-- Challenge Question 1 -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{'cui-challenge-question' | translate}} 1</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"userLogin.challenge1.$error\" ng-if=\"userLogin.challenge1.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <select ng-model=\"usersRegister.userLogin.question1\" name=\"challenge1\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge1.$touched && userLogin.challenge1.$invalid }\" ng-options=\"question as question.question[0].text for question in usersRegister.userLogin.challengeQuestions1\">\n"+
"      </select>\n"+
"    </div>\n"+
"\n"+
"    <!-- Challenge Answer 1 -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{'cui-challenge-answer' | translate}} 1</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.challengeAnswer1\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  <!-- Fourth row -->\n"+
"  <div class=\"cui-wizard__field-row\">\n"+
"    <!-- Challenge Question 2 -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{'cui-challenge-question' | translate}} 2</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <select ng-model=\"usersRegister.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as question.question[0].text for question in usersRegister.userLogin.challengeQuestions2\">\n"+
"      </select>\n"+
"    </div>\n"+
"\n"+
"    <!-- Challenge Answer 2 -->\n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{'cui-challenge-answer' | translate}} 2</label>\n"+
"      <div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n"+
"        <div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"      </div>\n"+
"      <input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"usersRegister.userLogin.challengeAnswer2\">\n"+
"    </div>\n"+
"  </div>\n"+
"</ng-form>\n"+
"\n"+
"<div class=\"cui-wizard__controls\">\n"+
"  <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"  <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n"+
"  <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"userLogin.$valid && goToStep(4)\" ng-class=\"!userLogin.$valid? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n"+
"</div>\n");



$templateCache.put('assets/modules/registration/userInvited/userInvited-steps/userInvited-review.html',
"\n"+
"<cui-expandable class=\"cui-expandable expanded\">\n"+
"\n"+
"  <div class=cui-expandable__edit-button ng-click=goToStep(1)>\n"+
"    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n"+
"  </div>\n"+
"\n"+
"  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n"+
"    {{'cui-user-information' | translate}}\n"+
"    <span class=chevron>></span>\n"+
"  </cui-expandable-title>\n"+
"\n"+
"  <cui-expandable-body class=cui-expandable__body>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-first-name' | translate}}: <span class=review-item__value>{{usersRegister.user.name.given}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-last-name' | translate}}: <span class=review-item__value>{{usersRegister.user.name.surname}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-country' | translate}}: <span class=review-item__value>{{usersRegister.userCountry.title || usersRegister.userCountry}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].streets[0] && usersRegister.user.addresses[0].streets[0]!==''\">{{'cui-address-1' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].streets[0]}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].streets[1] && usersRegister.user.addresses[0].streets[1]!==''\">{{'cui-address-2' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].streets[1]}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].city && usersRegister.user.addresses[0].city!==''\">{{'cui-city' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].city}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].state && usersRegister.user.addresses[0].state!==''\">{{'cui-state' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].state}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.addresses[0].postal && usersRegister.user.addresses[0].postal!==''\">{{'cui-postal' | translate}}: <span class=review-item__value>{{usersRegister.user.addresses[0].postal}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"usersRegister.user.phones[0].number && usersRegister.user.phones[0].number!==''\">{{'cui-telephone' | translate}}: <span class=review-item__value>{{usersRegister.user.phones[0].number}}</span></div>\n"+
"  </cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"\n"+
"<cui-expandable class=\"cui-expandable expanded\">\n"+
"\n"+
"  <div class=cui-expandable__edit-button ng-click=goToStep(2)>\n"+
"    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n"+
"  </div>\n"+
"\n"+
"  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n"+
"    {{'cui-sign-in-information' | translate}}\n"+
"    <span class=chevron>></span>\n"+
"  </cui-expandable-title>\n"+
"\n"+
"  <cui-expandable-body class=cui-expandable__body>\n"+
"    \n"+
"     <div class=cui-expandable__review-item>{{'cui-user-id' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.username}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-password' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.hiddenPassword}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.question1.question[0].text}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.challengeAnswer1}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.question2.question[0].text}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}: <span class=review-item__value>{{usersRegister.userLogin.challengeAnswer2}}</span></div>\n"+
"  </cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"\n"+
"<cui-expandable class=\"cui-expandable expanded\">\n"+
"  <div class=cui-expandable__edit-button ng-click=goToStep(3)>\n"+
"    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n"+
"  </div>\n"+
"\n"+
"  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n"+
"    {{'cui-application-selection' | translate}}\n"+
"    <span class=chevron>></span>\n"+
"  </cui-expandable-title>\n"+
"\n"+
"  <cui-expandable-body class=cui-expandable__body>\n"+
"    <div class=cui-expandable__review-item ng-if=\"usersRegister.applications.processedSelected.length===0 || !usersRegister.applications.processedSelected.length\">\n"+
"      <span class=cui-link ng-click=goToStep(3)>{{'no-applications-selected' | translate}}</span>\n"+
"    </div>\n"+
"\n"+
"    <div class=cui-expandable__review-item ng-repeat=\"application in usersRegister.applications.processedSelected\">{{application.name}}</div>\n"+
"  </cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"<div class=cui-wizard__controls>\n"+
"  <button class=cui-wizard__next ng-click=\"userInvitedRegForm.$valid && usersRegister.submit()\" ng-class=\"(!userInvitedRegForm.$valid)? 'cui-wizard__next--error' : usersRegister.sucess? 'success' : usersInvite.success===false? 'fail' : ''\" style=position:relative>\n"+
"    <div class=cui-loading--medium-ctr ng-if=usersRegister.submitting></div>\n"+
"    <span ng-if=\"!usersRegister.submitting && usersRegister.success!=false\">{{'cui-submit' | translate}}</span>\n"+
"    <span ng-if=\"usersRegister.success===false\">Error! Try again?</span>\n"+
"  </button>\n"+
"</div>");



$templateCache.put('assets/modules/registration/userInvited/userInvited-steps/userInvited-userProfile.html',
"<ng-form name=user novalidate>\n"+
"\n"+
"  \n"+
"  <p>{{\"cui-all-fields-required\" | translate}}. {{\"cui-complete-registration\" | translate}}\n"+
"    <a href class=\"cui-link--medium-light cui-link--no-decoration\" ng-click=usersRegister.applications.toggleCovisintInfo()>{{usersRegister.targetOrganization.name}}\n"+
"      <div ng-include=\"'assets/app/registration/userInvited/complete-registration-popover.html'\"></div>\n"+
"    </a>\n"+
"  </p>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"usersRegister.user.name.given\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <input type=text ng-model=usersRegister.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=country>{{\"cui-country\" | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <div auto-complete input-name=country pause=100 selected-object=usersRegister.userCountry local-data=base.countries.list search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=usersRegister.userCountry></div>\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-address\" | translate}} 1</label>\n"+
"      <input type=text ng-model=usersRegister.user.addresses[0].streets[0] class=cui-input name=address1>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-address\" | translate}} 2</label>\n"+
"      <input type=text ng-model=usersRegister.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-city\" | translate}}</label>\n"+
"      <input type=text ng-model=usersRegister.user.addresses[0].city class=cui-input name=city>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-state\" | translate}}</label>\n"+
"      <input type=text ng-model=usersRegister.user.addresses[0].state class=cui-input name=state>\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n"+
"      <input type=text ng-model=usersRegister.user.addresses[0].postal class=cui-input name=\"postal\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-telephone\" | translate}}</label>\n"+
"      <input type=text ng-model=usersRegister.user.phones[0].number class=cui-input name=\"postal\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-tos-container>\n"+
"    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n"+
"    <label for=TOS class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n"+
"      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n"+
"      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n"+
"    </label>\n"+
"    <span class=cui-wizard__step-error ng-if=\"user.TOS.$error.required && user.TOS.$touched\"><br><br> {{'cui-tos-agree' | translate}} </span>\n"+
"  </div>\n"+
"</ng-form>\n"+
"\n"+
"<div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n"+
"  <button class=cui-wizard__next ng-if=!wizardFinished ng-click=nextWithErrorChecking(user) ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n"+
"  <button class=cui-wizard__next ng-if=wizardFinished ng-click=\"user.$valid && goToStep(4)\" ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n"+
"</div>");



$templateCache.put('assets/modules/registration/userInvited/userInvited.html',
"<div class=cui-form--mobile-steps>\n"+
"  <div class=cui-form__title>{{'create-account' | translate}}</div>\n"+
"  <div class=cui-form__body>\n"+
"    <cui-wizard bar mobile-stack class=cui-wizard step=1 clickable-indicators minimum-padding=30>\n"+
"      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n"+
"      <ng-form name=userInvitedRegForm novalidate>\n"+
"\n"+
"        \n"+
"        <step step-title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n"+
"          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.userProfile.html'\"></div>\n"+
"        </step>\n"+
"\n"+
"        \n"+
"        <step step-title=\"{{'cui-login' | translate}}\" icon=cui:login>\n"+
"          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.login.html'\"></div>\n"+
"        </step>\n"+
"\n"+
"        \n"+
"        <step step-title=\"{{'cui-applications' | translate}}\" icon=cui:applications>\n"+
"          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.applications.html'\"></div>\n"+
"        </step>\n"+
"\n"+
"        \n"+
"        <step step-title=\"{{'cui-review' | translate}}\" icon=cui:review>\n"+
"          <div ng-include=\"'assets/app/registration/userInvited/users.register-steps/users.register.review.html'\"></div>\n"+
"        </step>\n"+
"\n"+
"      </ng-form>\n"+
"    </cui-wizard>\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/registration/userWalkup/userWalkup-steps/userWalkup-applications.html',
"<!-- If there's no applications in that organization -->\n"+
"<div ng-if=\"!userWalkup.applications.list\">\n"+
"  Seems like your organization doesn't have any applications. You can always try again after logging in.\n"+
"  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n"+
"    <button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"next()\">{{'cui-next' | translate}}</button>\n"+
"    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"goToStep(5)\">{{'cui-back-to-review' | translate}}</button>\n"+
"  </div>\n"+
"</div>\n"+
"\n"+
"<!-- If there's applications -->\n"+
"<div ng-if=\"userWalkup.applications.list && (!userWalkup.applications.step || userWalkup.applications.step===1)\" ng-init=\"userWalkup.applications.step=1\">\n"+
"  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-app-name' | translate}}\" style=\"margin-bottom:20px;\" ng-model=\"userWalkup.applications.search\" ng-change=\"userWalkup.applications.searchApplications()\"/>\n"+
"  <div style=\"float:right\" class=\"cui-link\">\n"+
"    {{'cui-selections' | translate }}\n"+
"    <div class=\"cui-badge\" ng-bind=\"userWalkup.applications.numberOfSelected\"></div>\n"+
"  </div>\n"+
"\n"+
"  <div ng-repeat=\"application in userWalkup.applications.list | orderBy:'name' track by application.id\" style=\"margin-bottom:10px\">\n"+
"    <input id=\"application{{$index}}\" type=\"checkbox\" ng-model=\"userWalkup.applications.selected[$index]\" ng-true-value=\"'{{application.id}},{{application.name | cuiI18n}}'\" ng-false-value=\"null\" ng-change=\"userWalkup.applications.updateNumberOfSelected(userWalkup.applications.selected[$index])\" style=\"margin-right:10px\"/>\n"+
"    <label for=\"application{{$index}}\" ng-bind=\"application.name | cuiI18n\"></label>\n"+
"    <span style=\"float:right;clear:both;\">{{'cui-more-information' | translate }}</span>\n"+
"  </div>\n"+
"\n"+
"  <div class=\"cui-wizard__controls\" style=\"margin-top:20px\">\n"+
"  	<button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"    <button class=\"cui-wizard__next\" ng-click=\"userWalkup.applications.process()===0? next() : userWalkup.applications.step=2\">{{'cui-next' | translate}}</button>\n"+
"  </div>\n"+
"</div>\n"+
"\n"+
"<!-- Checkout Applications -->\n"+
"<div ng-if=\"userWalkup.applications.list && userWalkup.applications.step===2\">\n"+
"  <span ng-click=\"userWalkup.applications.step=1\" translate>< {{'cui-all-applications'}}</span>\n"+
"  <div style=\"float:right\" class=\"cui-link\">\n"+
"    {{'cui-selections' | translate }}\n"+
"    <div class=\"cui-badge\" ng-bind=\"userWalkup.applications.numberOfSelected\"></div>\n"+
"  </div>\n"+
"  <ng-form name=\"selectApps\" class=\"application-review\">\n"+
"    <div class=\"application-review__name application-review__label\">\n"+
"      <span translate>{{ 'cui-application-name' }}</span>\n"+
"    </div>\n"+
"    <div class=\"application-review__tos-link application-review__label\">\n"+
"      <span translate>{{ 'cui-application-tos' }}</span>\n"+
"    </div>\n"+
"    <div class=\"application-review__tos-agreement application-review__label\">\n"+
"      <span translate>{{ 'cui-application-tos-agreement' }}</span>\n"+
"    </div>\n"+
"    <div ng-repeat=\"application in userWalkup.applications.processedSelected\" class=\"application-review__list\">\n"+
"      <div class=\"application-review__name\">\n"+
"        <span>{{application.name}}</span>\n"+
"      </div>\n"+
"      <div class=\"application-review__tos-link\">\n"+
"        <a class=\"cui-link\" translate>{{'cui-view-tos'}}</a>\n"+
"      </div>\n"+
"      <div class=\"application-review__tos-agreement\">\n"+
"        <div class=\"cui-switch\">\n"+
"          <input class=\"cui-switch__input\" ng-model=\"userWalkup.applications.processedSelected[$index].acceptedTos\" name=\"application{{$index}}\" id=\"application{{$index}}\" type=\"checkbox\" ng-required=\"true\"/>\n"+
"          <label class=\"cui-switch__label\" for=\"application{{$index}}\">\n"+
"            <div class=\"cui-switch__container\">\n"+
"              <span class=\"cui-switch__checked-message\">Accept</span>\n"+
"              <span class=\"cui-switch__unchecked-message\">Don't Accept</span>\n"+
"            </div>\n"+
"          </label>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </ng-form>\n"+
"\n"+
"  <div class=\"cui-wizard__step-error\" ng-if=\"!selectApps.$valid && userWalkup.applications.formTouched\">{{ 'cui-package-tos' | translate }}</div>\n"+
"  <div class=\"cui-wizard__controls\">\n"+
"    <button class=\"cui-wizard__previous\" ng-click=\"userWalkup.applications.step=userWalkup.applications.step-1\"><< {{'cui-all-applications' | translate}}</button>\n"+
"    <button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"userWalkup.applications.formTouched=true;nextWithErrorChecking(selectApps)\" ng-class=\"{'cui-wizard__next--error' : !selectApps.$valid }\">{{'cui-next' | translate}}</button>\n"+
"    <button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"selectApps.$valid && goToStep(5)\" ng-class=\"{'cui-wizard__next--error': !selectApps.$valid}\">{{'cui-back-to-review' | translate}}</button>\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/registration/userWalkup/userWalkup-steps/userWalkup-login.html',
"<ng-form name=\"userLogin\" novalidate>\n"+
"\n"+
"	<!-- First Row -->\n"+
"	<!-- User ID -->\n"+
"	<label for=\"userID\">{{'cui-user-id' | translate}}</label>\n"+
"	<div class=\"cui-error\" ng-messages=\"userLogin.userID.$error\" ng-if=\"userLogin.userID.$touched\">\n"+
"		<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"	</div>\n"+
"	<input type=\"text\" name=\"userID\" class=\"cui-input\" ng-required=\"true\" ng-model=\"userWalkup.userLogin.username\" ng-class=\"{'cui-input--error' : userLogin.userID.$touched &&  userLogin.userID.$touched}\">\n"+
"\n"+
"	<!-- Second row -->\n"+
"	<div class=\"cui-wizard__field-row\">\n"+
"		<!-- Password -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<div class=\"cui-input__password-holder\">\n"+
"				<label>{{'cui-password' | translate}}</label>\n"+
"				<div class=\"cui-error\" ng-messages=\"userLogin.password.$error\" ng-if=\"userLogin.password.$touched\">\n"+
"					<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"				</div>\n"+
"				<input id=\"test-input\" type=\"password\" name=\"password\" class=\"cui-input\" ng-required=\"true\" ng-model=\"userWalkup.userLogin.password\" ng-class=\"{'cui-input--error': userLogin.password.$touched && userLogin.password.$invalid}\" password-validation ng-model-options=\"{allowInvalid:true}\" ng-change=\"userWalkup.userLogin.hiddenPassword=base.generateHiddenPassword(userWalkup.userLogin.password)\">\n"+
"				<!-- Password Rules Popover -->\n"+
"				<div password-popover ng-messages=\"userLogin.password.$error\" ng-messages-multiple class=\"cui-error__password\">\n"+
"					<div ng-messages-include=\"assets/app/common-templates/password-validation.html\"></div>\n"+
"				</div>\n"+
"			</div>\n"+
"		</div>\n"+
"\n"+
"		<!-- Re-enter Password -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-password-re' | translate}}</label>\n"+
"			<div class=\"cui-error\" ng-if=\"userLogin.passwordRe.$touched && userLogin.passwordRe.$error.match\">\n"+
"				<div class=\"cui-error__message\">{{'password-mismatch' | translate}}</div>\n"+
"			</div>\n"+
"			<input type=\"password\" name=\"passwordRe\" class=\"cui-input\" ng-required=\"true\" ng-model=\"userWalkup.userLogin.passwordRe\" match=\"userWalkup.userLogin.password\">\n"+
"		</div>\n"+
"	</div>\n"+
"\n"+
"	<!-- Third row -->\n"+
"	<div class=\"cui-wizard__field-row\">\n"+
"		<!-- Challenge Question 1 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-question' | translate}} 1</label>\n"+
"			<cui-dropdown ng-model=\"userWalkup.userLogin.question1\" class=\"cui-dropdown\" return-value=\"question\" display-value=\"(question.question | cuiI18n)\" options=\"userWalkup.userLogin.challengeQuestions1\">\n"+
"			</cui-dropdown>\n"+
"		</div>\n"+
"\n"+
"		<!-- Challenge Answer 1 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-answer' | translate}} 1</label>\n"+
"			<div class=\"cui-error\" ng-messages=\"userLogin.answer1.$error\" ng-if=\"userLogin.answer1.$touched\">\n"+
"				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"			</div>\n"+
"			<input type=\"text\" name=\"answer1\" class=\"cui-input\" ng-required=\"true\" ng-model=\"userWalkup.userLogin.challengeAnswer1\">\n"+
"		</div>\n"+
"	</div>\n"+
"\n"+
"	<!-- Fourth row -->\n"+
"	<div class=\"cui-wizard__field-row\">\n"+
"		<!-- Challenge Question 2 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-question' | translate}} 2</label>\n"+
"			<div class=\"cui-error\" ng-messages=\"userLogin.challenge2.$error\" ng-if=\"userLogin.challenge2.$touched\">\n"+
"				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"			</div>\n"+
"			<!-- <select ng-model=\"userWalkup.userLogin.question2\" name=\"challenge2\" ng-required=\"true\" class=\"cui-select\" ng-class=\"{'cui-input---error' : userLogin.challenge2.$touched && userLogin.challenge2.$invalid}\" ng-options=\"question as (question.question | cuiI18n) for question in userWalkup.userLogin.challengeQuestions2\"> -->\n"+
"			</select>\n"+
"			<cui-dropdown ng-model=\"userWalkup.userLogin.question2\" display-value=\"(question.question | cuiI18n)\" options=\"userWalkup.userLogin.challengeQuestions2\" name=\"challenge2\" return-value=\"option.name\" class=\"cui-dropdown\"></cui-dropdown>\n"+
"\n"+
"		</div>\n"+
"\n"+
"		<!-- Challenge Answer 2 -->\n"+
"		<div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"			<label>{{'cui-challenge-answer' | translate}} 2</label>\n"+
"			<div class=\"cui-error\" ng-messages=\"userLogin.answer2.$error\" ng-if=\"userLogin.answer2.$touched\">\n"+
"				<div ng-messages-include=\"assets/app/common-templates/messages.html\"></div>\n"+
"			</div>\n"+
"			<input type=\"text\" name=\"answer2\" class=\"cui-input\" ng-required=\"true\" ng-model=\"userWalkup.userLogin.challengeAnswer2\">\n"+
"		</div>\n"+
"	</div>\n"+
"\n"+
"</ng-form>\n"+
"\n"+
"<div class=\"cui-wizard__controls\">\n"+
"	<button class=\"cui-wizard__previous\" ng-if=\"!wizardFinished\" ng-click=\"previous()\"><< {{'cui-previous' | translate}}</button>\n"+
"	<button class=\"cui-wizard__next\" ng-if=\"!wizardFinished\" ng-click=\"nextWithErrorChecking(userLogin)\" ng-class=\"(userLogin.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n"+
"	<button class=\"cui-wizard__next\" ng-if=\"wizardFinished\" ng-click=\"userLogin.$valid && goToStep(5)\" ng-class=\"!userLogin.$valid? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n"+
"</div>\n");



$templateCache.put('assets/modules/registration/userWalkup/userWalkup-steps/userWalkup-organization.html',
"<ng-form name=\"organizationSelect\" novalidate>\n"+
"  <p>{{'cui-all-organizations' | translate}}</p>\n"+
"  <input class=\"cui-input--half\" placeholder=\"{{'cui-filter-org-name' | translate}}\" ng-model=\"userWalkup.orgSearch.name\">\n"+
"\n"+
"  <!-- Organization List Loading -->\n"+
"  <div class=\"cui-loading__container--organization-list\" ng-if=\"userWalkup.orgLoading\">\n"+
"    <div class=\"cui-loading--center\"><div class=\"cui-loading\"></div></div>\n"+
"  </div>\n"+
"\n"+
"  <cui-expandable class=\"cui-expandable\" ng-repeat=\"organization in userWalkup.organizationList | orderBy:'name' track by organization.id\" ng-if=\"!userWalkup.orgLoading\">\n"+
"    <cui-expandable-title class=\"cui-expandable__title cui-expandable__title--alt-layout\" ng-click=\"toggleExpand()\">\n"+
"      {{organization.name}}\n"+
"      <span class=\"chevron\">></span>\n"+
"    </cui-expandable-title>\n"+
"\n"+
"    <cui-expandable-body class=\"cui-expandable__body\">\n"+
"      <p>{{organization.id}}</p>\n"+
"      <p>{{organization.url}}</p>\n"+
"      <p>{{organization.phones[0].number}}</p>\n"+
"\n"+
"      <div class=\"cui-wizard__controls\">\n"+
"        <button class=\"cui-wizard__next\" ng-click=\"userWalkup.organization=organization;next()\">{{'cui-select-org' | translate}}</button>\n"+
"      </div>\n"+
"    </cui-expandable-body>\n"+
"  </cui-expandable>\n"+
"\n"+
"  <!-- Pagination Controls -->\n"+
"  <div class=\"cui-paginate__container\" ng-if=\"!userWalkup.orgLoading\">\n"+
"    <span class=\"cui-paginate__results-label\">{{'cui-num-results-page' | translate}}</span>\n"+
"    <results-per-page class=\"cui-paginate__select\" ng-model=\"userWalkup.orgPaginationSize\"></results-per-page>\n"+
"    <paginate class=\"cui-paginate\" results-per-page=\"userWalkup.orgPaginationSize\" count=\"userWalkup.organizationCount\" on-page-change=\"userWalkup.orgPaginationPageHandler\" ng-model=\"userWalkup.orgPaginationCurrentPage\"></paginate>\n"+
"  </div>\n"+
"</ng-form>\n"+
"\n"+
"<div class=\"cui-wizard__controls\">\n"+
"  <button class=\"cui-wizard__previous\" ng-click=\"previous()\" style=\"margin-right:0\"><< {{'cui-previous' | translate}}</button>\n"+
"</div>\n");



$templateCache.put('assets/modules/registration/userWalkup/userWalkup-steps/userWalkup-review.html',
"\n"+
"<cui-expandable class=\"cui-expandable expanded\">\n"+
"  <div class=cui-expandable__edit-button ng-click=goToStep(1)>\n"+
"    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n"+
"  </div>\n"+
"  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n"+
"    {{'cui-user-information' | translate}}\n"+
"    <span class=chevron>></span>\n"+
"  </cui-expandable-title>\n"+
"\n"+
"  <cui-expandable-body class=cui-expandable__body>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-first-name' | translate}}:<span class=review-item__value>{{userWalkup.user.name.given}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-last-name' | translate}}:<span class=review-item__value>{{userWalkup.user.name.surname}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-email' | translate}}:<span class=review-item__value>{{userWalkup.user.email}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-country' | translate}}:<span class=review-item__value>{{userWalkup.userCountry.title || userWalkup.userCountry}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"userWalkup.user.addresses[0].streets[0] && userWalkup.user.addresses[0].streets[0]!==''\">{{'cui-address-1' | translate}}:<span class=review-item__value>{{userWalkup.user.addresses[0].streets[0]}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"userWalkup.user.addresses[0].streets[1] && userWalkup.user.addresses[0].streets[1]!==''\">{{'cui-address-2' | translate}}:<span class=review-item__value>{{userWalkup.user.addresses[0].streets[1]}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"userWalkup.user.addresses[0].city && userWalkup.user.addresses[0].city!==''\">{{'cui-city' | translate}}:<span class=review-item__value>{{userWalkup.user.addresses[0].city}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"userWalkup.user.addresses[0].state && userWalkup.user.addresses[0].state!==''\">{{'cui-state' | translate}}:<span class=review-item__value>{{userWalkup.user.addresses[0].state}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"userWalkup.user.addresses[0].postal && userWalkup.user.addresses[0].postal!==''\">{{'cui-postal' | translate}}:<span class=review-item__value>{{userWalkup.user.addresses[0].postal}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item ng-if=\"userWalkup.user.phones[0].number && userWalkup.user.phones[0].number!==''\">{{'cui-telephone' | translate}}:<span class=review-item__value>{{userWalkup.user.phones[0].number}}</span></div>\n"+
"  </cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"\n"+
"<cui-expandable class=\"cui-expandable expanded\">\n"+
"  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n"+
"      {{'cui-organization-information' | translate}}\n"+
"      <span class=chevron>></span>\n"+
"    </cui-expandable-title>\n"+
"\n"+
"    <cui-expandable-body class=cui-expandable__body>\n"+
"      \n"+
"      <div class=cui-expandable__review-item>{{'cui-org' | translate}}:<span class=review-item__value>{{userWalkup.organization.name}}</span></div>\n"+
"  </cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"\n"+
"<cui-expandable class=\"cui-expandable expanded\">\n"+
"  <div class=cui-expandable__edit-button ng-click=goToStep(3)>\n"+
"    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n"+
"  </div>\n"+
"  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n"+
"    {{'cui-sign-in-information' | translate}}\n"+
"    <span class=chevron>></span>\n"+
"  </cui-expandable-title>\n"+
"\n"+
"  <cui-expandable-body class=cui-expandable__body>\n"+
"    \n"+
"     <div class=cui-expandable__review-item>{{'cui-user-id' | translate}}:<span class=review-item__value>{{userWalkup.userLogin.username}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-password' | translate}}:<span class=review-item__value>{{userWalkup.userLogin.hiddenPassword}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}:<span class=review-item__value>{{userWalkup.userLogin.question1.question | cuiI18n}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}:<span class=review-item__value>{{userWalkup.userLogin.challengeAnswer1}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-challenge-question' | translate}}:<span class=review-item__value>{{userWalkup.userLogin.question2.question | cuiI18n}}</span></div>\n"+
"    \n"+
"    <div class=cui-expandable__review-item>{{'cui-challenge-answer' | translate}}:<span class=review-item__value>{{userWalkup.userLogin.challengeAnswer2}}</span></div>\n"+
"  </cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"\n"+
"<cui-expandable class=\"cui-expandable expanded\">\n"+
"  <div class=cui-expandable__edit-button ng-click=goToStep(4)>\n"+
"    <cui-icon cui-svg-icon=fa:edit svg-class=cui-expandable__edit-icon></cui-icon>\n"+
"  </div>\n"+
"  <cui-expandable-title class=cui-expandable__title ng-click=toggleExpand()>\n"+
"    {{'cui-application-selection' | translate}}\n"+
"    <span class=chevron>></span>\n"+
"  </cui-expandable-title>\n"+
"\n"+
"  <cui-expandable-body class=cui-expandable__body>\n"+
"\n"+
"    <div class=cui-expandable__review-item ng-if=\"userWalkup.applications.processedSelected.length===0 || !userWalkup.applications.processedSelected.length\">\n"+
"      <span class=cui-link ng-click=goToStep(4)>{{'no-applications-selected' | translate}}</span>\n"+
"    </div>\n"+
"\n"+
"    <div class=cui-expandable__review-item ng-repeat=\"application in userWalkup.applications.processedSelected\">{{application.name}}</div>\n"+
"\n"+
"  </cui-expandable-body>\n"+
"</cui-expandable>\n"+
"\n"+
"<div class=cui-wizard__controls>\n"+
"\n"+
"  <div class=cui-error ng-if=userWalkup.registrationError><label>{{userWalkup.errorMessage | translate}}</label></div>\n"+
"\n"+
"  <button class=cui-wizard__next ng-click=\"userWalkupRegForm.$valid && userWalkup.submit()\" ng-class=\"(!userWalkupRegForm.$valid)? 'cui-wizard__next--error' : userWalkup.sucess? 'success' : usersInvite.success===false? 'fail' : ''\" style=position:relative>\n"+
"    <div class=cui-loading--medium-ctr ng-if=userWalkup.submitting></div>\n"+
"    <span ng-if=\"!userWalkup.submitting && userWalkup.success!=false\">{{'cui-submit' | translate}}</span>\n"+
"    <span ng-if=\"userWalkup.success===false\" name=review.btnError>Error! Try again?</span>\n"+
"  </button>\n"+
"</div>");



$templateCache.put('assets/modules/registration/userWalkup/userWalkup-steps/userWalkup-userProfile.html',
"<ng-form name=user novalidate>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=user-name-given>{{'cui-first-name' | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.firstName.$error ng-if=user.firstName.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <input type=text name=firstName class=cui-input ng-required=true ng-model=\"userWalkup.user.name.given\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=user-name-surname>{{'cui-last-name' | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.lastName.$error ng-if=user.lastName.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <input type=text ng-model=userWalkup.user.name.surname name=lastName class=cui-input ng-required=\"true\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{'cui-email' | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.email.$error ng-if=user.email.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <input type=email name=email class=cui-input ng-required=true ng-model=\"userWalkup.user.email\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{'cui-email-re' | translate}}</label>\n"+
"      <div class=cui-error ng-if=\"user.emailRe.$touched && user.emailRe.$error.match\">\n"+
"        <div class=cui-error__message>{{'email-mismatch' | translate}}</div>\n"+
"      </div>\n"+
"      <input type=text ng-model=userWalkup.emailRe name=emailRe class=cui-input ng-required=true match=\"userWalkup.user.email\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=country>{{\"cui-country\" | translate}}</label>\n"+
"      <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n"+
"        <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"      </div>\n"+
"      <div auto-complete input-name=country pause=100 selected-object=userWalkup.userCountry local-data=base.countries.list search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true field-required=userWalkup.userCountry></div>\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-address\" | translate}} 1</label>\n"+
"      <input type=text ng-model=userWalkup.user.addresses[0].streets[0] class=cui-input name=address1>\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-address\" | translate}} 2</label>\n"+
"      <input type=text ng-model=userWalkup.user.addresses[0].streets[1] class=cui-input name=address1 placeholder=\"{{'cui-address-example' | translate}}\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-city\" | translate}}</label>\n"+
"      <input type=text ng-model=userWalkup.user.addresses[0].city class=cui-input name=\"city\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-state\" | translate}}</label>\n"+
"      <input type=text ng-model=userWalkup.user.addresses[0].state class=cui-input name=\"state\">\n"+
"    </div>\n"+
"\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label for=postal-code>{{\"cui-postal\" | translate}}</label>\n"+
"      <input type=text ng-model=userWalkup.user.addresses[0].postal class=cui-input name=\"postal\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-wizard__field-row>\n"+
"    \n"+
"    <div class=\"cui-wizard__field-container cui-wizard__field-container--half\">\n"+
"      <label>{{\"cui-telephone\" | translate}}</label>\n"+
"      <input type=text ng-model=userWalkup.user.phones[0].number class=cui-input name=\"postal\">\n"+
"    </div>\n"+
"  </div>\n"+
"\n"+
"  \n"+
"  <div class=cui-tos-container>\n"+
"    <input type=checkbox name=TOS id=TOS ng-model=usersRegister.tos ng-required=true class=cui-checkbox>\n"+
"    <label ng-click=\"usersRegister.tos=!usersRegister.tos\" class=cui-checkbox__label> {{'cui-agree-covisint' | translate}}\n"+
"      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'terms-of-service' | translate}}</a> {{'cui-and' | translate}}\n"+
"      <a href=\"\" class=\"cui-link--medium-light cui-link--no-decoration\">{{'privacy-policy' | translate}}</a>\n"+
"    </label>\n"+
"    <span class=cui-wizard__step-error ng-if=\"user.TOS.$touched && user.TOS.$error.required\"><br><br> {{'cui-tos-agree' | translate}} </span>\n"+
"  </div>\n"+
"\n"+
"  <div class=\"cui-wizard__controls cui-wizard__controls--clear\">\n"+
"    <button class=cui-wizard__next ng-if=!wizardFinished ng-click=nextWithErrorChecking(user) ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-next' | translate}}</button>\n"+
"    <button class=cui-wizard__next ng-if=wizardFinished ng-click=\"user.$valid && goToStep(5)\" ng-class=\"(user.$invalid)? 'cui-wizard__next--error' : ''\">{{'cui-back-to-review' | translate}}</button>\n"+
"  </div>\n"+
"</ng-form>");



$templateCache.put('assets/modules/registration/userWalkup/userWalkup.html',
"<div class=cui-form--mobile-steps>\n"+
"  <div class=cui-form__title>{{'create-account' | translate}}</div>\n"+
"  <div class=cui-form__body>\n"+
"    <cui-wizard bar mobile-stack=700 class=cui-wizard step=1 minimum-padding=100 clickable-indicators>\n"+
"      <indicator-container class=\"indicator-container indicator-container--icons\"></indicator-container>\n"+
"\n"+
"      <ng-form name=userWalkupRegForm novalidate>\n"+
"        <step step-title=\"{{'cui-user-profile' | translate}}\" icon=cui:user>\n"+
"          <div ng-include=\"'assets/modules/registration/userWalkup/userWalkup-steps/userWalkup-userProfile.html'\"></div>\n"+
"        </step>\n"+
"\n"+
"        <step step-title=\"{{'cui-org' | translate}}\" icon=cui:skyscraper>\n"+
"          <div ng-include=\"'assets/modules/registration/userWalkup/userWalkup-steps/userWalkup-organization.html'\"></div>\n"+
"        </step>\n"+
"\n"+
"        <step step-title=\"{{'cui-login' | translate}}\" icon=cui:login>\n"+
"          <div ng-include=\"'assets/modules/registration/userWalkup/userWalkup-steps/userWalkup-login.html'\"></div>\n"+
"        </step>\n"+
"\n"+
"        <step step-title=\"{{'cui-applications' | translate}}\" icon=cui:applications>\n"+
"          <div ng-include=\"'assets/modules/registration/userWalkup/userWalkup-steps/userWalkup-applications.html'\"></div>\n"+
"        </step>\n"+
"\n"+
"        <step step-title=\"{{'cui-review' | translate}}\" icon=cui:review>\n"+
"          <div ng-include=\"'assets/modules/registration/userWalkup/userWalkup-steps/userWalkup-review.html'\"></div>\n"+
"        </step>\n"+
"      </ng-form>\n"+
"    \n"+
"  </cui-wizard></div>\n"+
"</div>");



$templateCache.put('assets/modules/user/profile/sections/address.html',
"<ng-form name=address>\n"+
"  <div class=cui-users__field>\n"+
"    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n"+
"      <div class=cui-users__field>\n"+
"        <span class=cui-field-val__field>{{'cui-address' | translate}}</span>\n"+
"        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n"+
"          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"      \n"+
"      <div ng-if=!toggled>\n"+
"        <div class=cui-field-val__val>{{userProfile.user.addresses[0].streets[0]}} </div>\n"+
"        <div class=cui-field-val__val ng-if=userProfile.user.addresses[0].streets[1]>{{userProfile.user.addresses[0].streets[1]}}</div>\n"+
"        <div class=cui-field-val__val>{{userProfile.user.addresses[0].city}}</div>\n"+
"        <div class=cui-field-val__val>{{userProfile.user.addresses[0].state}}<span ng-if=\"userProfile.user.addresses[0].state && userProfile.user.addresses[0].postal\">, </span>{{userProfile.user.addresses[0].postal}}</div>\n"+
"        <div class=cui-field-val__val>{{base.countries.getCountryByCode(userProfile.user.addresses[0].country).name}}</div>\n"+
"      </div>\n"+
"      \n"+
"      <div ng-if=toggled ng-init=\"userProfile.pushToggleOff({'name':'address','function':toggleOff})\">\n"+
"        \n"+
"        <label for=\"{{'cui-street-address' | translate}}\">{{'cui-street-address' | translate}}</label>\n"+
"        <input type=text name=\"{{'cui-street-address' | translate}}\" class=cui-input ng-model=userProfile.tempUser.addresses[0].streets[0]>\n"+
"        \n"+
"        <label for=\"{{'cui-address-2' | translate}}\">{{'cui-address-2' | translate}}</label>\n"+
"        <input type=text name=\"{{'cui-address-2' | translate}}\" ng-model=userProfile.tempUser.addresses[0].streets[1] class=cui-input>\n"+
"        \n"+
"        <label for=\"{{'cui-city' | translate}}\">{{'cui-city' | translate}}</label>\n"+
"        <input type=text name=\"{{'cui-city' | translate}}\" class=cui-input ng-model=userProfile.tempUser.addresses[0].city>\n"+
"        \n"+
"        <div class=cui-form__field-row>\n"+
"          <div class=\"cui-form__field-container cui-form__field-container--half\">\n"+
"            <label for=\"{{'cui-state' | translate}}\">{{'cui-state' | translate}}</label>\n"+
"            <input type=text name=\"{{'cui-state' | translate}}\" class=cui-input ng-model=userProfile.tempUser.addresses[0].state>\n"+
"          </div>\n"+
"          \n"+
"          <div class=\"cui-form__field-container cui-form__field-container--half\">\n"+
"            <label for=\"{{'cui-zip' | translate}}\">{{'cui-zip' | translate}}</label>\n"+
"            <input type=text name=\"{{'cui-zip' | translate}}\" class=cui-input ng-model=userProfile.tempUser.addresses[0].postal>\n"+
"          </div>\n"+
"        </div>\n"+
"        \n"+
"        <div class=cui-wizard__field-container>\n"+
"          <label for=country>{{\"cui-country\" | translate}}</label>\n"+
"          <div class=cui-error ng-messages=user.country.$error ng-if=user.country.$touched>\n"+
"            <div ng-messages-include=assets/angular-templates/messages.html></div>\n"+
"          </div>\n"+
"          <div auto-complete input-name=country pause=100 selected-object=userProfile.userCountry initial-value=base.countries.getCountryByCode(userProfile.tempUser.addresses[0].country) local-data=base.countries.list search-fields=name title-field=name input-class=cui-input match-class=highlight auto-match=true></div>\n"+
"        </div>\n"+
"        \n"+
"        <div class=cui-users__address-submit>\n"+
"          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=\"userProfile.resetTempObject(userProfile.user, userProfile.tempUser); toggleOff()\">{{'cui-cancel' | translate}}</a>\n"+
"          <button class=cui-button ng-click=\"userProfile.updatePerson('address',toggleOff);\">\n"+
"            <span ng-if=\"!userProfile.address || !userProfile.address.submitting\">{{'cui-update' | translate}}</span>\n"+
"            <div class=cui-loading--medium-ctr ng-if=userProfile.address.submitting></div>\n"+
"            <span ng-if=userProfile.address.error>{{'cui-error-try-again'| translate}}</span>\n"+
"          </button>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</ng-form>");



$templateCache.put('assets/modules/user/profile/sections/basic-info.html',
"<ng-form name=basicInfo>\n"+
"  <div class=cui-users__field>\n"+
"    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n"+
"      <div class=cui-users__field>\n"+
"        <span class=cui-field-val__field>{{'basic-info' | translate}}</span>\n"+
"        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n"+
"          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"\n"+
"      <div ng-if=!toggled>\n"+
"        <span class=cui-field-val__field>{{'cui-name' | translate}}:</span>\n"+
"        <span class=cui-field-val__val>{{userProfile.user.name.given}} {{userProfile.user.name.surname}}</span><br>\n"+
"        <span class=cui-field-val__field>{{'cui-email' | translate}}:</span>\n"+
"        <span class=cui-field-val__val>{{userProfile.user.email}} </span>\n"+
"      </div>\n"+
"\n"+
"      \n"+
"      <div ng-if=toggled ng-init=\"userProfile.pushToggleOff({'name':'basicInfo','function':toggleOff})\">\n"+
"        \n"+
"        <label for=firstName>{{'cui-first-name' | translate}}</label>\n"+
"        <div class=cui-error ng-messages=basicInfo.firstName.$error>\n"+
"          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"        </div>\n"+
"        <input type=text name=firstName class=cui-input ng-model=userProfile.tempUser.name.given ng-required=true focus-if=toggled>\n"+
"        \n"+
"        <label for=lastName>{{'cui-last-name' | translate}}</label>\n"+
"        <div class=cui-error ng-messages=basicInfo.lastName.$error>\n"+
"          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"        </div>\n"+
"        <input type=text name=lastName class=cui-input ng-model=userProfile.tempUser.name.surname ng-required=true>\n"+
"        \n"+
"        <label for=email>{{'cui-email' | translate}}</label>\n"+
"        <div class=cui-error ng-messages=basicInfo.email.$error>\n"+
"          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"        </div>\n"+
"        <input type=email name=email class=cui-input ng-model=userProfile.tempUser.email ng-required=true>\n"+
"        \n"+
"        <div class=cui-users__address-submit>\n"+
"          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n"+
"          <button class=cui-button ng-click=\"basicInfo.$valid && userProfile.updatePerson('basicInfo',toggleOff);\" ng-class=\"{'cui-button--error':!basicInfo.$valid}\">\n"+
"            <span ng-if=\"!userProfile.basicInfo || !userProfile.basicInfo.submitting\">{{'cui-update' | translate}}</span>\n"+
"            <div class=cui-loading--medium-ctr ng-if=userProfile.basicInfo.submitting></div>\n"+
"            <span ng-if=userProfile.basicInfo.error>{{'cui-error-try-again'| translate}}</span>\n"+
"          </button>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</ng-form>");



$templateCache.put('assets/modules/user/profile/sections/challenge-questions.html',
"<ng-form name=challengeQuestions>\n"+
"  <div class=cui-users__field>\n"+
"    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n"+
"      <div class=cui-users__field>\n"+
"        <span class=cui-field-val__field>{{'challenge-questions' | translate}}</span>\n"+
"        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n"+
"          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"      <div ng-if=!toggled>\n"+
"        <div ng-repeat=\"question in userProfile.challengeQuestionsTexts\">\n"+
"          <span class=cui-field-val__field>{{$index+1}}:</span>\n"+
"          <span class=cui-field-val__val>{{question}}</span>\n"+
"          \n"+
"        </div>\n"+
"      </div>\n"+
"\n"+
"      \n"+
"      <div ng-if=toggled ng-init=\"userProfile.pushToggleOff({'name':'challengeQuestions','function':toggleOff})\">\n"+
"        <div ng-repeat=\"question in userProfile.tempUserSecurityQuestions\">\n"+
"          <b>{{'cui-challenge-question' | translate}} {{$index+1}}</b>\n"+
"          <select class=\"cui-input cui-input--full cui-select\" ng-model=question.question.id ng-options=\"question.id as (question.question | cuiI18n) for question in userProfile['allChallengeQuestions' + $index]\"></select>\n"+
"          {{'cui-answer' | translate}}\n"+
"          <div class=cui-error ng-messages=\"challengeQuestions['answer' + $index].$error\">\n"+
"            <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"          </div>\n"+
"          <input type=text ng-model=question.answer class=cui-input ng-class=\"{'cui-input--error':!challengeQuestions['answer'+$index].$valid}\" name=answer{{$index}} ng-change=userProfile.checkIfRepeatedSecurityAnswer(userProfile.tempUserSecurityQuestions,challengeQuestions) ng-required=\"true\">\n"+
"          <br><br>\n"+
"        </div>\n"+
"        \n"+
"        <div class=cui-users__address-submit>\n"+
"          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n"+
"          <button class=cui-button ng-click=\"userProfile.saveChallengeQuestions('challengeQuestions',toggleOff);\" ng-class=\"{'cui-button--error':!challengeQuestions.$valid}\">\n"+
"            <span ng-if=\"( !userProfile.challengeQuestions || !userProfile.challengeQuestions.submitting ) && !userProfile.challengeQuestions.error\">{{'cui-update' | translate}}</span>\n"+
"            <div class=cui-loading--medium-ctr ng-if=userProfile.challengeQuestions.submitting></div>\n"+
"            <span ng-if=userProfile.challengeQuestions.error>{{'cui-error-try-again'| translate}}</span>\n"+
"          </button>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</ng-form>");



$templateCache.put('assets/modules/user/profile/sections/header.html',
"<div class=cui-users__profile-media ng-if=!userProfile.loading>\n"+
"  <div class=cui-media>\n"+
"    <div class=cui-media__image-container>\n"+
"      \n"+
"      <div class=cui-media__image cui-avatar cui-avatar-names=\"[userProfile.user.name.given, userProfile.user.name.surname]\" cui-avatar-color-class-prefix=cui-avatar__color cui-avatar-color-count=5></div>\n"+
"    </div>\n"+
"    <div class=cui-media__body>\n"+
"      \n"+
"      <h3 class=cui-media__title>{{userProfile.user.name.given}} {{userProfile.user.name.surname}}</h3>\n"+
"      \n"+
"      <p class=cui-media__content--small>{{'cui-registered' | translate}}: {{userProfile.user.creation | date:base.appConfig.dateFormat}}</p>\n"+
"      <p class=cui-media__content--small>{{'cui-user-id' | translate}}: {{userProfile.user.id}}</p>\n"+
"    </div>\n"+
"  </div>\n"+
"</div>");



$templateCache.put('assets/modules/user/profile/sections/password.html',
"<ng-form name=password>\n"+
"  <div class=cui-users__field>\n"+
"    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n"+
"      <div class=cui-users__field>\n"+
"        <span class=cui-field-val__field>{{'password-reset' | translate}}</span>\n"+
"        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=userProfile.resetPasswordFields();toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n"+
"          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"\n"+
"      \n"+
"      <div ng-if=toggled ng-init=\"userProfile.pushToggleOff({'name':'password','function':toggleOff})\">\n"+
"\n"+
"        \n"+
"        <label for=currentPassword>{{'current-password' | translate}}</label>\n"+
"        <div class=cui-error ng-messages=password.currentPassword.$error ng-if=password.currentPassword.$touched>\n"+
"          <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"        </div>\n"+
"        <input type=password name=currentPassword class=cui-input ng-model=userProfile.userPasswordAccount.currentPassword ng-required=true focus-if=\"toggled\">\n"+
"\n"+
"        \n"+
"        <div class=cui-input__password-holder>\n"+
"          <label for=newPassword>{{'cui-enter-new-password' | translate}}: </label>\n"+
"          <input class=cui-input name=newPassword type=password ng-model=userProfile.userPasswordAccount.password ng-required=true ng-class=\"{'cui-input--error': password.newPassword.$touched && password.newPassword.$invalid}\" password-validation>\n"+
"          \n"+
"          <div password-popover ng-messages=password.newPassword.$error ng-messages-multiple ng-if=password.newPassword.$invalid class=cui-error__password>\n"+
"            <div ng-messages-include=assets/app/common-templates/password-validation.html></div>\n"+
"          </div>\n"+
"        </div>\n"+
"\n"+
"        \n"+
"        <label for=newPasswordRe>{{'cui-re-enter-new-password' | translate}}: </label>\n"+
"        <div class=cui-error ng-if=\"password.newPasswordRe.$touched && password.newPasswordRe.$error.match\">\n"+
"          <div class=cui-error__message>{{'password-mismatch' | translate}}</div>\n"+
"        </div>\n"+
"        <input class=\"cui-input cui-field-val__val\" type=password ng-model=userProfile.passwordRe name=newPasswordRe match=\"userProfile.userPasswordAccount.password\">\n"+
"\n"+
"        \n"+
"        <div class=cui-users__address-submit>\n"+
"          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=userProfile.resetPasswordFields();toggleOff()>{{'cui-cancel' | translate}}</a>\n"+
"          <button class=cui-button ng-click=\"password.$valid && userProfile.updatePassword('password',toggleOff);\" ng-class=\"{'cui-button--error':!password.$valid}\">\n"+
"            <span ng-if=\"(!userProfile.password || !userProfile.password.submitting) && !userProfile.password.error\">{{'cui-update' | translate}}</span>\n"+
"            <div class=cui-loading--medium-ctr ng-if=userProfile.password.submitting></div>\n"+
"            <span ng-if=userProfile.password.error>{{'cui-error-try-again'| translate}}</span>\n"+
"          </button>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</ng-form>");



$templateCache.put('assets/modules/user/profile/sections/phone-fax.html',
"<ng-form name=phoneFax>\n"+
"  <div class=cui-users__field>\n"+
"    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n"+
"      <div class=cui-users__field>\n"+
"        <span class=cui-field-val__field>{{'cui-phone-fax' | translate}}</span>\n"+
"        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n"+
"          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"\n"+
"      <div ng-if=!toggled ng-repeat=\"phone in userProfile.user.phones\">\n"+
"        <span class=cui-field-val__field>{{phone.type}}:</span>\n"+
"        <span class=cui-field-val__val>{{phone.number}}</span>\n"+
"      </div>\n"+
"\n"+
"      \n"+
"      <div ng-if=toggled>\n"+
"        \n"+
"        <div ng-repeat=\"phone in userProfile.tempUser.phones\">\n"+
"          <label>{{phone.type}}</label>\n"+
"          <div ng-messages=\"phoneFax['phone'+$index].$error\" class=cui-error>\n"+
"            <div ng-messages-include=assets/app/common-templates/messages.html></div>\n"+
"          </div>\n"+
"          <input class=cui-input type=text ng-model=phone.number name=phone{{$index}} ng-required=\"true\">\n"+
"        </div>\n"+
"        \n"+
"        <div class=cui-users__address-submit>\n"+
"          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n"+
"          <button class=cui-button ng-click=\"phoneFax.$valid && userProfile.updatePerson('phoneFax',toggleOff);\" ng-class=\"{'cui-button--error':!phoneFax.$valid}\">\n"+
"            <span ng-if=\"!userProfile.phoneFax || !userProfile.phoneFax.submitting\">{{'cui-update' | translate}}</span>\n"+
"            <div class=cui-loading--medium-ctr ng-if=userProfile.phoneFax.submitting></div>\n"+
"            <span ng-if=userProfile.phoneFax.error>{{'cui-error-try-again'| translate}}</span>\n"+
"          </button>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</ng-form>");



$templateCache.put('assets/modules/user/profile/sections/timezone-language.html',
"<ng-form name=timezoneLanguage>\n"+
"  <div class=cui-users__field>\n"+
"    <div class=cui-users__address-container class-toggle toggled-class=show-address>\n"+
"      <div class=cui-users__field>\n"+
"        <span class=cui-field-val__field>{{'timezone-and-language' | translate}}</span>\n"+
"        <span class=cui-link href=\"\" ng-if=!toggled ng-click=userProfile.toggleAllOff();toggleOn()>{{'cui-open' | translate}}</span>\n"+
"        <svg xmlns=http://www.w3.org/2000/svg class=cui-action__icon ng-if=toggled ng-click=toggleOff() preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 48 53\" aria-label=\"{{'cui-close' | translate}}\">\n"+
"          <use class=cui-icon__ref xlink:href=bower_components/cui-icons/dist/icons/icons-out.svg#close-no-fill></use>\n"+
"        </svg>\n"+
"      </div>\n"+
"      <div ng-if=!toggled>\n"+
"        <span class=cui-field-val__field>{{'cui-timezone' | translate}}:</span>\n"+
"        <span class=cui-field-val__val>{{userProfile.timezoneById(userProfile.user.timezone)}}</span><br>\n"+
"        <span class=cui-field-val__field>{{'cui-language' | translate}}:</span>\n"+
"        <span class=cui-field-val__val>{{base.languages[userProfile.user.language]}}</span>\n"+
"      </div>\n"+
"\n"+
"      \n"+
"      <div ng-if=toggled ng-init=\"userProfile.pushToggleOff({'name':'timezoneLangauge','function':toggleOff})\">\n"+
"        \n"+
"        <label for=timezone>{{'cui-timezone' | translate}}</label>\n"+
"        <select class=\"cui-input cui-select\" ng-model=userProfile.tempUser.timezone ng-options=\"timezone.id as timezone.name for timezone in base.timezones\"></select>\n"+
"        \n"+
"        <label for=language>{{'cui-language' | translate}}</label>\n"+
"        <select class=\"cui-input cui-select\" ng-model=userProfile.tempUser.language ng-options=\"languageCode as languageName for (languageCode,languageName) in base.languages\"></select>\n"+
"        \n"+
"        <div class=cui-users__address-submit>\n"+
"          <a class=\"cui-link cui-form__cancel\" href=\"\" ng-click=toggleOff()>{{'cui-cancel' | translate}}</a>\n"+
"          <button class=cui-button ng-click=\"userProfile.updatePerson('timezoneLanguage',toggleOff);\">\n"+
"            <span ng-if=\"!userProfile.timezoneLanguage || !userProfile.timezoneLanguage.submitting\">{{'cui-update' | translate}}</span>\n"+
"            <div class=cui-loading--medium-ctr ng-if=userProfile.timezoneLanguage.submitting></div>\n"+
"            <span ng-if=userProfile.timezoneLanguage.error>{{'cui-error-try-again'| translate}}</span>\n"+
"          </button>\n"+
"        </div>\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</ng-form>");



$templateCache.put('assets/modules/user/profile/user-profile.html',
"<div class=code-info>Code for this page can be found <a class=cui-link href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/app/profile/user target=blank>here</a> and the layout styles <a href=https://github.com/thirdwavellc/cui-idm-b2x/tree/master/assets/scss/3-views/users.scss class=cui-link target=blank>here</a></div>\n"+
"\n"+
"<ng-form name=edit novalidate>\n"+
"  <div class=cui-users__edit>\n"+
"\n"+
"    \n"+
"    <div class=cui-action>\n"+
"      <div class=cui-action__title>\n"+
"        {{'cui-my-profile' | translate}}\n"+
"      </div>\n"+
"    </div>\n"+
"\n"+
"    <div class=cui-users__main-container>\n"+
"\n"+
"      \n"+
"      <div class=cui-loading__container ng-if=userProfile.loading>\n"+
"        <div class=cui-loading--center><div class=cui-loading></div></div>\n"+
"      </div>\n"+
"\n"+
"      <div ng-include=\"'assets/modules/user/profile/sections/header.html'\"></div>\n"+
"\n"+
"      <div class=cui-users__profile>\n"+
"        <div class=cui-users__profile-info>\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/modules/user/profile/sections/basic-info.html'\"></div>\n"+
"          </div>\n"+
"\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/modules/user/profile/sections/password.html'\"></div>\n"+
"          </div>\n"+
"\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/modules/user/profile/sections/challenge-questions.html'\"></div>\n"+
"          </div>\n"+
"\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/modules/user/profile/sections/timezone-language.html'\"></div>\n"+
"          </div>\n"+
"        </div>\n"+
"\n"+
"        <div class=cui-users__profile-info>\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/modules/user/profile/sections/address.html'\"></div>\n"+
"          </div>\n"+
"\n"+
"          <div class=cui-users__info-block>\n"+
"            \n"+
"            <div ng-include=\"'assets/modules/user/profile/sections/phone-fax.html'\"></div>\n"+
"          </div>\n"+
"        </div>\n"+
"\n"+
"      </div>\n"+
"    </div>\n"+
"  </div>\n"+
"</ng-form>");



$templateCache.put('assets/modules/user/user.html',
"<div ui-view></div>");}]);





angular.bootstrap(document,['app']);});});})(




angular,$);
//# sourceMappingURL=app.js.map
