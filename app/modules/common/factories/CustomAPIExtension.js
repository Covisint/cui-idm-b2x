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
        }
    ];

    return calls

})
