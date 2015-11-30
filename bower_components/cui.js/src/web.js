
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

