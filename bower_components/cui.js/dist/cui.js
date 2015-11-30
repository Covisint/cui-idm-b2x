(function() {
'use strict';


cui.VERSION = '0.3.3';


// --------------------------------------------

cui.supportsLocalStorage = function() {
  var mod = 'testlocal';
  try {
      localStorage.setItem(mod, mod);
      localStorage.removeItem(mod);
      return true;
  } catch(e) {
      return false;
  }
};

cui.supportsBeforeunload = function () {
  if (cui.supportsLocalStorage() &&
  localStorage.getItem(keyBeforeUnload) === 'yes' ) {
      return true;
  } else {
      return false;
  }
};

// --------------------------------
// Establish cui.log (and cui.time, and etc.)
//		-allows cross-browser-safe logging
//		-can be toggled on/off from local storage
// -------------------
// 1.Stub out undefined console methods so they do not throw exceptions.
var noop = function() {};
var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeStamp', 'trace', 'warn'
];
var length = methods.length;
var console = (window.console = window.console || {});
var method;
while (length--) {
  method = methods[length];
  if (!console[method]) {
      console[method] = noop;
  }
}

// 2a. Safely bind 'cui.log()' to console.log...
if (Function.prototype.bind) {
  cui.log = Function.prototype.bind.call(console.log, console);
} 
else {
  cui.log = function() {
      Function.prototype.apply.call(console.log, console, arguments);
  };
}
var logger = cui.log;

// Optional. intercept calls to window.log and route according to our setup...
// 2b. IF DEV, bind shortcut window.log to our enabled log.
// window.log = cui.log;
// 2c. IF PRD, bind shortcut window.log to noop.
// window.log = noop;

cui.enableLog = function() {
  cui.log = logger;
};
cui.disableLog = function() {
  cui.log = noop;
};

// By defult... turn log off!
cui.disableLog();

// NB Can turn on logging by adding 'key:cui.log, value:true' to local storage cache
// Can also turn it on within a page via console > cui.enableLog()
if (cui.supportsLocalStorage()) {
  var logEnabled = localStorage.getItem('cui.log'); 
  if (logEnabled) {
      cui.enableLog();
  }
}
// --------------------------------------------


// --------------------------------------------
// cui ajax helper methods
// --------------------------------------------
var keyBeforeUnload = 'supportsBeforeunload';
if (cui.supportsLocalStorage() &&
! localStorage.getItem(keyBeforeUnload)) {
  $(window).on('beforeunload', function() {
    localStorage.setItem(keyBeforeUnload, 'yes');
  });
  $(window).on('unload', function() {
    // If unload fires, and beforeunload hasn't set the keyBeforeUnload,
    // then beforeunload didn't fire and is therefore not supported (iPad).
    if (! localStorage.getItem(keyBeforeUnload)) {
        localStorage.setItem(keyBeforeUnload, 'no');
    }
  });
}

var beforeunloadCalled = false;
$(window).on('beforeunload', function() {
  beforeunloadCalled = true;
});


cui.parseError = function(response) {
  var msg = response.statusText;
  if (! msg.length) {
    msg = $.parseJSON(response.responseText);
  }
  return msg;
};

/*
// --------------------------------------------
// old ajax wrapper
// --------------------------------------------
cui.ajaxOld = function(options) {
  // NB... the possible config params into this method...
  var async = (options.async === false) ? false : true;
  var success = options.success || null;
  var restURL = options.restURL || null;
  var headers = options.headers || null;
  var onAlways = options.onAlways || null;
  var onFailure = options.onFailure || null;
  var onSuccess = options.onSuccess || null;
  var onSuccessData = options.onSuccessData || null;
  var acceptsStr = options.acceptsStr || '';
  var contentType = options.contentType || '';
  var dataType = options.dataType || 'json';
  var requestType = options.requestType || 'GET';
  var requestData = options.requestData || null;
  var onBegLoading = options.onBegLoading || null;
  var onEndLoading = options.onEndLoading || null;
  var dataFilter = options.dataFilter || null;
  var converters = options.converters || {};

  
  if (typeof restURL !== 'undefined') {
      if (typeof onBegLoading === 'function') {
          onBegLoading();
      }

      cui.log('cui.ajax sending', async, restURL);

      // NB need the .then() to filter the 'fail' cases because 
      // jQuery, as of 1.9.1, returns fail when no response is received,
      //  (http://bugs.jquery.com/ticket/13459)
      // which is the case in many of our services that accept POST but return nothing.
      // So we detect that situation and transform it from a 'fail' into a 'done'.
      
      // NB success can be specified and adheres to jQuery std for callbacks...
      //  if undefined then...
      // onSuccess (via the .done) is our CUSTOM callback scheme that exists
      // so we can pass context data onto the callback!

      $.ajax({
          async: async,
          url: restURL,
          type: requestType,
          beforeSend: headers,
          xhrFields: {
              withCredentials: true
          },
          accepts: {
              text: acceptsStr,
              json: acceptsStr
          },
          data: requestData,
          contentType: contentType,
          dataType: dataType,
          dataFilter: dataFilter,
          converters: converters,
          success: success
      }).then(null, 
          function(jqXHR, textStatus, errorThrown) {
              cui.log('ajax.then(fail): status='+textStatus + ' : err='+errorThrown + ' : xhr='+jqXHR.responseText + '.');
              if (jqXHR.responseText === '') {
                  cui.log('ajax.then(fail):resolve()');
                  var response = [];
                  return $.Deferred().resolve(response, textStatus, jqXHR);
              }
              else {
                  cui.log('ajax.then(fail):reject()');
                  return $.Deferred().reject(jqXHR, textStatus, errorThrown);                    
              }
          }
      ).done(function(response, textStatus, jqXHR) {
          //cui.log('ajax.done:'+textStatus,response,jqXHR);
          cui.log('ajax.done:'+textStatus);
          if (typeof onSuccess === 'function') {
              onSuccess(restURL, response, onSuccessData);
          }
      }).fail(function(jqXHR, textStatus, errorThrown) {
          function handleError() {
              cui.log('ajax.fail: status='+textStatus + ' : err='+errorThrown + ' : xhr='+jqXHR.responseText);
              if (typeof onFailure === 'function') {
                  onFailure(restURL, onSuccessData, errorThrown, jqXHR);
              }
          }

          // NB. Need to differentiate from errors caused by 
          // user navigating away from page,
          // versus a legit server-related error...
          // This solution based on: http://stackoverflow.com/a/18170879
          if (cui.supportsBeforeunload()) {
              if (! beforeunloadCalled) {
                  // This is a legit server-related error, so handle normally.
                  handleError();
              }
              // else ignore.
          } 
          else {
              setTimeout(function () {
                  // This could be a legit server-related error, so handle normally...
                  // after 1 second delay,
                  // which will never fire if in fact page is unloading.
                  handleError();
              }, 1000);
          }
      }).always(function(response, textStatus, errorThrown) {
          //cui.log('ajax.always: status='+textStatus + ' : err='+errorThrown + ' : response='+response);
          //cui.log('ajax.always: status='+textStatus + ' : err='+errorThrown);
          if (typeof onAlways === 'function') {
              onAlways(restURL, response, onSuccessData);
          }
          if (typeof onEndLoading === 'function') {
              onEndLoading();
          }
      });
  }
  return;
};
*/

cui.ajax = function(options) {
  // TODO... add in CONTEXT again, so callbacks still work?

  // Mixin the options which were passed-in with defaults...
  var url = options.url || '';
  var async = (options.async === false) ? false: true;
  var type = options.type || 'GET';
  var beforeSend = options.beforeSend || null;
  var accepts = options.accepts || '';
  var contentType = options.contentType || '';
  var dataType = options.dataType || 'json';
  var data = options.data || null;
  var dataFilter = options.dataFilter || null;
  var converters = options.converters || {};
  var complete = options.complete || null;
  var error = options.error || null;
  var success = options.success || null;


  if (url.length) {
    cui.log('cui.ajax sending', url, options);

    return $.ajax({
      url: url,
      type: type,
      async: async,
      beforeSend: beforeSend,
      /* !!! TODO this needs to be optional...
       * ?was needed for idm-web calls?
      xhrFields: {
        withCredentials: true
      },
      */
      accepts: {
        text: accepts,
        json: accepts
      },
      data: data,
      contentType: contentType,
      dataType: dataType,
      dataFilter: dataFilter,
      converters: converters,
      error: error,
      complete: complete,
      success: success
    }).then(null,
      // NB need the .then() to filter the 'fail' cases because 
      // jQuery, as of 1.9.1, returns fail when no response is received,
      //  (http://bugs.jquery.com/ticket/13459)
      // which is the case in many of our services that accept POST but return nothing.
      // So we detect that situation and transform it from a 'fail' into a 'done'.

      function(jqXHR, textStatus, errorThrown) {
        cui.log('ajax.then(fail): status=' + textStatus + ' : err=' + errorThrown + ' : xhr=' + jqXHR.responseText + '.');
        if (jqXHR.responseText === '') {
          cui.log('ajax.then(fail):resolve()');
          var response = [];
          return $.Deferred().resolve(response, textStatus, jqXHR);
        } else {
          cui.log('ajax.then(fail):reject()');
          return $.Deferred().reject(jqXHR, textStatus, errorThrown);
        }
      }
    ).done(function(response, textStatus, jqXHR) {
      cui.log('ajax.done:' + textStatus);
      //if (typeof onSuccess === 'function') {
      //  onSuccess(url, response, onSuccessData);
      //}
    }).fail(function(jqXHR, textStatus, errorThrown) {
      function handleError() {
        cui.log('ajax.fail: status=' + textStatus + ' : err=' + errorThrown + ' : xhr=' + jqXHR.responseText);
        //if (typeof onFailure === 'function') {
        //  onFailure(url, onSuccessData, errorThrown, jqXHR);
        //}
      }

      // NB. Need to differentiate from errors caused by 
      // user navigating away from page,
      // versus a legit server-related error...
      // This solution based on: http://stackoverflow.com/a/18170879
      if (cui.supportsBeforeunload()) {
        if (!beforeunloadCalled) {
          // This is a legit server-related error, so handle normally.
          handleError();
        }
        // else ignore.
      } else {
        setTimeout(function() {
          // This could be a legit server-related error, so handle normally...
          // after 1 second delay,
          // which will never fire if in fact page is unloading.
          handleError();
        }, 1000);
      }
    }).always(function(response, textStatus, errorThrown) {
      //cui.log('ajax.always: status='+textStatus + ' : err='+errorThrown);
      //if (typeof onAlways === 'function') {
      //  onAlways(url, response, onSuccessData);
      //}
    });
  }
};
// --------------------------------------------



// --------------------------------
// General utilities
// --------------------------------
cui.util = {};

cui.util.hello = function() {
  cui.log('hello util');
};

cui.util.toTitleCase = function(str) {
  return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

cui.util.qs = (function(a) {
	// parse QS for a specified parameter's value
  // called like so:  
  //    var myVar = qs["myParam"];
  
  if (a === '') {
    return {};
  }

  var b = {};
  for (var i = 0; i < a.length; ++i) {
    var p = a[i].split('=');
    if (p.length !== 2) {
        continue;
    }
    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
  }
  return b;
})(window.location.search.substr(1).split('&'));

// --------------------------------







// --------------------------------------------
cui.api = function() {

  // -------------------------------------
  // Private vars
  // -------------------------------------

  var DEF_AUTH_STATE = 'cuijs';

  var IDENTITY_SERVER_TOKEN = 'IURL';
  var SERVER_TOKEN = 'SURL';
  var USERID_TOKEN = 'UID';
  var COMPANYID_TOKEN = 'CID';
  var ORGANIZATIONID_TOKEN = 'OID';
  var PACKAGEID_TOKEN = 'PID';
  var DEVICETEMPLID_TOKEN = 'DTID';
  var ROLEID_TOKEN = 'RID';
  var REQUESTID_TOKEN = 'RQID';
  var CLIENTID_TOKEN = 'CLIT';
  var RESPONSETYPE_TOKEN = 'RTT';
  var SCOPE_TOKEN = 'SCT';
  var STATE_TOKEN = 'STT';
  var ACCEPTS_TOKEN = 'AT';

  var ACCEPTS_TEMPLATE = 'application/vnd.com.covisint.platform.' + ACCEPTS_TOKEN + '+json';

  var ACCEPTS_TOKEN_REGEX = new RegExp(ACCEPTS_TOKEN,'g');
  var IDENTITY_SERVER_TOKEN_REGEX = new RegExp(IDENTITY_SERVER_TOKEN,'g');
  var SERVER_TOKEN_REGEX = new RegExp(SERVER_TOKEN,'g');
  var USERID_TOKEN_REGEX = new RegExp(USERID_TOKEN,'g');
  var ORGANIZATIONID_TOKEN_REGEX = new RegExp(ORGANIZATIONID_TOKEN,'g');
  var DEVICETEMPLID_TOKEN_REGEX = new RegExp(DEVICETEMPLID_TOKEN,'g');
  var COMPANYID_TOKEN_REGEX = new RegExp(COMPANYID_TOKEN,'g');
  var PACKAGEID_TOKEN_REGEX = new RegExp(PACKAGEID_TOKEN,'g');
  var ROLEID_TOKEN_REGEX = new RegExp(ROLEID_TOKEN,'g');
  var REQUESTID_TOKEN_REGEX = new RegExp(REQUESTID_TOKEN,'g');
  var CLIENTID_TOKEN_REGEX = new RegExp(CLIENTID_TOKEN,'g');
  var RESPONSETYPE_TOKEN_REGEX = new RegExp(RESPONSETYPE_TOKEN,'g');
  var SCOPE_TOKEN_REGEX = new RegExp(SCOPE_TOKEN,'g');
  var STATE_TOKEN_REGEX = new RegExp(STATE_TOKEN,'g');

  var idmIdentityUrl = '';
  var idmServiceUrl = '';
  var userId = '';
  var companyId = '';
  var packageId = '';
  var roleId = '';
  var requestId = '';
  var organizationId = '';
  var deviceTemplateId = '';

  var clientId = '';
  var responseType = '';
  var scope = '';
  var state = ''; 

  var sysToken = '';
  // -------------------------------------

  // -------------------------------------
  // Private methods
  // -------------------------------------
  function getToken() {
    var token = window.localStorage.getItem('accessToken');
    
    // NB justify please. what scenario requires this?
    if (! token) {
      token = getSysToken();
    }
    return token;
  }
  function getSysToken() {
    return sysToken;
  }

  // ----------------------------

  function getDataCall(cmd) {
    var dataCall = _.find(dataCalls, function (dc) {
      return dc.cmd === cmd;
    });
    return dataCall;
  }

  function prepareCall(cmd, opts) {
    var preparedCall = '';
    var dataCall = getDataCall(cmd);
    if (dataCall) {          
      preparedCall = _.cloneDeep(dataCall);

      preparedCall.accepts = ACCEPTS_TEMPLATE.replace(ACCEPTS_TOKEN_REGEX, preparedCall.accepts);
      if (preparedCall.acceptsSuffix) {
        preparedCall.accepts = preparedCall.accepts + preparedCall.acceptsSuffix;
      }

      // replace tokens with curr state of factory
      preparedCall.call = preparedCall.call.replace(IDENTITY_SERVER_TOKEN_REGEX, idmIdentityUrl);
      preparedCall.call = preparedCall.call.replace(SERVER_TOKEN_REGEX, idmServiceUrl);
      preparedCall.call = preparedCall.call.replace(COMPANYID_TOKEN_REGEX, companyId);
      preparedCall.call = preparedCall.call.replace(ORGANIZATIONID_TOKEN_REGEX, organizationId);
      preparedCall.call = preparedCall.call.replace(PACKAGEID_TOKEN_REGEX, packageId);
      preparedCall.call = preparedCall.call.replace(ROLEID_TOKEN_REGEX, roleId);
      preparedCall.call = preparedCall.call.replace(USERID_TOKEN_REGEX, userId);
      preparedCall.call = preparedCall.call.replace(REQUESTID_TOKEN_REGEX, requestId);
      preparedCall.call = preparedCall.call.replace(DEVICETEMPLID_TOKEN_REGEX, deviceTemplateId);

      preparedCall.call = preparedCall.call.replace(CLIENTID_TOKEN_REGEX, clientId);
      preparedCall.call = preparedCall.call.replace(RESPONSETYPE_TOKEN_REGEX, responseType);
      preparedCall.call = preparedCall.call.replace(SCOPE_TOKEN_REGEX, scope);
      preparedCall.call = preparedCall.call.replace(STATE_TOKEN_REGEX, state);
    }

    if (opts && opts.params) {
      // attach whatever additional params come in...
      _.each(opts.params, function(p) {
        // NB need smarter way to know if this is first param or not!
        var pChar;
        if (preparedCall.call.indexOf('?') === -1) {
          pChar = '?';
        }
        else {
          pChar = '&';
        }
        var paramStr = pChar + p.name + '=' + p.value;
        preparedCall.call = preparedCall.call + paramStr;
      });
    }

    //cui.log('pc', preparedCall);
    return preparedCall;
  }
	// -------------
      


  // ------------------------------------------------------
  // Gets
  // ------------------------------------------------------

  // TODO normalize... just push these settings further down into flow?
  function revokeAuthToken(url, options) {
    var token = decodeURIComponent(getToken());
    var opts = options;

    // preset certain options
    opts.url = url;
    opts.beforeSend = function(xhr, settings) { 
      xhr.setRequestHeader('Authorization','Bearer ' + token); 
    };
    // ?TODO get these via prepareCall?
    opts.contentType = 'application/x-www-form-urlencoded';
    opts.type = 'POST';
    opts.data = { 'token': token, 'token_type_hint': '', 'cascade': 'true' };

    return cui.ajax(opts);
  }
  function getAuthTokenFromService(url, options) {
    var opts = options;

    var encodedAuth = btoa(opts.clientId + ':' + opts.clientSecret);

    // preset certain options
    opts.url = url;
    opts.beforeSend = function(xhr, settings) { 
      xhr.setRequestHeader('Authorization','Basic ' + encodedAuth); 
    };
    // ?TODO get these via prepareCall?
    opts.contentType = 'application/x-www-form-urlencoded';
    opts.type = 'POST';
    opts.data = { 'grant_type': 'client_credentials', 'scope': 'all' };

    return cui.ajax(opts);
  }
  function getDataFromService(url, options) {
    var token = decodeURIComponent(getToken());
    var opts = options;

    // preset certain options
    opts.url = url;
    //opts.accepts = options.accepts;
    opts.beforeSend = function(xhr, settings) { 
      xhr.setRequestHeader('Authorization','Bearer ' + token); 
    };

    return cui.ajax(opts);
  }

  function openPopup(url, options) {
    var w = 400 || options.popUpWidth;
    var h = 650 || options.popUpHeight;
    var top = 200 || options.popUpTop;
    var left = 200 || options.popUpLeft;

    //var winName = '_blank' || options.popupWinName;
    var winName = 'Auth' || options.popupName;
    var staticFeatures = 'toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no, ' || options.popUpFeatures;
    var dynamicFeatures = 'width='+w+', height='+h+', top='+top+', left='+left;
    var winFeatures = staticFeatures + dynamicFeatures;

    return window.open(url, winName, winFeatures);
  }

  function parseTokenFromResponse() {
    // This is a bit presumptuous...
    var token ='';
    if (window.location.hash.indexOf('access_token') !== -1) {
      token = window.location.hash.match(/access_token=(.*)$/)[1].split('&state')[0];
    }
    else {
      if (window.location.hash.indexOf('access_denied') !== -1) {
        token = 'deny';
      }
    }
    return token;
  }


  function doCall(cmd, options) {
    //cui.log('doCall', cmd);

    // make it not fail...
    if (! options) {
      options = {};
    }

    setParams(options);
    
    var rc;

    var dc = prepareCall(cmd);
    if (dc) {
      if (dc.cmdType === 'popup') {
        rc = openPopup(dc.call, options);
      }
      else if (dc.cmdType === 'auth') {
        rc = getAuthTokenFromService(dc.call, options);
      }
      else if (dc.cmdType === 'revoke') {
        rc = revokeAuthToken(dc.call, options);
      }
      else {
        // default...
        // returns a promise
        options.accepts = dc.accepts;
        if (options.data) {
          // ...then set content type...
          options.contentType = dc.accepts;
        }
        rc = getDataFromService(dc.call, options);
      }
    }
    // else 'no such cmd' error!

    clearParams(options);

    return rc;
  }


  function setParams(options) {
    // brute-force...
    // set only what is specified...
    if (options) {
      if (options.idmIdentityUrl) {
        idmIdentityUrl = options.idmIdentityUrl;
      }
      if (options.idmServiceUrl) {
        idmServiceUrl = options.idmServiceUrl;
      }
      if (options.userId) {
        userId = options.userId;
      }
      if (options.companyId) {
        companyId = options.companyId;
      }
      if (options.organizationId) {
        organizationId = options.organizationId;
      }
      if (options.packageId) {
        packageId = options.packageId;
      }
      if (options.roleId) {
        roleId = options.roleId;
      }
      if (options.requestId) {
        requestId = options.requestId;
      }
      if (options.deviceTemplateId) {
        deviceTemplateId = options.deviceTemplateId;
      }

      if (options.clientId) {
        clientId = options.clientId;
      }
      if (options.responseType) {
        responseType = options.responseType;
      }
      if (options.scope) {
        scope = options.scope;
      }
      if (options.state) {
        state = options.state;
      }

    }
  }
  function clearParams(options) {
    // brute-force...
    // clear only what was just set...
    if (options) {
      if (options.idmIdentityUrl) {
        idmIdentityUrl = '';
      }
      if (options.idmServiceUrl) {
        idmServiceUrl = '';
      }
      if (options.userId) {
        userId = '';
      }
      if (options.companyId) {
        companyId = '';
      }
      if (options.organizationId) {
        organizationId = '';
      }
      if (options.packageId) {
        packageId = '';
      }
      if (options.roleId) {
        roleId = '';
      }
      if (options.requestId) {
        requestId = '';
      }
      if (options.deviceTemplateId) {
        deviceTemplateId = '';
      }

      if (options.clientId) {
        clientId = '';
      }
      if (options.responseType) {
        responseType = '';
      }
      if (options.scope) {
        scope = '';
      }
      if (options.state) {
        state = '';
      }
    }
  }
  // ------------------------------------------------------


  // -------------------------------------
  // Calls 
  // -------------------------------------
  var dataCalls = [];
  
  // -------------
  // Auth calls...
  // -------------
  dataCalls.push({cmd:'IDM_LOGOUT', name:'Idm Logout', cmdType:'popup', call: IDENTITY_SERVER_TOKEN+'/'+'logout.do'});
  dataCalls.push({cmd:'GET_AUTH', name:'Get Authorization', cmdType:'popup', call: SERVER_TOKEN+'/'+'oauth/v3/authorization?client_id='+CLIENTID_TOKEN+'&response_type='+RESPONSETYPE_TOKEN+'&scope='+SCOPE_TOKEN+'&state='+STATE_TOKEN});
  dataCalls.push({cmd:'POST_AUTH', name:'Get Sys-level Authorization', cmdType:'auth', call: SERVER_TOKEN+'/'+'oauth/v3/token'});
  dataCalls.push({cmd:'POST_AUTH_REVOKE', name:'Revoke Authorization', cmdType:'revoke', call: SERVER_TOKEN+'/'+'oauth/v3/revoke'});
  // -------------

  // -------------
  // IdM Data calls...
  // -------------
  dataCalls.push({cmd:'GET_ORGS', name:'Get Organizations', accepts: 'organization.v1', call: SERVER_TOKEN+'/'+'organization/v1/organizations'});
  dataCalls.push({cmd:'GET_ORG', name:'Get Organization', accepts: 'organization.v1', call: SERVER_TOKEN+'/'+'organization/v1/organizations/'+ORGANIZATIONID_TOKEN});
  // ---
  dataCalls.push({cmd:'GET_USERS', name:'Get Users', accepts: 'person.v1', call: SERVER_TOKEN+'/'+'person/v1/persons'});
  // ---
  dataCalls.push({cmd:'GET_SPS', name:'Get Packages', accepts: 'package.v1', call: SERVER_TOKEN+'/'+'service/v1/packages'});
  dataCalls.push({cmd:'GET_SP_SPS', name:'Get Package Services', accepts: 'service.v1', call: SERVER_TOKEN+'/'+'service/v1/packages/'+PACKAGEID_TOKEN+'/services'});
  dataCalls.push({cmd:'POST_SP', name:'Create Service', accepts: 'service.v1', call: SERVER_TOKEN+'/'+'service/v1/services'});
  dataCalls.push({cmd:'POST_SP_SP', name:'Assign Service to Package', accepts: 'service.v1', call: SERVER_TOKEN+'/'+'service/v1/packages/tasks/assignServiceMembership'});
  // ---
  dataCalls.push({cmd:'GET_USER_SPS', name:'Get User Packages', accepts: 'package.grant.v1', call: SERVER_TOKEN+'/'+'service/v1/persons/'+USERID_TOKEN+'/packages'});
  dataCalls.push({cmd:'PUT_SP_USER', name:'Grant Package to User', accepts: 'package.grant.v1', call: SERVER_TOKEN+'/'+'service/v1/persons/'+USERID_TOKEN+'/packages/'+PACKAGEID_TOKEN});
  // ---
  dataCalls.push({cmd:'GET_ORG_SP', name:'Get Organization Packages', accepts: 'package.grant.v1', call: SERVER_TOKEN+'/'+'service/v1/organizations/'+ORGANIZATIONID_TOKEN+'/packages/'+PACKAGEID_TOKEN});
  // -------------

  // -------------
  // IoT Data calls...
  // -------------
  dataCalls.push({cmd:'GET_APPS', name:'Get Applications', accepts: 'application.v1', call: SERVER_TOKEN+'/'+'application/v1/applications'});
  dataCalls.push({cmd:'GET_DEVICES', name:'Get Devices', accepts: 'device.v1', acceptsSuffix: ';fetchattributetypes=true;fetcheventtemplates=true;fetchcommandtemplates=true', call: SERVER_TOKEN+'/'+'device/v2/devices'});
  dataCalls.push({cmd:'POST_DEVICE_FROM_TEMPL', name:'Create Device from Template', accepts: 'device.v1', call: SERVER_TOKEN+'/'+'device/v2/tasks/createDeviceFromTemplate?deviceTemplateId=' + DEVICETEMPLID_TOKEN});
  // nb the deviation from the published spec... non-camel-case in first part of call...
  dataCalls.push({cmd:'GET_DEVICE_TEMPL', name:'Get Device Templates', accepts: 'deviceTemplate.v1', acceptsSuffix: ';fetchattributetypes=true;fetcheventtemplates=true;fetchcommandtemplates=true', call: SERVER_TOKEN+'/'+'devicetemplate/v1/deviceTemplates'});
  //dataCalls.push({cmd:'GET_DEVICE_TEMPL', name:'Get Device Templates', accepts: 'deviceTemplate.v1', call: SERVER_TOKEN+'/'+'devicetemplate/v1/deviceTemplates'});
  dataCalls.push({cmd:'POST_DEVICE_TEMPL', name:'Get Device Templates', accepts: 'deviceTemplate.v1', call: SERVER_TOKEN+'/'+'devicetemplate/v1/deviceTemplates'});
  dataCalls.push({cmd:'GET_EVENT_SRC', name:'Get Event Sources', accepts: 'eventSource.v1', call: SERVER_TOKEN+'/'+'eventsource/v1/eventSources'});
  dataCalls.push({cmd:'GET_EVENT_TEMPL', name:'Get Event Templates', accepts: 'eventTemplate.v1', call: SERVER_TOKEN+'/'+'eventtemplate/v1/eventTemplates'});
  dataCalls.push({cmd:'GET_ATTR_TYPE', name:'Get Attribute Types', accepts: 'attributeType.v1', call: SERVER_TOKEN+'/'+'attributetype/v1/attributeTypes'});
  dataCalls.push({cmd:'GET_CMD_TEMPL', name:'Get Command Template', accepts: 'commandTemplate.v1', call: SERVER_TOKEN+'/'+'commandtemplate/v1/commandTemplates'});

  // -------------------------------------


  // -------------------------------------
  // Public methods
  // -------------------------------------
  return {
    // -------------------------
    // Helpers
    // -------------------------
    getDataCalls: function() {
      return dataCalls;
    },

    doCall: function() {
      return doCall.apply(null, arguments);
    },
    // -------------------------


    // -------------------------
    // Config
    // -------------------------
  	/*
    getIdmServiceUrl: function() {
  		return idmServiceUrl;
  	},
    setIdmServiceUrl: function(val) {
      idmServiceUrl = val;
    },
    getClientId: function() {
      return clientId;
    },
    setClientId: function(val) {
      clientId = val;
    },
    */

    setService: function(val) {
      if (val === 'STG') {
        idmServiceUrl = 'https://apistg.np.covapp.io';
      }
      else if (val === 'PREPRD') {
        // TODO, confirm?
        //idmServiceUrl = 'https://apipreprd.np.covapp.io';
      }
      else if (val === 'PRD') {
        idmServiceUrl = 'https://api.us1.covisint.com';
      }
    },
    // -------------------------


    // -------------------------
    // Data
    // -------------------------
    getOrganization: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_ORG', options);
    },
    getOrganizations: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_ORGS', options);
    },
    
    getUsers: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_USERS', options);
    },

    getPackages: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_SPS', options);
    },
    getPackageServices: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_SP_SPS', options);
    },
    createService: function(options) {
      if (! options) {
        options = {};
      }
      options.type = 'POST';
      return doCall('POST_SP', options);
    },
    assignService: function(options) {
      if (! options) {
        options = {};
      }
      options.type = 'POST';
      return doCall('POST_SP_SP', options);
    },

    grantPackageOrg: function(options) {
      if (! options) {
        options = {};
      }
      options.type = 'PUT';
      return doCall('GET_ORG_SP', options);
    },
    getOrganizationPackages: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_ORG_SP', options);
    },
    
    grantPackage: function(options) {
      if (! options) {
        options = {};
      }
      options.type = 'PUT';
      return doCall('PUT_SP_USER', options);
    },
    getUserPackages: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_USER_SPS', options);
    },


    // -------------------------
    // IOT
    // -------------------------
    getApplications: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_APPS', options);
    },
    createApplication: function(options) {
      if (! options) {
        options = {};
      }
      options.type = 'POST';
      return doCall('GET_APPS', options);
    },
    getDevices: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_DEVICES', options);
    },
    createDeviceFromTemplate: function(options) {
      if (! options) {
        options = {};
      }
      options.type = 'POST';
      return doCall('POST_DEVICE_FROM_TEMPL', options);
    },
    getDeviceTemplates: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_DEVICE_TEMPL', options);
    },
    createDeviceTemplate: function(options) {
      if (! options) {
        options = {};
      }
      options.type = 'POST';      
      return doCall('POST_DEVICE_TEMPL', options);
    },
    getEventSources: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_EVENT_SRC', options);
    },
    getEventTemplates: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_EVENT_TEMPL', options);
    },
    createEventTemplate: function(options) {
      if (! options) {
        options = {};
      }
      options.type = 'POST';      
      return doCall('GET_EVENT_TEMPL', options);
    },
    getAttributeTypes: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_ATTR_TYPE', options);
    },
    createAttributeType: function(options) {
      if (! options) {
        options = {};
      }
      options.type = 'POST';      
      return doCall('GET_ATTR_TYPE', options);
    },
    getCommandTemplates: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('GET_CMD_TEMPL', options);
    },
    createCommandTemplate: function(options) {
      if (! options) {
        options = {};
      }
      options.type = 'POST';      
      return doCall('GET_CMD_TEMPL', options);
    },

    // -------------------------


    // -------------------------
    // Auth
    // -------------------------

    // TODO 
    /*
    verfiy the state
    manage the refresh. 
    */
    handleAuthResponse: function() {
      var token = parseTokenFromResponse();
      if (token.length) {
        // Purge old
        window.localStorage.removeItem('accessToken');
        
        // Stash new
        window.localStorage.setItem('accessToken', token);
        
        // Dispose of the popUp
        window.close();        
      }
      // else this is NOT the result of an authResponse, ignore...
    },

    getToken: function() {
      return getToken();
    },
    clearToken: function() {
      window.localStorage.removeItem('accessToken');
    },

    doSysAuth: function(options) {
      if (! options) {
        options = {};
      }

      return doCall('POST_AUTH', options)
        .done(function (data) {
          cui.log('POST_AUTH success',data);
          
          // handle response here!  cache the response.token !!
          // TODO verify scope, handle auto-refresh...
          var propName = 'access_token';
          var token = data[propName];
          if (token.length) {
            // Purge old
            window.localStorage.removeItem('accessToken');
            
            // Stash new
            window.localStorage.setItem('accessToken', token);

            // Also... this enables Apps to be clients.
            sysToken = token;
          }
        });
    },
    doRevoke: function(options) {
      if (! options) {
        options = {};
      }
      return doCall('POST_AUTH_REVOKE', options)
        .done(function (data) {
          cui.log('POST_AUTH_REVOKE success',data);
          // Purge
          window.localStorage.removeItem('accessToken');
        });
    },    
    doAuth: function(options) {
      return doCall('GET_AUTH', options);
    },
    doThreeLeggedOAuth: function(options) {
      if (! options) {
        options = {};
      }

      // preset certain options
      options.responseType = 'token';
      options.state = DEF_AUTH_STATE;
      if (! options.scope) {
        options.scope = 'all';          
      }

      // Purge old
      window.localStorage.removeItem('accessToken');

      // Do call... opens popup
      var pendingAuthPromise = $.Deferred();

      var popup = doCall('GET_AUTH', options);

      // Start a loop , when the token arrives...
      function waitFn(promise, popup) {
        cui.log('waiting', promise, popup);

        if (popup.closed !== false) { 
          // 1. the window closed... 
          clearInterval(waitForTokenTimer);

          var token = getToken();
          if (token) {
            if (token === 'deny') {
              promise.reject();
            }
            else {
              // ... resolve the promise
              return promise.resolve(token);
            }
          }
          else {
            // they manually closed window without completing process
            // ...reject promise
            promise.reject();
          }
        }
      }
      var waitForTokenTimer = setInterval(function() { 
        waitFn(pendingAuthPromise, popup); 
      }, 500);
 
      return pendingAuthPromise;
    },
    doIdmLogout: function(options) {
      if (! options) {
        options = {};
      }

      // ? preset certain options

      return doCall('IDM_LOGOUT', options);
    },
    // -------------------------


    // -------------------------
    // tests...
    // -------------------------
    sayHello: function() {
      cui.log('hello api');
    },


    sayDeferred: function(message, callback, context) {
      var defer = $.Deferred();
      
      //var callbackContext = { con: 'con', text: 'text'};
      var callbackContext = context;

      cui.log(message);

      if (message === 'fail') {
        // defer.rejectWith( this, arguments );
        // NB in the above example, 'this' is the entire cui.idm namespace
        // which probably is not a useful thing to return.

        defer.rejectWith( callbackContext, arguments );
        return defer.fail( callback ).promise();
      }
      else {
        //defer.resolveWith( this, arguments );
        defer.resolveWith( callbackContext, arguments );
        return defer.done( callback ).promise();
      }
    },

    // ----------------------------------------
    // Loosely equivalent to cui.ajax()
    // ----------------------------------------
    sayDeferredConfig: function(configParam) {
      var defer = $.Deferred();
      
      var config = {
        message: 'what do you say?',
        callback: null,
        context: null, 
        delay: 0
      };
      // mix-in, v1
      $.extend(true, config, configParam );      

      // mix-in, v2
      /*
      var prop;
      for (prop in configParam) {
        config[prop] = configParam[prop];
      }
      */

      //var config.context = config.context;

      _.delay(function(){
        cui.log(config.message);

        if (config.message === 'fail') {
          // defer.rejectWith( this, arguments );
          // NB in the above example, 'this' is the entire cui.idm namespace
          // which probably is not a useful thing to return.

          //defer.rejectWith( config.context, arguments );
          //return defer.fail( config.callback ).promise();
          if (_.isFunction(config.callback)) {
            config.callback.call(config.context, arguments);
          }
          defer.rejectWith( config.context, arguments );
        }
        else {
          //defer.resolveWith( this, arguments );
          //return defer.done( config.callback ).promise();
          //config.callback.call(config.context, arguments);
          if (_.isFunction(config.callback)) {
            config.callback.call(config.context, arguments);
          }
          defer.resolveWith( config.context, arguments );
        }
      }, config.delay);

      cui.log('sayDeferredConfig');
      return defer.promise();
    },

    duh: function() { }    
    // ----------------------------------------
  };
};
// --------------------------------------------




