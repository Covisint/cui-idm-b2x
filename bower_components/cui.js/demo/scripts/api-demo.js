'use strict';

var myCUI = cui.api();
myCUI.setService('PRD');


/*
function say1(resultElement) {
	function cb1(args) {
		cui.log('1cb', this);
		resultElement.append($('<span></span>').text('orgs, ').addClass('running'));
	}
  return myCUI.sayDeferredConfig({
  	message: 'say one',
  	callback: cb1,
  	context: 'one', 
  	delay: 750
  });
}
function say2(resultElement) {
	function cb2(args) {
		cui.log('2cb', this);
		resultElement.append($('<span></span>').text('users, ').addClass('running'));
	}
  return myCUI.sayDeferredConfig({
  	message: 'say two',
  	callback: cb2,
  	context: 'two',
  	delay: 350
  });
}
function say3(resultElement) {
  return myCUI.sayDeferredConfig({
  	message: 'say three',
  	context: 'three' ,
  	delay: 950
  }).done(function() {
		cui.log('say 3 done', this);
		resultElement.append($('<span></span>').text('devices, ').addClass('running'));
  });
}
function sayDoneDefer(resultElement,msg) {
  return $.Deferred(function( dfd ) {
		resultElement.append($('<span></span>').text(msg).addClass('running'));
		cui.log('saydonedefer', this);
		dfd.resolve();
		return dfd.promise();
  }).promise();
}
function sayDone(resultElement,msg) {
	resultElement.append($('<span></span>').text(msg).addClass('running'));
	cui.log('saydone', this);
}
*/

