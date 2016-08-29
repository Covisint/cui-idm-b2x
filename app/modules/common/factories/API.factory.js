angular.module('common')
    .factory('API',['$state','User','$rootScope','$window','$location','CustomAPI','$q','localStorageService','Loader','$timeout','Base','LocaleService',
      ($state,User,$rootScope,$window,$location,CustomAPI,$q,localStorage,Loader,$timeout,Base,LocaleService) => {

      let authInfo = {}
      let myCUI = {}

      Base.authInfo = authInfo

const populateUserInfo = (info, redirectOpts) => {
  const deferred = $q.defer()
  let userInfo, roleList
  authInfo = info
  User.set(info)

  $q.all([
        myCUI.getPersonRoles({ personId: authInfo.cuid }),
        myCUI.getPerson({ personId: authInfo.cuid })
      ])
      .then(res => {
    roleList = res[0].map(x => x.name)
  User.setEntitlements(roleList)
  userInfo = res[1]
  return myCUI.getOrganization({ organizationId: res[1].organization.id })
})
.then(res => {
    userInfo.organization = res
  User.set(userInfo)
  deferred.resolve({ roleList, redirect: redirectOpts })
})

  return deferred.promise
}

const jwtAuthHandler = () => {
  return myCUI.covAuth({
    originUri: appConfig.originUri,
    authRedirect: window.location.href.split('#')[0] + '#/auth',
    appRedirect: $location.path()
  })
}

const initApi = () => {
  let deferred = $q.defer()
  Loader.onFor('wholeApp','custom-api-loading')
  cui.api({
        retryUnseured: true,
        envDefs: ['https://cuijs.run.covisintrnd.com/defs/env.json'],
        dataCallDefs: [
          'https://cuijs.run.covisintrnd.com/defs/auth.json',
          'app/json/idm-call-defs.json',
          CustomAPI
        ]
      })
      .then((cuiObject) => {
    Base.logout = cuiObject.covLogout
  angular.copy(cuiObject, myCUI)
  myCUI.setAuthHandler(jwtAuthHandler)
  // overwrite the service url to get the solution instance id
  appConfig.solutionInstancesUrl && myCUI.setServiceUrl(appConfig.solutionInstancesUrl)
  return myCUI.covAuthInfo({originUri: appConfig.originUri})
})
.then(()=>{
    // reset the service url
    appConfig.debugServiceUrl
      ? myCUI.setServiceUrl(appConfig.debugServiceUrl)
      : myCUI.setServiceUrl(appConfig.serviceUrl)
  $timeout(()=> Loader.offFor('wholeApp'),50)
  deferred.resolve()
})
  return deferred.promise
}

let apiFactory = {
      cui: myCUI,
      getUser: User.get,
      setUser: User.set,
      setPersonData: User.setPersonData,
      getPersonData: User.getPersonData,
      user: User.user,
      initApi,
      authenticateUser: (redirectOpts) => {
      const deferred = $q.defer()
      const sessionInfo = myCUI.getCovAuthInfo()
      if(redirectOpts.toState.name!=='auth') {
  localStorage.set('appRedirect',redirectOpts) // set the redirect to whatever the last state before auth was
  Loader.onFor('wholeApp','redirecting-to-sso') // don't need to turn this loader off since covAuth takes us to another page
  appConfig.solutionInstancesUrl && myCUI.setServiceUrl(appConfig.solutionInstancesUrl)
  jwtAuthHandler() // force redirect to SSO
}
else {
  Loader.onFor('wholeApp','getting-user-info')
  myCUI.handleCovAuthResponse({ selfRedirect: true })
      .then((res)=>{
    populateUserInfo(res,localStorage.get('appRedirect'))
.then((res) => {
    deferred.resolve(res)
  $timeout(()=> Loader.offFor('wholeApp'),50)
})
})
}
return deferred.promise
},
setAuthInfo: function(newAuthInfo) {
  angular.copy(newAuthInfo[0], authInfo)
},
authInfo: authInfo
}

return apiFactory

}])
