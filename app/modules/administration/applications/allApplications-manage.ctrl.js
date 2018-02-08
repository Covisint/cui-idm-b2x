angular.module('administration')
.controller('manageAllApplicationsCtrl', function(){
	const manageAllApplications=this


manageAllApplications.doneReloading=true;
manageAllApplications.viewList=[
    {
        "id":"1249163784",
        "version":"1502276112000",
        "creator":"[Q-QA1-Q-ADN]Q-QA1-Q-ADN_ADMIN",
        "creation":1502276112000,
        "realm":"Q-QA1-Q-ADN",
        "name":[
            {
                "lang":"en",
                "text":"AManual-pkg1_Service"
            }
        ],
        "description":[
            {
                "lang":"en",
                "text":""
            }
        ],
        "category":[
            {
                "lang":"en",
                "text":"Roles"
            }
        ],
        "urls":[
            {
                "type":"default",
                "value":"https://www.google.com"
            }
        ],
        "owningOrganization":{
            "id":"OQ-QA1-Q-ADN279702",
            "type":"organization"
        },
        "remoteAppId":"333111",
        "iconUrl":"https://q-qa1-q-adn.identity.qa.covapp.io/ImageServlet?iconId=0",
        "protected":false,
        "messagingEnabled":true,
        "categoryId":1250892984,
        "servicePackage":{
            "id":"PQ-QA1-Q-ADN1249165984",
            "version":"1502276111000",
            "creator":"[Q-QA1-Q-ADN]Q-QA1-Q-ADN_ADMIN",
            "creation":1502276111000,
            "realm":"Q-QA1-Q-ADN",
            "name":[
                {
                    "lang":"en",
                    "text":"AManual-pkg1"
                }
            ],
            "category":[
                {
                    "lang":"en",
                    "text":"Roles"
                }
            ],
            "parentService":{
                "id":"1249163784",
                "type":"service"
            },
            "owningOrganization":{
                "id":"OQ-QA1-Q-ADN279702",
                "type":"organization"
            },
            "requiredApprovals":[
                "organizationAdmin",
                "applicationAdmin"
            ],
            "protected":false,
            "requestable":true,
            "grantable":true,
            "displayable":true,
            "requestReasonRequired":true,
            "fastRegEnabled":false,
            "personTacEnabled":false,
            "organizationTacEnabled":false
        },
        "relatedApps":[
            {
                "id":"3150784384",
                "packageId":"PQ-QA1-Q-ADN3150786584",
                "name":[
                    {
                        "lang":"en",
                        "text":"AManual-pkg1_Sub_Service"
                    }
                ]
            }
        ]
    },
    {
        "id":"1299220384",
        "version":"1495093236000",
        "creator":"UNKNOWN",
        "creation":1495093236000,
        "realm":"Q-QA1-Q-ADN",
        "name":[
            {
                "lang":"en",
                "text":"AUTO-SERVPK-875299"
            }
        ],
        "description":[
            {
                "lang":"en",
                "text":"Package - Test API"
            }
        ],
        "category":[
            {
                "lang":"en",
                "text":"Administration"
            }
        ],
        "owningOrganization":{
            "id":"OQ-QA1-Q-ADN279702",
            "type":"organization"
        },
        "iconUrl":"https://q-qa1-q-adn.identity.qa.covapp.io/ImageServlet?iconId=0",
        "protected":false,
        "messagingEnabled":false,
        "categoryId":1250888584,
        "servicePackage":{
            "id":"PQ-QA1-Q-ADN1299213784",
            "version":"1495093236000",
            "creation":1495093236000,
            "realm":"Q-QA1-Q-ADN",
            "name":[
                {
                    "lang":"en",
                    "text":"AUTO-SERVPK-875299"
                }
            ],
            "description":[
                {
                    "lang":"en",
                    "text":"Package - Test API"
                }
            ],
            "termsAndConditions":[
                {
                    "type":"organization",
                    "tacId":"15"
                }
            ],
            "category":[
                {
                    "lang":"en",
                    "text":"Administration"
                }
            ],
            "parentService":{
                "id":"0",
                "type":"service"
            },
            "owningOrganization":{
                "id":"OQ-QA1-Q-ADN279702",
                "type":"organization"
            },
            "requiredApprovals":[
                "organizationAdmin"
            ],
            "protected":true,
            "requestable":true,
            "grantable":true,
            "displayable":true,
            "requestReasonRequired":true,
            "fastRegEnabled":false,
            "personTacEnabled":false,
            "organizationTacEnabled":false
        }
    },
    {
        "id":"1300676784",
        "version":"1504098461000",
        "creator":"[Q-QA1-Q-ADN]Q-QA1-Q-ADN_ADMIN",
        "creation":1504098461000,
        "realm":"Q-QA1-Q-ADN",
        "name":[
            {
                "lang":"en",
                "text":"AUTO-SERVPK-476099"
            }
        ],
        "description":[
            {
                "lang":"en",
                "text":"Package - Test API"
            }
        ],
        "category":[
            {
                "lang":"en",
                "text":"Administration"
            }
        ],
        "urls":[
            {
                "type":"default",
                "value":"https://www.yahoo.co.in"
            }
        ],
        "owningOrganization":{
            "id":"OQ-QA1-Q-ADN279702",
            "type":"organization"
        },
        "remoteAppId":"null",
        "iconUrl":"https://q-qa1-q-adn.identity.qa.covapp.io/ImageServlet?iconId=0",
        "protected":false,
        "messagingEnabled":false,
        "categoryId":1250888584,
        "servicePackage":{
            "id":"PQ-QA1-Q-ADN1300670184",
            "version":"1504098460000",
            "creator":"[Q-QA1-Q-ADN]Q-QA1-Q-ADN_ADMIN",
            "creation":1504098460000,
            "realm":"Q-QA1-Q-ADN",
            "name":[
                {
                    "lang":"en",
                    "text":"AUTO-SERVPK-476099"
                }
            ],
            "description":[
                {
                    "lang":"en",
                    "text":"Package - Test API"
                }
            ],
            "termsAndConditions":[
                {
                    "type":"organization",
                    "tacId":"15"
                }
            ],
            "category":[
                {
                    "lang":"en",
                    "text":"Administration"
                }
            ],
            "parentService":{
                "id":"0",
                "type":"service"
            },
            "owningOrganization":{
                "id":"OQ-QA1-Q-ADN279702",
                "type":"organization"
            },
            "requiredApprovals":[
                "organizationAdmin"
            ],
            "protected":true,
            "requestable":true,
            "grantable":true,
            "displayable":false,
            "requestReasonRequired":true,
            "fastRegEnabled":false,
            "personTacEnabled":false,
            "organizationTacEnabled":false
        }
    },
    {
        "id":"1300698784",
        "version":"1495098249000",
        "creator":"UNKNOWN",
        "creation":1495098249000,
        "realm":"Q-QA1-Q-ADN",
        "name":[
            {
                "lang":"en",
                "text":"AUTO-SERVPK-132899"
            }
        ],
        "description":[
            {
                "lang":"en",
                "text":"Package - Test API"
            }
        ],
        "category":[
            {
                "lang":"en",
                "text":"Administration"
            }
        ],
        "owningOrganization":{
            "id":"OQ-QA1-Q-ADN279702",
            "type":"organization"
        },
        "iconUrl":"https://q-qa1-q-adn.identity.qa.covapp.io/ImageServlet?iconId=0",
        "protected":false,
        "messagingEnabled":false,
        "categoryId":1250888584,
        "servicePackage":{
            "id":"PQ-QA1-Q-ADN1300692184",
            "version":"1495098249000",
            "creation":1495098249000,
            "realm":"Q-QA1-Q-ADN",
            "name":[
                {
                    "lang":"en",
                    "text":"AUTO-SERVPK-132899"
                }
            ],
            "description":[
                {
                    "lang":"en",
                    "text":"Package - Test API"
                }
            ],
            "termsAndConditions":[
                {
                    "type":"organization",
                    "tacId":"15"
                }
            ],
            "category":[
                {
                    "lang":"en",
                    "text":"Administration"
                }
            ],
            "parentService":{
                "id":"0",
                "type":"service"
            },
            "owningOrganization":{
                "id":"OQ-QA1-Q-ADN279702",
                "type":"organization"
            },
            "requiredApprovals":[
                "organizationAdmin"
            ],
            "protected":true,
            "requestable":true,
            "grantable":true,
            "displayable":true,
            "requestReasonRequired":true,
            "fastRegEnabled":false,
            "personTacEnabled":false,
            "organizationTacEnabled":false
        }
    },
    {
        "id":"1301602984",
        "version":"1495099052000",
        "creator":"UNKNOWN",
        "creation":1495099052000,
        "realm":"Q-QA1-Q-ADN",
        "name":[
            {
                "lang":"en",
                "text":"AUTO-SERVPK-266699"
            }
        ],
        "description":[
            {
                "lang":"en",
                "text":"Package - Test API"
            }
        ],
        "category":[
            {
                "lang":"en",
                "text":"Administration"
            }
        ],
        "owningOrganization":{
            "id":"OQ-QA1-Q-ADN279702",
            "type":"organization"
        },
        "iconUrl":"https://q-qa1-q-adn.identity.qa.covapp.io/ImageServlet?iconId=0",
        "protected":false,
        "messagingEnabled":false,
        "categoryId":1250888584,
        "servicePackage":{
            "id":"PQ-QA1-Q-ADN1301596384",
            "version":"1495099052000",
            "creation":1495099052000,
            "realm":"Q-QA1-Q-ADN",
            "name":[
                {
                    "lang":"en",
                    "text":"AUTO-SERVPK-266699"
                }
            ],
            "description":[
                {
                    "lang":"en",
                    "text":"Package - Test API"
                }
            ],
            "termsAndConditions":[
                {
                    "type":"organization",
                    "tacId":"15"
                }
            ],
            "category":[
                {
                    "lang":"en",
                    "text":"Administration"
                }
            ],
            "parentService":{
                "id":"0",
                "type":"service"
            },
            "owningOrganization":{
                "id":"OQ-QA1-Q-ADN279702",
                "type":"organization"
            },
            "requiredApprovals":[
                "organizationAdmin"
            ],
            "protected":true,
            "requestable":true,
            "grantable":true,
            "displayable":true,
            "requestReasonRequired":true,
            "fastRegEnabled":false,
            "personTacEnabled":false,
            "organizationTacEnabled":false
        },
        "bundledApps":[
            {
                "id":"1301651384",
                "packageId":"PQ-QA1-Q-ADN1301596384",
                "name":[
                    {
                        "lang":"en",
                        "text":"Service _ Test API"
                    }
                ]
            }
        ]
    },
    {
        "id":"1301624984",
        "version":"1495099061000",
        "creator":"UNKNOWN",
        "creation":1495099061000,
        "realm":"Q-QA1-Q-ADN",
        "name":[
            {
                "lang":"en",
                "text":"AUTO-SERVPK-817899"
            }
        ],
        "description":[
            {
                "lang":"en",
                "text":"Package - Test API"
            }
        ],
        "category":[
            {
                "lang":"en",
                "text":"Administration"
            }
        ],
        "owningOrganization":{
            "id":"OQ-QA1-Q-ADN279702",
            "type":"organization"
        },
        "iconUrl":"https://q-qa1-q-adn.identity.qa.covapp.io/ImageServlet?iconId=0",
        "protected":false,
        "messagingEnabled":false,
        "categoryId":1250888584,
        "servicePackage":{
            "id":"PQ-QA1-Q-ADN1301618384",
            "version":"1495099061000",
            "creation":1495099061000,
            "realm":"Q-QA1-Q-ADN",
            "name":[
                {
                    "lang":"en",
                    "text":"AUTO-SERVPK-817899"
                }
            ],
            "description":[
                {
                    "lang":"en",
                    "text":"Package - Test API"
                }
            ],
            "termsAndConditions":[
                {
                    "type":"organization",
                    "tacId":"15"
                }
            ],
            "category":[
                {
                    "lang":"en",
                    "text":"Administration"
                }
            ],
            "parentService":{
                "id":"0",
                "type":"service"
            },
            "owningOrganization":{
                "id":"OQ-QA1-Q-ADN279702",
                "type":"organization"
            },
            "requiredApprovals":[
                "organizationAdmin"
            ],
            "protected":true,
            "requestable":true,
            "grantable":true,
            "displayable":true,
            "requestReasonRequired":true,
            "fastRegEnabled":false,
            "personTacEnabled":false,
            "organizationTacEnabled":false
        }
    },
    {
        "id":"1301646984",
        "version":"1495099070000",
        "creator":"UNKNOWN",
        "creation":1495099070000,
        "realm":"Q-QA1-Q-ADN",
        "name":[
            {
                "lang":"en",
                "text":"AUTO-SERVPK-216299"
            }
        ],
        "description":[
            {
                "lang":"en",
                "text":"Package - Test API"
            }
        ],
        "category":[
            {
                "lang":"en",
                "text":"Administration"
            }
        ],
        "owningOrganization":{
            "id":"OQ-QA1-Q-ADN279702",
            "type":"organization"
        },
        "iconUrl":"https://q-qa1-q-adn.identity.qa.covapp.io/ImageServlet?iconId=0",
        "protected":false,
        "messagingEnabled":false,
        "categoryId":1250888584,
        "servicePackage":{
            "id":"PQ-QA1-Q-ADN1301640384",
            "version":"1495099070000",
            "creation":1495099070000,
            "realm":"Q-QA1-Q-ADN",
            "name":[
                {
                    "lang":"en",
                    "text":"AUTO-SERVPK-216299"
                }
            ],
            "description":[
                {
                    "lang":"en",
                    "text":"Package - Test API"
                }
            ],
            "termsAndConditions":[
                {
                    "type":"organization",
                    "tacId":"15"
                }
            ],
            "category":[
                {
                    "lang":"en",
                    "text":"Administration"
                }
            ],
            "parentService":{
                "id":"0",
                "type":"service"
            },
            "owningOrganization":{
                "id":"OQ-QA1-Q-ADN279702",
                "type":"organization"
            },
            "requiredApprovals":[
                "organizationAdmin"
            ],
            "protected":true,
            "requestable":true,
            "grantable":true,
            "displayable":true,
            "requestReasonRequired":true,
            "fastRegEnabled":false,
            "personTacEnabled":false,
            "organizationTacEnabled":false
        }
    },
    {
        "id":"1301651384",
        "version":"1495099075000",
        "creator":"UNKNOWN",
        "creation":1495099075000,
        "realm":"Q-QA1-Q-ADN",
        "name":[
            {
                "lang":"en",
                "text":"Service _ Test API"
            }
        ],
        "description":[
            {
                "lang":"en",
                "text":"Service _ Test API"
            }
        ],
        "category":[
            {
                "lang":"en",
                "text":"Administration"
            }
        ],
        "urls":[
            {
                "type":"default",
                "value":"https://www.google.com"
            }
        ],
        "owningOrganization":{
            "id":"OQ-QA1-Q-ADN279702",
            "type":"organization"
        },
        "iconUrl":"https://q-qa1-q-adn.identity.qa.covapp.io/ImageServlet?iconId=0",
        "protected":false,
        "messagingEnabled":false,
        "categoryId":1250888584,
        "servicePackage":{
            "id":"PQ-QA1-Q-ADN1301596384",
            "version":"1495099052000",
            "creation":1495099052000,
            "realm":"Q-QA1-Q-ADN",
            "name":[
                {
                    "lang":"en",
                    "text":"AUTO-SERVPK-266699"
                }
            ],
            "description":[
                {
                    "lang":"en",
                    "text":"Package - Test API"
                }
            ],
            "termsAndConditions":[
                {
                    "type":"organization",
                    "tacId":"15"
                }
            ],
            "category":[
                {
                    "lang":"en",
                    "text":"Administration"
                }
            ],
            "parentService":{
                "id":"0",
                "type":"service"
            },
            "owningOrganization":{
                "id":"OQ-QA1-Q-ADN279702",
                "type":"organization"
            },
            "requiredApprovals":[
                "organizationAdmin"
            ],
            "protected":true,
            "requestable":true,
            "grantable":true,
            "displayable":true,
            "requestReasonRequired":true,
            "fastRegEnabled":false,
            "personTacEnabled":false,
            "organizationTacEnabled":false
        },
        "bundledApps":[
            {
                "id":"1301602984",
                "packageId":"PQ-QA1-Q-ADN1301596384",
                "name":[
                    {
                        "lang":"en",
                        "text":"AUTO-SERVPK-266699"
                    }
                ]
            }
        ]
    },
    {
        "id":"1302104584",
        "version":"1495100361000",
        "creator":"UNKNOWN",
        "creation":1495100361000,
        "realm":"Q-QA1-Q-ADN",
        "name":[
            {
                "lang":"en",
                "text":"AUTO-SERVPK-922299"
            }
        ],
        "description":[
            {
                "lang":"en",
                "text":"Package - Test API"
            }
        ],
        "category":[
            {
                "lang":"en",
                "text":"Administration"
            }
        ],
        "owningOrganization":{
            "id":"OQ-QA1-Q-ADN279702",
            "type":"organization"
        },
        "iconUrl":"https://q-qa1-q-adn.identity.qa.covapp.io/ImageServlet?iconId=0",
        "protected":false,
        "messagingEnabled":false,
        "categoryId":1250888584,
        "servicePackage":{
            "id":"PQ-QA1-Q-ADN1302097984",
            "version":"1495100361000",
            "creation":1495100361000,
            "realm":"Q-QA1-Q-ADN",
            "name":[
                {
                    "lang":"en",
                    "text":"AUTO-SERVPK-922299"
                }
            ],
            "description":[
                {
                    "lang":"en",
                    "text":"Package - Test API"
                }
            ],
            "termsAndConditions":[
                {
                    "type":"organization",
                    "tacId":"15"
                }
            ],
            "category":[
                {
                    "lang":"en",
                    "text":"Administration"
                }
            ],
            "parentService":{
                "id":"0",
                "type":"service"
            },
            "owningOrganization":{
                "id":"OQ-QA1-Q-ADN279702",
                "type":"organization"
            },
            "requiredApprovals":[
                "organizationAdmin"
            ],
            "protected":true,
            "requestable":true,
            "grantable":true,
            "displayable":true,
            "requestReasonRequired":true,
            "fastRegEnabled":false,
            "personTacEnabled":false,
            "organizationTacEnabled":false
        }
    },
    {
        "id":"1302126584",
        "version":"1495100371000",
        "creator":"UNKNOWN",
        "creation":1495100371000,
        "realm":"Q-QA1-Q-ADN",
        "name":[
            {
                "lang":"en",
                "text":"AUTO-SERVPK-836499"
            }
        ],
        "description":[
            {
                "lang":"en",
                "text":"Package - Test API"
            }
        ],
        "category":[
            {
                "lang":"en",
                "text":"Administration"
            }
        ],
        "owningOrganization":{
            "id":"OQ-QA1-Q-ADN279702",
            "type":"organization"
        },
        "iconUrl":"https://q-qa1-q-adn.identity.qa.covapp.io/ImageServlet?iconId=0",
        "protected":false,
        "messagingEnabled":false,
        "categoryId":1250888584,
        "servicePackage":{
            "id":"PQ-QA1-Q-ADN1302119984",
            "version":"1495100371000",
            "creation":1495100371000,
            "realm":"Q-QA1-Q-ADN",
            "name":[
                {
                    "lang":"en",
                    "text":"AUTO-SERVPK-836499"
                }
            ],
            "description":[
                {
                    "lang":"en",
                    "text":"Package - Test API"
                }
            ],
            "termsAndConditions":[
                {
                    "type":"organization",
                    "tacId":"15"
                }
            ],
            "category":[
                {
                    "lang":"en",
                    "text":"Administration"
                }
            ],
            "parentService":{
                "id":"0",
                "type":"service"
            },
            "owningOrganization":{
                "id":"OQ-QA1-Q-ADN279702",
                "type":"organization"
            },
            "requiredApprovals":[
                "organizationAdmin"
            ],
            "protected":true,
            "requestable":true,
            "grantable":true,
            "displayable":true,
            "requestReasonRequired":true,
            "fastRegEnabled":false,
            "personTacEnabled":false,
            "organizationTacEnabled":false
        }
    }
]
})