$(document).ready(function () {
	/*
	var idmButtonState = false;
	var doneMsg = 'done!';
	var resetMsg = '';
	var idmResult1 = $('#idmResult1');
	var idmButton1 = $('#idmButton1');

	idmResult1.text(resetMsg);

	// 1. Deffered test, leading up to ajaxNew()
	idmButton1.on('click', function() {
		idmButtonState = !idmButtonState;
		if (idmButtonState) {
			$(this).text('Reset');

			// run
			$.when(
			  say1(idmResult1),
			  say2(idmResult1),
			  say3(idmResult1)
			  //sayDoneDefer(idmResult1,doneMsg)
			).then(function() {
				cui.log('idmButton1 then');
			}).done(function() {
				cui.log('idmButton1 done', this);
				sayDone(idmResult1,doneMsg);
			}).fail(function() {
				cui.log('idmButton1 failed');
			});
		}
		else {
			$(this).text('Run');		
			idmResult1.text(resetMsg).removeClass('running');
		}
	});
	*/

	// 2. OAuth test
	$('#authButton').on('click', function() {
		myCUI.doThreeLeggedOAuth({
			clientId: 'WPUodVvicVPIvJdnakomB4nCa3GnyE6r'			
		})
		.then(function(token) {
			cui.log('doThreeLeggedAuth then', token);
		})
		.fail(function() {
			cui.log('doThreeLeggedAuth fail');					
		});
	});
	myCUI.handleAuthResponse();


	// 2b. SysAuth test
	$('#sysAuthButton').on('click', function() {
		myCUI.doSysAuth({
			clientId: 'WPUodVvicVPIvJdnakomB4nCa3GnyE6r',
			clientSecret: 'aJ8qaCpFaG3PGaCG'
		})
		.then(function(token) {
			cui.log('doSysAuth then', token);
		})
		.fail(function() {
			cui.log('doSysAuth fail');					
		});
	});

	// 2c. Logout test
	$('#idmLogoutButton').on('click', function() {
		myCUI.doIdmLogout({
			idmIdentityUrl: 'https://platform-cui.login.covapp.io'
		});
	});

	// 2d. Revoke test
	$('#revokeButton').on('click', function() {
		myCUI.doRevoke()
			.then(function(response) {
				cui.log('doRevoke then', response);
			})
			.fail(function(response) {
				cui.log('doRevoke failed', response);
			});
	});

	// Show token
	var tokenButtonState = false;
	$('#showTokenButton').on('click', function() {
		tokenButtonState = !tokenButtonState;
		if (tokenButtonState) {
			$(this).text('Hide Token');
			var token = decodeURIComponent(myCUI.getToken());
			cui.log('token', token);
			$('#authResult').empty().append($('<span></span>').text(token).addClass('running'));			
		}
		else {
			$(this).text('Show Token');
			$('#authResult').empty();			
		}
	});



	// 3. Get Orgs
	function showOrgs(resultElement,data,classStr) {
		cui.log('showOrgs', data);
		resultElement.empty().append($('<span></span>').text(JSON.stringify(data)).addClass(classStr));
	}
	var idmResult3 = $('#idmResult3');
	var idmButton3 = $('#idmButton3');
	var idmButton3State = false;
	idmButton3.on('click', function() {
		idmButton3State = !idmButton3State;
		if (idmButton3State) {
			$(this).text('Hide Orgs');

			// run b
			myCUI.getOrganizations()
				.then(function(response) {
					cui.log('getOrgs then', response);
					showOrgs(idmResult3, response, 'running');
				})
				.fail(function(response) {
					cui.log('getOrgs failed', response);
					showOrgs(idmResult3, cui.parseError(response), 'failing');
				});
		}
		else {
			$(this).text('Get Orgs');
			$('#idmResult3').empty();
		}
	});

	var idmResult3b = $('#idmResult3b');
	var idmButton3b = $('#idmButton3b');
	var idmButton3bState = false;
	idmButton3b.on('click', function() {
		idmButton3bState = !idmButton3bState;
		if (idmButton3bState) {
			$(this).text('Hide Orgs');

			myCUI.getOrganization({
				'organizationId': 'OPLATFORM-CUI195802'
			})
			.then(function(response) {
				cui.log('getOrg then', response);
				showOrgs(idmResult3b, response, 'running');
			})
			.fail(function(response) {
				cui.log('getOrg failed', response);
				showOrgs(idmResult3b, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Get Orgs');
			$('#idmResult3b').empty();
		}
	});


	// 3. Get Users, with token test
  //var opts = {};
	function showUsers(resultElement,data,classStr) {
		cui.log('showUsers', data);
		resultElement.empty().append($('<span></span>').text(JSON.stringify(data)).addClass(classStr));
	}
	var idmResult4 = $('#idmResult4');
	var idmButton4 = $('#idmButton4');
	var idmButton4State = false;
	idmButton4.on('click', function() {
		idmButton4State = !idmButton4State;
		if (idmButton4State) {
			$(this).text('Hide Users');

			myCUI.getUsers()
			.then(function(response) {
				cui.log('getUsers then', response);
				showUsers(idmResult4, response, 'running');
			})
			.fail(function(response) {
				cui.log('getUsers failed', response);
				showUsers(idmResult4, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Get Users');
			$('#idmResult4').empty();
		}
	});


	// 3. Get Packages, with token test
  //var opts = {};
	function showPackages(resultElement,data,classStr) {
		cui.log('showPackages', data);
		resultElement.empty().append($('<span></span>').text(JSON.stringify(data)).addClass(classStr));
	}
	var idmResult5 = $('#idmResult5');
	var idmButton5 = $('#idmButton5');
	var idmButton5State = false;
	idmButton5.on('click', function() {
		idmButton5State = !idmButton5State;
		if (idmButton5State) {
			$(this).text('Hide Packages');

			myCUI.getPackages()
			.then(function(response) {
				cui.log('getPackages then', response);
				showPackages(idmResult5, response, 'running');
			})
			.fail(function(response) {
				cui.log('getPackages failed', response);
				showPackages(idmResult5, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Get Packages');
			$('#idmResult5').empty();
		}
	});


	// -----------------------------------------------
	// IOT demo
	// -----------------------------------------------
	// SysOAuth test
	$('#iotSysAuthButton').on('click', function() {
		myCUI.doSysAuth({
			// NB this is steeples! 
			// TODO need to spin up a cui demo iot app
			clientId: 'DHWkjm5hoFGGza2bzL30tAJRtupfSeO5',
			clientSecret: 'pbTOGgCMwFLR6fkV'
		})
		.then(function(token) {
			cui.log('doSysAuth then', token);
		})
		.fail(function() {
			cui.log('doSysAuth fail');					
		});
	});

	// Get/Create Applications
	function showApps(resultElement,data,classStr) {
		cui.log('showApps', data);
		resultElement.empty().append($('<span></span>').text(JSON.stringify(data)).addClass(classStr));
	}
	var iotResult1a = $('#iotResult1a');
	var iotButton1a = $('#iotButton1a');
	var iotButton1aState = false;
	iotButton1a.on('click', function() {
		iotButton1aState = !iotButton1aState;
		if (iotButton1aState) {
			$(this).text('Hide Created App');

      var appBody = {
        'name': [
          {
            'lang': 'en',
            'text': 'My Killer App'
          }
        ],
        'description': [
          {
            'lang': 'en',
            'text': 'Hybrid, single-page-app that does that unbelievable.'
          }
        ]
      };
			myCUI.createApplication({ data: appBody })
			.then(function(response) {
				cui.log('createApplication then', response);
				showApps(iotResult1a, response, 'running');
			})
			.fail(function(response) {
				cui.log('createApplication failed', response);
				showApps(iotResult1a, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Create App');
			$('#iotResult1a').empty();
		}
	});

	var iotResult1 = $('#iotResult1');
	var iotButton1 = $('#iotButton1');
	var iotButton1State = false;
	iotButton1.on('click', function() {
		iotButton1State = !iotButton1State;
		if (iotButton1State) {
			$(this).text('Hide Apps');

			myCUI.getApplications()
			.then(function(response) {
				cui.log('getApps then', response);
				showApps(iotResult1, response, 'running');
			})
			.fail(function(response) {
				cui.log('getApps failed', response);
				showApps(iotResult1, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Get Apps');
			$('#iotResult1').empty();
		}
	});

	// Get/Create Devices
	function showDevices(resultElement,data,classStr) {
		cui.log('showDevices', data);
		resultElement.empty().append($('<span></span>').text(JSON.stringify(data)).addClass(classStr));
	}
	var iotResult2 = $('#iotResult2');
	var iotButton2 = $('#iotButton2');
	var iotButton2State = false;
	iotButton2.on('click', function() {
		iotButton2State = !iotButton2State;
		if (iotButton2State) {
			$(this).text('Hide Devices');

			myCUI.getDevices()
			.then(function(response) {
				cui.log('getDevices then', response);
				showDevices(iotResult2, response, 'running');
			})
			.fail(function(response) {
				cui.log('getDevices failed', response);
				showDevices(iotResult2, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Get Devices');
			$('#iotResult2').empty();
		}
	});

	var iotResult2a = $('#iotResult2a');
	var iotButton2a = $('#iotButton2a');
	var iotButton2aState = false;
	iotButton2a.on('click', function() {
		iotButton2aState = !iotButton2aState;
		if (iotButton2aState) {
			$(this).text('Hide Created Device');

			myCUI.createDeviceFromTemplate({'deviceTemplateId':'xyz'})
			.then(function(response) {
				cui.log('createDeviceFromTemplate then', response);
				showDevices(iotResult2a, response, 'running');
			})
			.fail(function(response) {
				cui.log('createDeviceFromTemplate failed', response);
				showDevices(iotResult2a, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Create Device From Template');
			$('#iotResult2a').empty();
		}
	});

	// Get Device Templates
	function showDeviceTemplates(resultElement,data,classStr) {
		cui.log('showDeviceTemplates', data);
		resultElement.empty().append($('<span></span>').text(JSON.stringify(data)).addClass(classStr));
	}
	var iotResult3a = $('#iotResult3a');
	var iotButton3a = $('#iotButton3a');
	var iotButton3aState = false;
	iotButton3a.on('click', function() {
		iotButton3aState = !iotButton3aState;
		if (iotButton3aState) {
			$(this).text('Hide Created Device Template');

      var appBody = {
        'name': [
          {
            'lang': 'en',
            'text': 'My Device Template'
          }
        ],
        'description': [
          {
            'lang': 'en',
            'text': 'My Device Template Description',
          }
        ],
        'isActive': 'false'
      };
			myCUI.createDeviceTemplate({ data: appBody })
			.then(function(response) {
				cui.log('createDeviceTemplate then', response);
				showDeviceTemplates(iotResult3a, response, 'running');
			})
			.fail(function(response) {
				cui.log('createDeviceTemplate failed', response);
				showDeviceTemplates(iotResult3a, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Create Device Template');
			$('#iotResult3a').empty();
		}
	});

	var iotResult3 = $('#iotResult3');
	var iotButton3 = $('#iotButton3');
	var iotButton3State = false;
	iotButton3.on('click', function() {
		iotButton3State = !iotButton3State;
		if (iotButton3State) {
			$(this).text('Hide DeviceTemplates');

			myCUI.getDeviceTemplates()
			.then(function(response) {
				cui.log('getDeviceTemplates then', response);
				showDeviceTemplates(iotResult3, response, 'running');
			})
			.fail(function(response) {
				cui.log('getDeviceTemplates failed', response);
				showDeviceTemplates(iotResult3, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Get Device Templates');
			$('#iotResult3').empty();
		}
	});


	// Get Event Sources
	function showEventSources(resultElement,data,classStr) {
		cui.log('showEventSources', data);
		resultElement.empty().append($('<span></span>').text(JSON.stringify(data)).addClass(classStr));
	}
	var iotResult4 = $('#iotResult4');
	var iotButton4 = $('#iotButton4');
	var iotButton4State = false;
	iotButton4.on('click', function() {
		iotButton4State = !iotButton4State;
		if (iotButton4State) {
			$(this).text('Hide EventSources');

			myCUI.getEventSources()
			.then(function(response) {
				cui.log('getEventSources then', response);
				showEventSources(iotResult4, response, 'running');
			})
			.fail(function(response) {
				cui.log('getEventSources failed', response);
				showEventSources(iotResult4, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Get EventSources');
			$('#iotResult4').empty();
		}
	});

	// Get/Create Event Templates
	function showEventTemplates(resultElement,data,classStr) {
		cui.log('showEventTemplates', data);
		resultElement.empty().append($('<span></span>').text(JSON.stringify(data)).addClass(classStr));
	}

	var iotResult5a = $('#iotResult5a');
	var iotButton5a = $('#iotButton5a');
	var iotButton5aState = false;
	iotButton5a.on('click', function() {
		iotButton5aState = !iotButton5aState;
		if (iotButton5aState) {
			$(this).text('Hide Created Event Template');

      var appBody = { 
        'name': [
          {
            'lang': 'en',
            'text': 'My Event Template'
          }
        ],
        'description': [
          {
            'lang': 'en',
            'text': 'My Event Template Description',
          }
        ],
        'isActive': 'false'
      };
			myCUI.createEventTemplate({ data: appBody })
			.then(function(response) {
				cui.log('createEventTemplate then', response);
				showEventTemplates(iotResult5a, response, 'running');
			})
			.fail(function(response) {
				cui.log('createEventTemplate failed', response);
				showEventTemplates(iotResult5a, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Create Event Template');
			$('#iotResult5a').empty();
		}
	});

	var iotResult5 = $('#iotResult5');
	var iotButton5 = $('#iotButton5');
	var iotButton5State = false;
	iotButton5.on('click', function() {
		iotButton5State = !iotButton5State;
		if (iotButton5State) {
			$(this).text('Hide Event Templates');

			myCUI.getEventTemplates()
			.then(function(response) {
				cui.log('getEventTemplates then', response);
				showEventTemplates(iotResult5, response, 'running');
			})
			.fail(function(response) {
				cui.log('getEventTemplates failed', response);
				showEventTemplates(iotResult5, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Get Event Templates');
			$('#iotResult5').empty();
		}
	});


	// Get/Create Attribute Types
	function showAttributeTypes(resultElement,data,classStr) {
		cui.log('showAttributeTypes', data);
		resultElement.empty().append($('<span></span>').text(JSON.stringify(data)).addClass(classStr));
	}

	var iotResult6a = $('#iotResult6a');
	var iotButton6a = $('#iotButton6a');
	var iotButton6aState = false;
	iotButton6a.on('click', function() {
		iotButton6aState = !iotButton6aState;
		if (iotButton6aState) {
			$(this).text('Hide Created Attribute Type');

      var appBody = { 
      };
			myCUI.createAttributeType({ data: appBody })
			.then(function(response) {
				cui.log('createAttributeType then', response);
				showAttributeTypes(iotResult6a, response, 'running');
			})
			.fail(function(response) {
				cui.log('createAttributeType failed', response);
				showAttributeTypes(iotResult6a, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Create Attribute Type');
			$('#iotResult6a').empty();
		}
	});
	var iotResult6 = $('#iotResult6');
	var iotButton6 = $('#iotButton6');
	var iotButton6State = false;
	iotButton6.on('click', function() {
		iotButton6State = !iotButton6State;
		if (iotButton6State) {
			$(this).text('Hide Attribute Types');

			myCUI.getAttributeTypes()
			.then(function(response) {
				cui.log('getAttributeTypes then', response);
				showAttributeTypes(iotResult6, response, 'running');
			})
			.fail(function(response) {
				cui.log('getAttributeTypes failed', response);
				showAttributeTypes(iotResult6, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Get Attribute Types');
			$('#iotResult6').empty();
		}
	});

	// Get/Create Command Templates
	function showCommandTemplates(resultElement,data,classStr) {
		cui.log('showCommandTemplates', data);
		resultElement.empty().append($('<span></span>').text(JSON.stringify(data)).addClass(classStr));
	}

	var iotResult7a = $('#iotResult7a');
	var iotButton7a = $('#iotButton7a');
	var iotButton7aState = false;
	iotButton7a.on('click', function() {
		iotButton7aState = !iotButton7aState;
		if (iotButton7aState) {
			$(this).text('Hide Created Command Template');

      var appBody = { 
      };
			myCUI.createCommandTemplate({ data: appBody })
			.then(function(response) {
				cui.log('createCommandTemplate then', response);
				showCommandTemplates(iotResult7a, response, 'running');
			})
			.fail(function(response) {
				cui.log('createCommandTemplate failed', response);
				showCommandTemplates(iotResult7a, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Create Command Template');
			$('#iotResult7a').empty();
		}
	});
	var iotResult7 = $('#iotResult7');
	var iotButton7 = $('#iotButton7');
	var iotButton7State = false;
	iotButton7.on('click', function() {
		iotButton7State = !iotButton7State;
		if (iotButton7State) {
			$(this).text('Hide Command Templates');

			myCUI.getCommandTemplates()
			.then(function(response) {
				cui.log('getCommandTemplates then', response);
				showCommandTemplates(iotResult7, response, 'running');
			})
			.fail(function(response) {
				cui.log('getCommandTemplates failed', response);
				showCommandTemplates(iotResult7, cui.parseError(response), 'failing');
			});
		}
		else {
			$(this).text('Get Command Templates');
			$('#iotResult7').empty();
		}
	});

	// -----------------------------------------------

});
// --------------