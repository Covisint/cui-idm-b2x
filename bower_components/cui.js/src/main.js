
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