// --------------------------------------------
cui.web = function() {

  // -------------------------------------
  // Private vars
  // -------------------------------------
  var X1_TOKEN = '[X1]';
  var PRIV_GROUP_TOKEN = '[PG]';

  var SERVER_TOKEN = 'SURL';
  var USERID_TOKEN = 'UID';
  var COMPANYID_TOKEN = 'CID';
  var PACKAGEID_TOKEN = 'PID';
  var ROLEID_TOKEN = 'RID';
  var REQUESTID_TOKEN = 'RQID';

  var SERVER_TOKEN_REGEX = new RegExp(SERVER_TOKEN,'g');
  var USERID_TOKEN_REGEX = new RegExp(USERID_TOKEN,'g');
  var COMPANYID_TOKEN_REGEX = new RegExp(COMPANYID_TOKEN,'g');
  var PACKAGEID_TOKEN_REGEX = new RegExp(PACKAGEID_TOKEN,'g');
  var ROLEID_TOKEN_REGEX = new RegExp(ROLEID_TOKEN,'g');
  var REQUESTID_TOKEN_REGEX = new RegExp(REQUESTID_TOKEN,'g');

  var appServerUrl = '';
  var userId = '';
  var companyId = '';
  var packageId = '';
  var roleId = '';
  var requestId = '';
  // -------------------------------------

  // -------------------------------------
  // Private methods
  // -------------------------------------
  function dataFailure(origURL, data, error, responseObj) {
    cui.log('dataFailure:', error, responseObj);
    //utils.error(error);
    return;
  }

  function getDataCall(cmd) {
    var dataCall = _.find(dataCalls, function (dc) {
      return dc.cmd === cmd;
    });
    return dataCall;
  }

  function prepareCall(cmd) {
    var preparedCall = '';
    var dataCall = getDataCall(cmd);
    if (dataCall) {          
      preparedCall = _.cloneDeep(dataCall);
      // replace tokens with curr state of factory
      preparedCall.call = preparedCall.call.replace(SERVER_TOKEN_REGEX, appServerUrl);
      preparedCall.call = preparedCall.call.replace(COMPANYID_TOKEN_REGEX, companyId);
      preparedCall.call = preparedCall.call.replace(PACKAGEID_TOKEN_REGEX, packageId);
      preparedCall.call = preparedCall.call.replace(ROLEID_TOKEN_REGEX, roleId);
      preparedCall.call = preparedCall.call.replace(USERID_TOKEN_REGEX, userId);
      preparedCall.call = preparedCall.call.replace(REQUESTID_TOKEN_REGEX, requestId);
    }
    return preparedCall;
  }
	// -------------
      
  // ------------------------------------------------------
  // 3rd-level converters; json-to-json smoothing
  // ------------------------------------------------------
  var defaultjson2jsonConverter = function(result) {
    //cui.log('defaultjson2jsonConverter');
    return result;
  };

  var getRoleUserConverter = function(result) {        
    var convertedResult = result[5];        
    $.each(convertedResult, function(i, obj) {
      if (obj['User Name'].length) {
        obj.userId = obj.select;
        obj.select = '';
      }
      else {
        convertedResult.splice(i, 1);            
      }
    });        
    return convertedResult;
  };

  var getUsersConverter = function(result) {        
    var convertedResult = result[4];  
    $.each(convertedResult, function(i, obj) {
      obj.userId = obj['Job Title'];
      obj['Job Title'] = '';
    });        
    return convertedResult;
  };

  var getUsersAuditConverter = function(result) {        
    var convertedResult = result[5];        
    $.each(convertedResult, function(i, obj) {
      if (obj['audit date'].indexOf('[') > -1) {
        var companyId = obj['audit date'].match(/\[(.[\d]*?)\]/)[1];
        obj.companyId = companyId;
        obj['audit date'] = obj['audit date'].replace(/\[(.[\d]*?)\]/, '').trim();
      }
      else {
        convertedResult.splice(i, 1);            
      }

      if (obj['audit date'].indexOf('No previous') > -1) {
        obj['audit date'] = '';
      }          
    });        
    return convertedResult;
  };

  var getRoleConverter = function(result) {
    var newResult = $.parseJSON('[{"info": [], "categories": []}]');
    var category = $.parseJSON('{"name": "", "privs": []}');
    var priv = $.parseJSON('{"name":"", "description":"" }');
    
    // info
    var item = {};
    $.each(result[5], function(i, obj) {
      item[obj.col1] = obj.data1;
    });
    newResult[0].info.push(item);

    // privs
    var c = null;
    $.each(result[6], function(i, obj) {
      if (obj.Description.indexOf(PRIV_GROUP_TOKEN) > -1) {
        c = _.cloneDeep(category);
        c.name = obj.Description.replace(PRIV_GROUP_TOKEN,'');
        newResult[0].categories.push(c);
      }
      else {
        var p = _.cloneDeep(priv);
        p.name = obj['Privilege Name'];
        p.description = obj.Description;
        c.privs.push(p);
      }
    });
    
    return newResult;
  };

  var getRolesConverter = function(result) {  
    var convertedResult = result[4];
    $.each(convertedResult, function(i, obj) {
      obj.roleId = obj['External Role Code'];
    });        
    return convertedResult;
  };

  var getPendingRequestsConverter = function(result) {        
    var convertedResult = result[3];        
    $.each(convertedResult, function(i, obj) {
      obj.requestId = obj['view request'];
      if (obj.requestId.length) {
        obj['view request'] = '';
      }
      else {
        // an empty row, just drop it...
        convertedResult.splice(i, 1);            
      }
    });        
    return convertedResult;
  };

  var getPendingRequestConverter = function(result) {        
    var convertedResult = $.parseJSON('[]');
    var item = {};
    $.each(result[4], function(i, obj) {
      item[obj.col1] = obj.data1;
    });
    convertedResult.push(item);
    return convertedResult;
  };

  var getOrgRequestConverter = function(result) {        
    var convertedResult = result[4];
    $.each(convertedResult, function(i, obj) {
      if (obj) {
        if (obj['request type'].indexOf('no request history') > -1) {
          // an empty row, just drop it...
          convertedResult.splice(i, 1);            
        }            
      }
    });        
    return convertedResult;
  };

  var getOrgServicePkgGrantConverter = function(result) {        
    return result[5];
  };

  var getOrgAdminsConverter = function(result) {   
    var newResult = $.parseJSON('[{"roles": []}]');
    var role = $.parseJSON('{"name": "", "admins": []}');
    
    // role: security administrator
    var r = _.cloneDeep(role);
    r.name = 'Security Administrator';
    newResult[0].roles.push(r);
    $.each(result[4], function(i, obj) {
      var a = obj;
      r.admins.push(a);
    });
    
    r = _.cloneDeep(role);
    r.name = 'Organization Service Administrator';
    newResult[0].roles.push(r);
    $.each(result[5], function(i, obj) {
      var a = obj;
      r.admins.push(a);
    });
    
    r = _.cloneDeep(role);
    r.name = 'User Account Administrator';
    newResult[0].roles.push(r);
    $.each(result[6], function(i, obj) {
      var a = obj;
      r.admins.push(a);
    });
    
    r = _.cloneDeep(role);
    r.name = 'Service Administrator';
    newResult[0].roles.push(r);
    $.each(result[7], function(i, obj) {
      var a = obj;
      r.admins.push(a);
    });

    r = _.cloneDeep(role);
    r.name = 'Individual Service Administrator';
    newResult[0].roles.push(r);
    $.each(result[8], function(i, obj) {
      var a = obj;
      r.admins.push(a);
    });
    
    return newResult;
  };

  var getServicePkgConverter = function(result) {        
    var convertedResult = result[4];
    $.each(convertedResult, function(i, obj) {
      obj.packageId = obj['more info'];
      if (obj.packageId.length) {
        obj['more info'] = '';
      }
    });        
    return convertedResult;
  };

  var getServicePkgDetailConverter = function(result) {        
    return result[2];
  };

  var getOrgInfoConverter = function(result) {   
    var newResult = $.parseJSON('[]');
    var item = {};
    $.each(result[4], function(i, obj) {
      item[obj.col1] = obj.data1;
    });
    $.each(result[5], function(i, obj) {
      item[obj.col1] = obj.data1;
    });
    newResult.push(item);
    // skip appending the admins, available via another call        
    return newResult;
  };

  var getUserServicePkgConverter = function(result) {        
    var convertedResult = result[4];
    $.each(convertedResult, function(i, obj) {
      obj.packageId = obj['home location code'];
      if (obj.packageId.length) {
        obj['home location code'] = '';
      }
    });        
    return convertedResult;
  };

  var getUserProfileConverter = function(result) {   
    var newResult = $.parseJSON('[{"info": [], "roles": []}]');

    var item = {};
    $.each(result[4], function(i, obj) {
      item[obj.col1] = obj.data1;
    });
    $.each(result[5], function(i, obj) {
      item[obj.col1] = obj.data1;
    });
    newResult[0].info.push(item);

    // append the roles
    $.each(result[7], function(i, obj) {
      newResult[0].roles.push(obj);
    });
    
    return newResult;
  };
  // ------------------------------------------------------


  // ------------------------------------------------------
  // 2nd-level converters; tableToJSON with table-parsing tweaks...
  // ------------------------------------------------------      
  var defaultTables2jsonConverter = function(result) {
    //cui.log('defaultTables2jsonConverter');
    var jsonArray = [];

    $.each(result, function(i, value) {
      var json = null;

      // If first tr mixes column and data, it is a 'non' table...
      var nameValueTable = $(value).find('tr:first:has(td.tableDataUnderscore)').length;
      if (nameValueTable) {
        // ...convert accordingly, using specified headings...
        json = $(value).tableToJSON({
          ignoreEmptyRows: true,
          ignoreHiddenRows: false,
          headings: ['col1','data1','col2','data2']
        });             
      }
      else {
        // ...normal table...
        json = $(value).tableToJSON({
          ignoreEmptyRows: true,
          ignoreHiddenRows: false
        });             
      }

      // Ok to push the empty ones, because their position in overall array is significant.
      jsonArray.push(json);
    });

    return jsonArray;
  };

  var rolesConverter = function(result) {
    var jsonArray = [];
    $.each(result, function(i, value) {
      var json = $(value).tableToJSON({
        ignoreEmptyRows: true,
        ignoreHiddenRows: false,
        textExtractor : {
          1 : function(cellIndex, $cell) {
            var cell0 = $cell.parent().find('td').eq(0);
            var roleId = cell0.find('a').attr('href').match(/roleId\=(.[\d]+)&/)[1];
            return roleId;
          }
        }
      });             
      jsonArray.push(json);
    });
    return jsonArray;
  };

  var pkgConverter = function(result) {
    var jsonArray = [];
    $.each(result, function(i, value) {
      var json = $(value).tableToJSON({
        ignoreEmptyRows: true,
        ignoreHiddenRows: false,
        textExtractor : {
          1 : function(cellIndex, $cell) {
            var cell0 = $cell.parent().find('td').eq(0).find('a').last().attr('href');
            var pkgId = '';
            if (cell0) {
              pkgId = cell0.match(/packageId\=(.[\d]+)&/)[1];                   
            }
            return pkgId;
          }
        }
      });             
      jsonArray.push(json);
    });
    return jsonArray;
  };

  var userConverter = function(result) {
    var jsonArray = [];
    $.each(result, function(i, value) {
      var json = $(value).tableToJSON({
        ignoreEmptyRows: true,
        ignoreHiddenRows: false,
        textExtractor : {
          3 : function(cellIndex, $cell) {
            var cell1 = $cell.parent().find('td').eq(1).find('a').last().attr('href');
            var userId = '';
            if (cell1) {
              userId = cell1.match(/userId\=(.[\d]+)&/)[1];                   
            }
            return userId;
          }
        }
      });             
      jsonArray.push(json);
    });
    return jsonArray;
  };

  var orgConverter = function(result) {
    var jsonArray = [];
    $.each(result, function(i, value) {
      var json = $(value).tableToJSON({
        ignoreEmptyRows: true,
        ignoreHiddenRows: false,
        textExtractor : {
          1 : function(cellIndex, $cell) {
            var cell0 = $cell.parent().find('td').eq(0).find('a').last().attr('href');
            var companyId = '';
            if (cell0) {
              companyId = cell0.match(/companyId\=(.[\d]+)&/)[1];                   
            }
            return '[' + companyId + ']' + $cell.text();
          }
        }
      });             
      jsonArray.push(json);
    });
    return jsonArray;
  };

  var roleUserConverter = function(result) {
    var jsonArray = [];
    $.each(result, function(i, value) {
      var json = $(value).tableToJSON({
        ignoreEmptyRows: true,
        ignoreHiddenRows: false,
        textExtractor : {
          0 : function(cellIndex, $cell) {
            var userId = $cell.find('input').attr('value');
            return userId;
          }
        }
      });             
      jsonArray.push(json);
    });
    return jsonArray;
  };

  var roleConverter = function(result) {
    var jsonArray = [];
    $.each(result, function(i, value) {
      var json;
      // If first tr mixes column and data, it is a 'non' table...
      var nameValueTable = $(value).find('tr:first:has(td.tableDataUnderscore)').length;
      if (nameValueTable) {
        // ...convert accordingly, using specified headings...
        json = $(value).tableToJSON({
          ignoreEmptyRows: true,
          ignoreHiddenRows: false,
          headings: ['col1','data1','col2','data2']
        });             
      }
      else {
        // ...normal table...
        json = $(value).tableToJSON({
          ignoreEmptyRows: true,
          ignoreHiddenRows: false,
          textExtractor : {
            0 : function(cellIndex, $cell) {
              return (($cell.attr('class') === 'sectionHeaderAlt') ? PRIV_GROUP_TOKEN : '') + $cell.text();
            }
          }
        });             
      }           
      jsonArray.push(json);
    });
    return jsonArray;
  };

  var pendingRequestsConverter = function(result) {
    var jsonArray = [];
    $.each(result, function(i, value) {
      var json = $(value).tableToJSON({
        ignoreEmptyRows: true,
        ignoreHiddenRows: false,
        textExtractor : {
          0 : function(cellIndex, $cell) {
            var requestId = $cell.find('a').last().attr('onclick');
            if (requestId) {
              requestId = requestId.match(/, (.[\d]+)\)/)[1];                   
            }
            else {
              requestId = '';
            }
            return requestId;
          }
        }
      });             
      jsonArray.push(json);
    });
    return jsonArray;
  };
  // ------------------------------------------------------



  // ------------------------------------------------------
  // 1st-level converters / filters; extracting data tables from html
  // ------------------------------------------------------      
  function html2tablesConverter(result) {
      //cui.log('html2tablesConverter');

      // 1st level conversion from filtered html to just the tables that contain data

      // NB not able to parse the popup html unless append the results to a dummy top node !!!
      // http://stackoverflow.com/a/15403888
      var html = $('<dummy>').append($.parseHTML(result));
      //cui.log('parsed html', html);

      /*
      var countAll = $(html).find('table').length;
      var count100 = $(html).find('table[width="100%"]').length;
      var countNotNested = $(html).find('table[width="100%"]:not(:has(table))').length;
      cui.log('count', countAll, count100, countNotNested);
      */

      // -------------------------
      // Extract tables...
      var tables = $(html).find('table[width="100%"]');
      // Extract tables that have no nested tables...
      //var tables = $(html).find('table[width="100%"]:not(:has(table))');
      // -------------------------
      
      // -------------------------
      // Remove the section rows...
      //  they confuse tableToJSON() plugin,
      //  although, they sometimes convey important hierarchical relationships in the data.
      //    NB only way to get this info is to have custom converter for these type of pages.
      $(tables).find('tr:has(td.sectionHeader)').remove();
      $(tables).find('tr:has(td.sectionSubheader)').remove();
      // -------------------------
      
      // -------------------------
      // Remove odd-ball rows...
      $(tables).find('tr:has(td:contains(" = uses site codes"))').remove();
      // -------------------------
      
      // -------------------------
      // Remove odd-ball cols...
      $(tables).find('td.tableDataUnderscoreSel[width="1%"]').remove();
      // -------------------------
      
      // -------------------------
      // Correct a colspan situation that confuses tableToJSON() plugin
      $(tables).find('td[colspan="3"]').attr('colspan','1');
      // -------------------------
      
      //cui.log('tables', tables);
      return tables;
  }

  function htmlFilter(data, type) {
      //cui.log('htmlFilter', type);

      // Clean up, prior to parse/conversions
      var filteredData = data.replace('<!doctype html>', '');

      filteredData = filteredData.replace(/[\n\r]+/g, ''); //crlf
      filteredData = filteredData.replace(/[\t]+/g, ' '); //tab

      filteredData = filteredData.replace(/<!--[\s\S]*?-->/g, ''); // <!-- comments -->
      filteredData = filteredData.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // <script></script>
      filteredData = filteredData.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, ''); // <img>

      filteredData = filteredData.replace(/&#x2f;/g, '/'); // slash
      filteredData = filteredData.replace(/&#x20;/g, ' '); // space

      //cui.log('htmlFilter:', filteredData);
      return filteredData;
  }
  // ----------



  // ------------------------------------------------------
  // Gets
  // ------------------------------------------------------
  function setCompanyUserFromHtml(response) {
    // Parse response for values...
    userId = response.match(/userId\=(.[\d]+)&/)[1];
    companyId = response.match(/companyId\=(.[\d]+)&/)[1];

    cui.log('set', userId, companyId);
    return;
  }

  function initCompanyUser(options) {
    setParams(options);
    var dc = prepareCall('HOME');

    var clonedOptions = (options) ? _.cloneDeep(options) : { };

    /* NB MUST clone to avoid infiinte loop in the ref below */
    var opts = clonedOptions; 

    opts.restURL = dc.call;
    opts.dataType = 'html';
    // NB using success NOT onSuccess ( see cui.ajax() )
    opts.success = [setCompanyUserFromHtml];
    
    if (options) {
      //cui.log('options', options);
      opts.success.push(options.success);
    }
    //cui.log('opts',opts);
      
    cui.ajax(opts);

    clearParams(options);
  }

  function getDataFromHtml(url, converter2, converter3, options) {
    var opts = options;
    opts.restURL = url;
    opts.dataType = 'html datatables ccajson appjson';
    opts.dataFilter = htmlFilter;
    opts.converters = { 
        'text datatables': html2tablesConverter, 
        'datatables ccajson': converter2 || defaultTables2jsonConverter,
        'ccajson appjson': converter3 || defaultjson2jsonConverter,
      };

    //cui.log('opts', opts);
    cui.ajax(opts);
  }

  function getDataFromJson(url, options) {
    var opts = options;
    opts.restURL = url;
    opts.dataType = 'json';
    cui.ajax(opts);
  }

  function get(cmd, options) {
    //cui.log('get', cmd);
    setParams(options);
    
    var dc = prepareCall(cmd);
    if (dc) {
      if (dc.type === 'json') {
        getDataFromJson(dc.call, options);
      }
      else {
        getDataFromHtml(dc.call, dc.converter2, dc.converter3, options);
      }
    }
    else {
      dataFailure('No such command:' + cmd);
    }

    clearParams(options);
  }

  function setParams(options) {
    // brute-force...
    // set only what is specified...
    if (options) {
      if (options.appServerUrl) {
        appServerUrl = options.appServerUrl;
      }
      if (options.userId) {
        userId = options.userId;
      }
      if (options.companyId) {
        companyId = options.companyId;
      }
      if (options.packageId) {
        packageId = options.packageId;
      }
      if (options.roleId) {
        roleId = options.roleId;
      }
      if (options.requestId) {
        requestId = options.requestId;
      }
    }
  }
  function clearParams(options) {
    // brute-force...
    // clear only what was just set...
    if (options) {
      if (options.appServerUrl) {
        appServerUrl = '';
      }
      if (options.userId) {
        userId = '';
      }
      if (options.companyId) {
        companyId = '';
      }
      if (options.packageId) {
        packageId = '';
      }
      if (options.roleId) {
        roleId = '';
      }
      if (options.requestId) {
        requestId = '';
      }
    }
  }
  // ------------------------------------------------------


  // ------------------------------------------------------
  // NB dataCalls need to be defined last because they make references to funcs defined above...
  // -------------------------------------
  var dataCalls = [];
  // -------
  // native calls
  //
  
  
  dataCalls.push({cmd:'HOME', name:'Home', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=HOME'});
  // http://qa.appcloud.covisintrnd.com:8080/CommonReg/secured?cmd=VIEW_INACTIVE_USER_PKG_GRANTS&companyId=61202&menu=myOrganization
  // http://qa.appcloud.covisintrnd.com:8080/CommonReg/secured?cmd=VIEW_LOCKED_USERS&companyId=61202
  // http://qa.appcloud.covisintrnd.com:8080/CommonReg/secured?cmd=AUDIT_USERS&menu=administration
  // http://qa.appcloud.covisintrnd.com:8080/CommonReg/secured?cmd=USER_SUMMARY&menu=reports

  // HERE locally, returning empty page
  dataCalls.push({cmd:'LANDING', name:'My Applications', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=LANDING'});      
 // user: grant history: http://qa.appcloud.covisintrnd.com:8080/CommonReg/secured?cmd=USER_PKG_GRANTS_LOG&userId=6122&menu=myProfile
  dataCalls.push({cmd:'VIEW_USER_PROFILE', name:'View My Profile', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_PROFILE&userId=' + USERID_TOKEN});
  // user: sp detail: http://qa.appcloud.covisintrnd.com:8080/CommonReg/secured?cmd=VIEW_USER_PACKAGE_GRANT_DETAIL&userId=6122&packageId=612605&menu=myProfile
  dataCalls.push({cmd:'VIEW_USER_SERVICES', name:'View My Service Packages', converter2: pkgConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_SERVICES&userId=' + USERID_TOKEN});
  dataCalls.push({cmd:'VIEW_COMPANY_PROFILE', name:'View Organization Profile', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_COMPANY_PROFILE&companyId='+ COMPANYID_TOKEN});

  // package detail (services): http://qa.appcloud.covisintrnd.com:8080/CommonReg/secured?cmd=VIEW_PACKAGE_DETAIL&event=moreInfo&packageId=10715240
  dataCalls.push({cmd:'VIEW_PACKAGE_DETAIL', name:'View Service Package Detail', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_PACKAGE_DETAIL&event=moreInfo&packageId=' + PACKAGEID_TOKEN});
  dataCalls.push({cmd:'VIEW_COMPANY_SERVICES', name:'View Organization Service Packages', converter2: pkgConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_COMPANY_SERVICES&companyId='+ COMPANYID_TOKEN});
  dataCalls.push({cmd:'VIEW_COMPANY_PACKAGE_GRANT_DETAIL', name:'View Organization Service Package', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_COMPANY_PACKAGE_GRANT_DETAIL&packageId=' + PACKAGEID_TOKEN + '&companyId='+ COMPANYID_TOKEN});
  dataCalls.push({cmd:'VIEW_USERS', name:'View Organization Users', converter2: userConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USERS&companyId='+ COMPANYID_TOKEN});
  dataCalls.push({cmd:'VIEW_COMPANY_ADMINS', name:'View Organization Admins', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_COMPANY_ADMINS&companyId='+ COMPANYID_TOKEN});
  dataCalls.push({cmd:'ORG_PKG_GRTS_LOG', name:'View Organization Package Grant Log', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=ORG_PKG_GRTS_LOG&companyId='+ COMPANYID_TOKEN});
  dataCalls.push({cmd:'VIEW_PENDING_REQUESTS', name:'View Organization Requests (pending)', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_PENDING_REQUESTS&companyId='+ COMPANYID_TOKEN + '&subject=company'});
  dataCalls.push({cmd:'VIEW_REQUEST_HISTORY', name:'View Organization Requests (non-pending)', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_REQUEST_HISTORY&companyId='+ COMPANYID_TOKEN + '&subject=company'});

  // site ?:   http://qa.appcloud.covisintrnd.com:8080/CommonReg/secured?cmd=VIEW_USER_REQUEST&requestId=0includeSubdivisions=false&approverType=1&requestType=12&menu=administration
  // sp(ex) ?: http://qa.appcloud.covisintrnd.com:8080/CommonReg/secured?cmd=VIEW_USER_REQUEST&requestId=0&includeSubdivisions=false&approverType=2&requestType=9&menu=administration
  dataCalls.push({cmd:'VIEW_USER_REQUEST', name:'View User request', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_REQUEST&requestId=2732173&includeSubdivisions=false&approverType=1&requestType=3'});
  dataCalls.push({cmd:'VIEW_USER_REQUEST_EXCHANGE', name:'View User request (ex)', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_REQUEST&requestId=2732166&includeSubdivisions=false&approverType=2&requestType=3'});
  dataCalls.push({cmd:'VIEW_USER_REQUEST_PACKAGE', name:'View Service Pkg request', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_REQUEST&requestId=2734948&includeSubdivisions=false&approverType=1&requestType=9'});

  dataCalls.push({cmd:'USER_APPROVAL_QUEUE_USER', name:'Pending User requests', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=USER_APPROVAL_QUEUE&approverType=1'});
  dataCalls.push({cmd:'USER_APPROVAL_QUEUE_PACKAGE', name:'Pending User service package requests', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=USER_APPROVAL_QUEUE&requestType=9&approverType=1'});
  dataCalls.push({cmd:'USER_APPROVAL_QUEUE_SITE', name:'Pending User site code requests', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=USER_APPROVAL_QUEUE&requestType=12&approverType=1'});
  dataCalls.push({cmd:'USER_APPROVAL_QUEUE_USER_EXCHANGE', name:'Pending User requests (exchange)', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=USER_APPROVAL_QUEUE&approverType=2'});
  dataCalls.push({cmd:'USER_APPROVAL_QUEUE_PACKAGE_EXCHANGE', name:'Pending User service package requests (exchange)', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=USER_APPROVAL_QUEUE&requestType=9&approverType=2'});
  
  /* HERE locally, throwing 500 error... */
  dataCalls.push({cmd:'COMPANY_APPROVAL_QUEUE', name:'Pending Organization requests', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=COMPANY_APPROVAL_QUEUE&approverType=1'});
  dataCalls.push({cmd:'COMPANY_APPROVAL_QUEUE_EXCHANGE', name:'Pending Organization requests (exchange)', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=COMPANY_APPROVAL_QUEUE&approverType=2'});
  /* ...500 */

  dataCalls.push({cmd:'ROLE_MAIN', name:'Manage Roles', converter2: rolesConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=ROLE_MAIN'});
  dataCalls.push({cmd:'ROLE_VIEW', name:'Role Details', converter2: roleConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=ROLE_VIEW&roleId=' + ROLEID_TOKEN});
  dataCalls.push({cmd:'ROLE_VIEW_USERS', name:'Role Details Users', converter2: roleUserConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=ROLE_VIEW_USERS&roleId=' + ROLEID_TOKEN});
  dataCalls.push({cmd:'VIEW_APPLICATIONS', name:'Get Applications', type:'json', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=APPLICATION_JSON&loadType=loadData'});

  dataCalls.push({cmd:'AUDIT_USERS_ADMIN_REVIEW', name:'Annual User Grant Audit Report', converter2: orgConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=AUDIT_USERS_ADMIN_REVIEW&auditType=2&menu=reports'});
  // --------

  // --------
  // x1 calls
  //
  dataCalls.push({cmd:'get_user_info', name: X1_TOKEN + 'Get User Profile', converter3: getUserProfileConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_PROFILE&userId=' + USERID_TOKEN});
  dataCalls.push({cmd:'get_user_service_packages', name: X1_TOKEN + 'Get User Service Packages', converter2: pkgConverter, converter3: getUserServicePkgConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_SERVICES&userId=' + USERID_TOKEN});
  
  dataCalls.push({cmd:'get_org_profile', name: X1_TOKEN + 'Get Organization Profile', converter3: getOrgInfoConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_COMPANY_PROFILE&companyId='+ COMPANYID_TOKEN});
  dataCalls.push({cmd:'get_service_package_detail', name: X1_TOKEN + 'Get Service Package Detail', converter3: getServicePkgDetailConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_PACKAGE_DETAIL&event=moreInfo&packageId=' + PACKAGEID_TOKEN});
  dataCalls.push({cmd:'get_org_service_packages', name: X1_TOKEN + 'Get Organization Service Packages', converter2: pkgConverter, converter3: getServicePkgConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_COMPANY_SERVICES&companyId='+ COMPANYID_TOKEN});
  //dataCalls.push({cmd:'get_package_detail', name: X1_TOKEN + 'Get Package Detail', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_COMPANY_PACKAGE_GRANT_DETAIL&packageId=' + PACKAGEID_TOKEN + '&companyId='+ COMPANYID_TOKEN});
  dataCalls.push({cmd:'get_users', name: X1_TOKEN + 'Get Users', converter2: userConverter, converter3: getUsersConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USERS&companyId='+ COMPANYID_TOKEN});
  dataCalls.push({cmd:'get_org_admins', name: X1_TOKEN + 'Get Organization Admins', converter3: getOrgAdminsConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_COMPANY_ADMINS&companyId='+ COMPANYID_TOKEN});
  dataCalls.push({cmd:'get_org_sp_grants', name: X1_TOKEN + 'Get Organization Service Package Grants', converter3: getOrgServicePkgGrantConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=ORG_PKG_GRTS_LOG&companyId='+ COMPANYID_TOKEN});
  dataCalls.push({cmd:'get_org_req_pending', name: X1_TOKEN + 'Get Organization Requests (pending)', converter3: getOrgRequestConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_PENDING_REQUESTS&companyId='+ COMPANYID_TOKEN + '&subject=company'});
  dataCalls.push({cmd:'get_org_req_nonpending', name: X1_TOKEN + 'Get Organization Requests (non-pending)', converter3: getOrgRequestConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_REQUEST_HISTORY&companyId='+ COMPANYID_TOKEN + '&subject=company'});

  dataCalls.push({cmd:'get_site_request', name: X1_TOKEN + 'Get Site request',  converter3: getPendingRequestConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_REQUEST&requestId=' + REQUESTID_TOKEN + '&includeSubdivisions=false&approverType=1&requestType=12'});
  dataCalls.push({cmd:'get_sp_request_ex', name: X1_TOKEN + 'Get Service Pkg request (ex)',  converter3: getPendingRequestConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_REQUEST&requestId=' + REQUESTID_TOKEN + '&includeSubdivisions=false&approverType=2&requestType=9'});
  dataCalls.push({cmd:'get_sp_request', name: X1_TOKEN + 'Get Service Pkg request',  converter3: getPendingRequestConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_REQUEST&requestId=' + REQUESTID_TOKEN + '&includeSubdivisions=false&approverType=1&requestType=9'});
  dataCalls.push({cmd:'get_user_request_ex', name: X1_TOKEN + 'Get User request (ex)', converter3: getPendingRequestConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_REQUEST&requestId=' + REQUESTID_TOKEN + '&includeSubdivisions=false&approverType=2&requestType=3'});
  dataCalls.push({cmd:'get_user_request', name: X1_TOKEN + 'Get User request', converter3: getPendingRequestConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_USER_REQUEST&requestId=' + REQUESTID_TOKEN + '&includeSubdivisions=false&approverType=1&requestType=3'});
  dataCalls.push({cmd:'get_pending_user_requests', name: X1_TOKEN + 'Get Pending User requests', converter2: pendingRequestsConverter, converter3: getPendingRequestsConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=USER_APPROVAL_QUEUE&approverType=1'});
  dataCalls.push({cmd:'get_pending_sp_requests', name: X1_TOKEN + 'Get Pending Service Pkg requests', converter2: pendingRequestsConverter, converter3: getPendingRequestsConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=USER_APPROVAL_QUEUE&requestType=9&approverType=1'});
  dataCalls.push({cmd:'get_pending_site_requests', name: X1_TOKEN + 'Get Pending Site code requests', converter2: pendingRequestsConverter, converter3: getPendingRequestsConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=USER_APPROVAL_QUEUE&requestType=12&approverType=1'});
  dataCalls.push({cmd:'get_pending_user_requests_ex', name: X1_TOKEN + 'Get Pending User requests (exchange)', converter2: pendingRequestsConverter, converter3: getPendingRequestsConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=USER_APPROVAL_QUEUE&approverType=2'});
  dataCalls.push({cmd:'get_pending_sp_requests_ex', name: X1_TOKEN + 'Get Pending Service Pkg requests (exchange)', converter2: pendingRequestsConverter, converter3: getPendingRequestsConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=USER_APPROVAL_QUEUE&requestType=9&approverType=2'});

  dataCalls.push({cmd:'get_roles', name: X1_TOKEN + 'Get Roles', converter2: rolesConverter, converter3: getRolesConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=ROLE_MAIN'});
  dataCalls.push({cmd:'get_role', name: X1_TOKEN + 'Get Role', converter2: roleConverter, converter3: getRoleConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=ROLE_VIEW&roleId=' + ROLEID_TOKEN});
  dataCalls.push({cmd:'get_role_users', name: X1_TOKEN + 'Get Role Users', converter2: roleUserConverter, converter3: getRoleUserConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=ROLE_VIEW_USERS&roleId=' + ROLEID_TOKEN});

  dataCalls.push({cmd:'get_applications', name: X1_TOKEN + 'Get Applications', type:'json', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=APPLICATION_JSON&loadType=loadData'});
  dataCalls.push({cmd:'get_users_audit_by_company', name: X1_TOKEN + 'Get Users Audit by Company', converter2: orgConverter, converter3: getUsersAuditConverter, call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=AUDIT_USERS_ADMIN_REVIEW&auditType=2&menu=reports'});
  // --------
  
  // --------
  // superfluous calls
  //dataCalls.push({cmd:'VIEW_COMPANY_HIERARCHY', name:'View Organization Hierarchy', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_COMPANY_HIERARCHY&browseCommand=VIEW_COMPANY_HIERARCHY&displayViewCompany=true&companyId='+ COMPANYID_TOKEN});
  //dataCalls.push({cmd:'VIEW_COMPANY_SERVICES_EXPANDED', name:'View Organization Service Packages expanded', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=VIEW_COMPANY_SERVICES&companyId='+ COMPANYID_TOKEN + '&expendPackageId=10715240#10715240'});
  //dataCalls.push({cmd:'MANAGE_APPLICATION', name:'Manage Applications', call: SERVER_TOKEN+'/'+'CommonReg/secured?cmd=MANAGE_APPLICATION'});
  // -------------------------

  // -------------------------------------


  // -------------------------------------
  // Public methods
  // -------------------------------------
  return {
  	getAppUrl: function() {
  		return appServerUrl;
  	},
    setAppUrl: function(val) {
      appServerUrl = val;
    },
    getCompanyId: function() {
      return companyId;
    },


    getDataCalls: function() {
      return dataCalls;
    },
    getNativeDataCalls: function() {
      var calls = [];
      _.each(dataCalls, function(dc) {
        if (dc.name.indexOf(X1_TOKEN) === -1) {
          calls.push(dc);
        }
      });
      return calls;
    },
    getX1DataCalls: function() {
      var calls = [];
      _.each(dataCalls, function(dc) {
        if (dc.name.indexOf(X1_TOKEN) > -1) {
          dc.name = dc.name.replace(X1_TOKEN,'');
          calls.push(dc);
        }
      });
      return calls;
    },

    // -------

    initCompanyUser: function() {
      return initCompanyUser.apply(null, arguments);
    },

    get: function() {
      return get.apply(null, arguments);
    },

    // -------

    getUsers: function(options) {
      return get('get_users', options);
    },
    getUsersAuditByCompany: function(options) {
      return get('get_users_audit_by_company', options);
    },

    getRoleUsers: function(options) {
      return get('get_role_users', options);
    },
    getRole: function(options) {
      return get('get_role', options);
    },
    getRoles: function(options) {
      return get('get_roles', options);
    },

    getPendingSpRequestsEx: function(options) {
      return get('get_pending_sp_requests_ex', options);
    },
    getPendingUserRequestsEx: function(options) {
      return get('get_pending_user_requests_ex', options);
    },
    getPendingSpRequests: function(options) {
      return get('get_pending_sp_requests', options);
    },
    getPendingUserRequests: function(options) {
      return get('get_pending_user_requests', options);
    },
    getPendingSiteRequests: function(options) {
      return get('get_pending_site_requests', options);
    },
    getUserRequest: function(options) {
      return get('get_user_request', options);
    },
    getUserRequestEx: function(options) {
      return get('get_user_request_ex', options);
    },
    getSpRequest: function(options) {
      return get('get_sp_request', options);
    },
    getSpRequestEx: function(options) {
      return get('get_sp_request_ex', options);
    },
    getSiteRequest: function(options) {
      return get('get_site_request', options);
    },

    getOrgRequestsNonPending: function(options) {
      return get('get_org_requests_nonpending', options);
    },
    getOrgRequestsPending: function(options) {
      return get('get_org_requests_pending', options);
    },
    getOrgSpGrants: function(options) {
      return get('get_org_sp_grants', options);
    },

    getApplications: function(options) {
      return get('get_applications', options);
    },

    getOrgServicePackages: function(options) {
      return get('get_org_service_packages', options);
    },
    getServicePackageDetail: function(options) {
      return get('get_service_package_detail', options);
    },

    getOrganizationProfile: function(options) {
      return get('get_org_profile', options);
    },

    getUserServicePackages: function(options) {
      return get('get_user_service_packages', options);
    },

    sayHello: function() {
      cui.log('hello web');
    }

  };
};
// --------------------------------------------



})(window.cui = window.cui || {});
