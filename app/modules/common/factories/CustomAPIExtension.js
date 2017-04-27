angular.module('common')
.factory('CustomAPIExtension', () => {

	/* 	
		Any calls added here will be added to the API.cui object.
	*/

    const calls = [
    	/* ---------- Registration Nonce Calls ---------- */
    	{
    		cmd: 'initiateNonce',
    		cmdType: 'unsecured',
    		type: 'GET',
    		accepts: 'application/json',
    		call: '/registration/v1/registrations/open/initiate'
    	},
    	{
    		cmd: 'getOrganizationNonce',
    		cmdType: 'nonce',
    		type: 'GET',
    		accepts: 'application/vnd.com.covisint.platform.organization.v1+json',
    		call: '/registration/v1/registrations/organizations/{organizationId}'
    	},
    	{
    		cmd: 'getOrganizationsNonce',
    		cmdType: 'nonce',
    		type: 'GET',
    		accepts: 'application/vnd.com.covisint.platform.organization.v1+json',
    		call: '/registration/v1/registrations/organizations'
    	},
    	{
    		cmd: 'getSecurityQuestionsNonce',
    		cmdType: 'nonce',
    		type: 'GET',
    		accepts: 'application/vnd.com.covisint.platform.securityquestion.v1+json',
    		call: '/registration/v1/registrations/securityQuestions'
    	},
    	{
    		cmd: 'postUserRegistrationNonce',
    		cmdType: 'nonce',
    		type: 'POST',
    		accepts: 'application/vnd.com.covisint.platform.person.password.account.v1+json',
    		contentType: 'application/vnd.com.covisint.platform.person.password.account.v1+json',
    		call: '/registration/v1/registrations/persons/registration'
    	},
    	{
            cmd: 'getPasswordPoliciesNonce',
            cmdType: 'nonce',
            type: 'GET',
            accepts: 'application/vnd.com.covisint.platform.password.policy.v1+json',
            call: '/registration/v1/registrations/passwords/policies/{policyId}'
        },
        {
            cmd: 'postPersonRequestNonce',
            cmdType: 'nonce',
            type: 'POST',
            accepts: 'application/vnd.com.covisint.platform.person.request.v1+json',
            contentType: 'application/vnd.com.covisint.platform.person.request.v1+json',
            call: '/registration/v1/registrations/persons/requests'
        },
        {
        	cmd: 'getOrgPackageGrantsNonce',
        	cmdType: 'nonce',
        	type: 'GET',
        	accepts: 'application/vnd.com.covisint.platform.package.grant.v1+json',
        	call: '/registration/v1/registrations/organizations/{organizationId}/packages'
        },
		{
			cmd: 'validateUsernameEmailNonce',
			cmdType: 'nonce',
			type: 'POST',
			accepts: 'application/vnd.com.covisint.platform.person.password.account.v1+json',
			contentType: 'application/vnd.com.covisint.platform.person.password.account.v1+json',
			call: '/registration/v1/registrations/persons/registration/validate'
		},
        {
            cmd: 'securedInitiate',
            cmdType: 'unsecured',
            type: 'GET',
            accepts: 'application/vnd.com.covisint.platform.person.invitation.v1+json',
            call: '/registration/v1/registrations/securedInvite/initiate/{invitationId}'
        },
        {
            cmd: 'getOrgAppsNonce',
            cmdType: 'nonce',
            type: 'GET',
            accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',
            call: '/registration/v1/applications/organizations/{organizationId}'
        },
        {
            cmd: 'getOrgAppsCountNonce',
            cmdType: 'nonce',
            type: 'GET',
            accepts: 'text/plain',
            call: '/registration/v1/applications/organizations/{organizationId}/count'
        },
        {
            cmd: 'getOrganizationsCountNonce',
            cmdType: 'nonce',
            type: 'GET',
            accepts: 'text/plain',
            call: '/registration/v1/registrations/organizations/count'
        },
        //New Calls-S
        {cmd: "getOrgRegistrationRequests",call:"/registration/v1/organization/requests",type:"GET",accepts:"application/vnd.com.covisint.platform.organization.request.v1+json",contentType:"application/vnd.com.covisint.platform.organization.request.v1+json"},
        {cmd: "getOrgRegistrationRequestsCount",call: "/registration/v1/organization/requests/count",type: "GET",accepts: "text/plain"},
        {cmd: 'approveOrgRegistrationRequest', call:'/registration/v1/organization/requests/tasks/approve', type:'POST', accepts:'application/vnd.com.covisint.platform.organization.request.v1+json'},
        {cmd: 'denyOrgRegistrationRequest', call:'/registration/v1/organization/requests/tasks/deny', type:'POST', accepts:'application/vnd.com.covisint.platform.organization.request.v1+json'},
                // ADMIN... imported from Coke...
        {cmd: 'getPackageByQuery',accepts: 'application/vnd.com.covisint.platform.package.v1+json',call: `/service/v3/packages`,type: 'GET' },
        {cmd: "getPersonByQuery",call: "/person/v3/persons",type: "GET",accepts: "application/vnd.com.covisint.platform.person.v1+json"  },
        {cmd: "getRegistrationRequests",call:"/registration/v1/person/requests",type:"GET",accepts:"application/vnd.com.covisint.platform.person.request.v1+json",contentType:"application/vnd.com.covisint.platform.person.request.v1+json"},
        {cmd: "createRegistrationRequest","cmdType": "unsecured",call:"/registration/v1/person/requests",type:"POST",accepts:"application/vnd.com.covisint.platform.person.request.v1+json",contentType:"application/vnd.com.covisint.platform.person.request.v1+json"},
        {cmd: "getOrganizationSecured","cmdType": "secured","call": "/organization/v3/organizations/{organizationId}","type": "GET","accepts": "application/vnd.com.covisint.platform.organization.v1+json"},
        {cmd: "getPasswordPolicySecured","cmdType": "secured","call": "/authn/v4/passwords/policies/{policyId}","type": "GET","accepts": "application/vnd.com.covisint.platform.password.policy.v1+json"},
        {cmd: 'grantClaims',accepts: 'application/vnd.com.covisint.platform.package.grant.claim.v1+json',contentType:"application/vnd.com.covisint.platform.package.grant.claim.v1+json",call: '/service/v3/packages/grants/claims',type: 'PUT' },
        {cmd: 'initiateRegistration', cmdType: 'unsecured', call: '/registration/v1/registrations/open/initiate', type: 'GET', accepts: 'application/vnd.com.covisint.platform.person.invitation.v1+json'},
        {cmd: 'initiateSecuredRegistration', cmdType: 'unsecured', call: '/registration/v1/registrations/securedInvite/initiate/{id}', type: 'GET', accepts: 'application/vnd.com.covisint.platform.person.invitation.v1+json'},
        {cmd: 'createRegistrationNonce',cmdType: 'nonce',call:'/registration/v1/registrations/persons/registration',type:'POST',accepts:'application/vnd.com.covisint.platform.person.password.account.v1+json',contentType:'application/vnd.com.covisint.platform.person.password.account.v1+json'},
        {cmd: 'createRegistrationRequestNonceWithPkg',cmdType: 'nonce',call:'/registration/v1/registrations/persons/requests',type:'POST',accepts:'application/vnd.com.covisint.platform.person.request.v1+json',contentType:'application/vnd.com.covisint.platform.person.request.v1+json'},
        {cmd: 'approvePersonRegistrationRequest', call:'/registration/v1/person/requests/tasks/approve', type:'POST', accepts:'application/vnd.com.covisint.platform.person.request.v1+json'},
        {cmd: 'denyPersonRegistrationRequest', call:'/registration/v1/person/requests/tasks/deny', type:'POST', accepts:'application/vnd.com.covisint.platform.person.request.v1+json'},
        {cmd: 'validateRegistrationNonce',cmdType:'nonce',call: '/registration/v1/registrations/persons/registration/validate', type:'POST', accepts: 'text/plain'},
        //{cmd: 'getOrganizationNonce',cmdType:'nonce',call: '/registration/v1/registrations/organizations/{id}', type:'GET', accepts: 'application/vnd.com.covisint.platform.organization.v1+json'},
        {cmd: 'getPasswordPolicyNonce',cmdType:'nonce',call: '/registration/v1/registrations/passwords/policies/{id}', type:'GET', accepts: 'application/vnd.com.covisint.platform.password.policy.v1+json'},
        {cmd: 'getAttributeTemplatesNonce',cmdType:'nonce',call: '/registration/v1/registrations/attributeTemplates', type:'GET', accepts: 'application/vnd.com.covisint.platform.attribute.template.v1+json'},
        {cmd: "getOrganizationPackagesSecured","cmdType": "secured","call": "/service/v3/organizations/{organizationId}/packages","type": "GET","accepts": "application/vnd.com.covisint.platform.package.grant.v1+json"},
        {cmd: "validatePasswordSecured",call: "/person/v3/persons/password/validate",type: "POST",accepts: "application/vnd.com.covisint.platform.password.validation.response.v1+json","contentType": "application/vnd.com.covisint.platform.password.validation.v1+json"},
        {cmd: "getPackageRequestsCount",call: "/service/v3/requests/count",type: "GET",accepts: "text/plain"},
        {cmd: "getOrganizationPackagesCount",call: "/service/v3/organizations/{organizationId}/packages/count",type: "GET",accepts: "text/plain"},
        {cmd: "getRegistrationRequestsCount",call: "/registration/v1/person/requests/count",type: "GET",accepts: "text/plain"},
        {cmd: "getPackagesRequestedCount",call: "/service/v3/persons/{personId}/packages/count",type: "GET",accepts: "text/plain"},
        {cmd: 'validatePasswordNonce',cmdType:'nonce',call: '/registration/v1/registrations/persons/password/validate', type:'POST', accepts: 'application/vnd.com.covisint.platform.password.validation.response.v1+json',contentType:'application/vnd.com.covisint.platform.password.validation.v1+json'}


    ];

    return calls

})
