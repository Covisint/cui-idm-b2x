
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

