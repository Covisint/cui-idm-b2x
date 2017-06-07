angular.module('organization')
.controller('orgDetailsCtrl', function(API, Loader, $scope, $stateParams,APIError,APIHelpers,$timeout,$q) {

    const orgDetails = this
    const scopeName = 'orgDetails.'
    orgDetails.prevState={
        params:{
            orgId:$stateParams.orgId
        },
        name:"organization.directory.userList"
    }
    orgDetails.mobileHandler = 'profile'
    orgDetails.profileRolesSwitch = 'profile'
    orgDetails.appsHistorySwitch = 'apps'

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(scopeName + 'userInfo')
/*
    API.cui.getPerson({ personId: $stateParams.userId })
    .then(res => {
        orgDetails.user = res
        CuiMobileNavFactory.setTitle(res.name.given + '.' + res.name.surname)
    })
    .fail(error => {
        console.error('Failed getting user information')
    })
    .always(() => {
        Loader.offFor(scopeName + 'userInfo')
        $scope.$digest()
    })*/


    const apiPromises = [
        API.cui.getPerson({
            personId: $stateParams.userId
        }),
        API.cui.getOrganization({ organizationId: $stateParams.orgId  }),
        API.cui.getPersonPassword({
            personId: $stateParams.userId
        })
    ]

    $q.all(apiPromises)
    .then(([ user, organization ,password]) => {
        // CuiMobileNavFactory.setTitle(user.name.given + '.' + user.name.surname)
       orgDetails.user = Object.assign({}, user)
        orgDetails.organization = Object.assign({}, organization);
        orgDetails.passwordAccount= Object.assign({}, password)
        return API.cui.getPasswordPolicy({ policyId: orgDetails.organization.passwordPolicy.id })
    })
    .then(res => {
        orgDetails.passwordPolicy = res

        res.rules.forEach(rule => {
            if (rule.type === 'history') {
                orgDetails.numberOfPasswords = rule.numberOfPasswords
            }
        })
        Loader.offFor(scopeName + 'userInfo')
    })
    .catch(() => {
        Loader.offFor(scopeName + 'userInfo')
        APIError.onFor('orgDetails.user')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------------- ON CLICK START ---------------------------------------------- */
    orgDetails.suspend = (personId) => {

        orgDetails.suspend.begun = (orgDetails.suspend.begun)? false:true
        orgDetails.unsuspend.begun = (orgDetails.unsuspend.begun)? false:false
        orgDetails.specifyPassword.begun = (orgDetails.specifyPassword.begun)? false:false
        orgDetails.resetPassword.begun = (orgDetails.resetPassword.begun)? false:false

        const name = 'orgDetails.suspend'

        orgDetails.suspend.reset = () => {
            Loader.offFor(name)
            APIError.offFor(name)
            orgDetails.user.suspendReason = ''
            orgDetails.suspend.success && delete orgDetails.suspend.success
        }

        orgDetails.suspend.reset()

        orgDetails.suspend.confirm = () => {
            Loader.onFor(name)
            APIError.offFor(name)

            const reason = encodeURIComponent(orgDetails.user.suspendReason)

            API.cui.suspendPerson({
                qs: APIHelpers.getQs({
                    personId,
                    reason
                })
            })
            .then(
                res => {
                    APIError.offFor(name)
                    orgDetails.suspend.success = true
                    orgDetails.user.status = 'suspended'
                    $timeout(orgDetails.suspend.cancel, 1500)
                },
                err => {
                    APIError.onFor(name)
                }
            )
            .always(() => {
                Loader.offFor(name)
                $scope.$digest()
            })
        }

        orgDetails.suspend.cancel = () => {
            orgDetails.suspend.begun = false
            orgDetails.suspend.reset()
        }
    }

    orgDetails.unsuspend = (personId) => {
        orgDetails.unsuspend.begun = (orgDetails.unsuspend.begun)? false:true
        orgDetails.suspend.begun = (orgDetails.suspend.begun)? false:false
        orgDetails.specifyPassword.begun = (orgDetails.specifyPassword.begun)? false:false
        orgDetails.resetPassword.begun = (orgDetails.resetPassword.begun)? false:false

        const name = 'orgDetails.unsuspend'

        orgDetails.unsuspend.reset = () => {
            Loader.offFor(name)
            APIError.offFor(name)
            orgDetails.user.unsuspendReason = ''
            orgDetails.unsuspend.success && delete orgDetails.unsuspend.success
        }

        orgDetails.unsuspend.reset()

        orgDetails.unsuspend.confirm = () => {
            Loader.onFor(name)
            APIError.offFor(name)

            const reason = encodeURIComponent(orgDetails.user.unsuspendReason)

            API.cui.unsuspendPerson({
                qs: APIHelpers.getQs({
                    personId,
                    reason
                })
            })
            .then(
                res => {
                    APIError.offFor(name)
                    orgDetails.unsuspend.success = true
                    orgDetails.user.status = 'active'
                    $timeout(orgDetails.unsuspend.cancel, 1500)
                },
                err => {
                    APIError.onFor(name)
                }
            )
            .always(() => {
                Loader.offFor(name)
                $scope.$digest()
            })
        }

        orgDetails.unsuspend.cancel = () => {
            orgDetails.unsuspend.begun = false
            orgDetails.unsuspend.reset()
        }
    }

    orgDetails.resetPassword = () => {
        orgDetails.unsuspend.begun = (orgDetails.unsuspend.begun)? false:false
        orgDetails.suspend.begun = (orgDetails.suspend.begun)? false:false
        orgDetails.specifyPassword.begun = (orgDetails.specifyPassword.begun)? false:false
        orgDetails.resetPassword.begun = (orgDetails.resetPassword.begun)? false:true

            
            if(orgDetails.resetPassword.begun){
                const name = 'orgDetails.unsuspend'

            Loader.onFor(name)
            APIError.offFor(name)
            API.cui.resetPersonPassword({
                qs: [['subject', $stateParams.userId]],
            })
            .then(
                res => {
                    APIError.offFor(name)
                    orgDetails.resetPasswordValue=res
                    orgDetails.resetPassword.begun = true
                },
                err => {
                    APIError.onFor(name)
                }
            )
            .always(() => {
                Loader.offFor(name)
                $scope.$digest()
            })
        }
       
    }

    orgDetails.specifyPassword = () => {
        errorTimer && $timeout.cancel(errorTimer) // cancel the timer if there's one pending
        let errorTimer

        const name = 'orgDetails.specifyPassword'
        orgDetails.specifyPassword.begun = (orgDetails.specifyPassword.begun)? false:true
        orgDetails.suspend.begun = (orgDetails.suspend.begun)? false:false
        orgDetails.unsuspend.begun = (orgDetails.unsuspend.begun)? false:false
        orgDetails.resetPassword.begun = (orgDetails.resetPassword.begun)? false:false

        orgDetails.specifyPassword.reset = () => {
            Loader.offFor(name)
            APIError.offFor(name)
            APIError.offFor('orgDetails.passwordHistory')
            orgDetails.specifyPassword.success && delete orgDetails.specifyPassword.success
            orgDetails.specifyPassword.passwordHistoryError = false
            orgDetails.specifyPassword.newPassword = ''
            orgDetails.specifyPassword.newPasswordConfirm = ''
        }

        orgDetails.specifyPassword.validate = (password, formObject, input) => {
            const validSwitch = (input, isValidBoolean) => {
                switch (input) {
                    case 'newPassword':
                        orgDetails.specifyPassword.validNewPassword = isValidBoolean
                    case 'newPasswordConfirm':
                        orgDetails.specifyPassword.validNewPasswordRe = isValidBoolean
                }
            }

            const validateData = {
                userId: $stateParams.userId,
                organizationId: $stateParams.orgId,
                password: password,
                operations: ['PASSWORD_SPECIFY']
            }

            API.cui.validatePassword({data: validateData})
            .then(res => {
                let validPasswordHistory = false

                res.forEach(rule => {
                    if (rule.type === 'HISTORY' && rule.isPassed) {
                        validPasswordHistory = true
                        return
                    }
                })

                if (validPasswordHistory) {
                    validSwitch(input, true)
                    formObject[input].$setValidity(input, true)
                    $scope.$digest()
                }
                else {
                    validSwitch(input, false)
                    formObject[input].$setValidity(input, false)
                    $scope.$digest()
                }
            })
            .fail(err => {
                validSwitch(input, false)
                formObject[input].$setValidity(input, false)
                $scope.$digest()
            })
        }

        orgDetails.specifyPassword.confirm = () => {
            APIError.offFor(name)
            Loader.onFor(name)

          /*  if (!orgDetails.specifyPassword.form.$valid) {
                angular.forEach(orgDetails.specifyPassword.form.$error, error => {
                    angular.forEach(error, errorField => errorField.$setTouched())
                })
                APIError.onFor(name)
                return
            }*/

            API.cui.getPersonPassword({personId: $stateParams.userId})
            .then(res => {
                return API.cui.specifyPersonPassword({
                    data: {
                        subject: $stateParams.userId,
                        password: orgDetails.specifyPassword.newPassword
                    }
                })
            })
            .then(res => {
                return API.cui.expirePersonPassword({
                    qs: [['subject', $stateParams.userId]],
                    data: {
                        subject: $stateParams.userId,
                        password: orgDetails.specifyPassword.newPassword,
                        passwordPolicyId: orgDetails.passwordPolicy.id,
                        authenticationPolicyId: orgDetails.organization.authenticationPolicy.id
                    }
                })
            })
            .then(res => {
                orgDetails.specifyPassword.success = true
                $timeout(orgDetails.specifyPassword.cancel, 1500)
            }, err => {
                console.log(err)
                APIError.onFor(name)
                errorTimer = $timeout(() => APIError.offFor(name), 1500)
            })
            .always(() => {
                Loader.offFor(name)
                $scope.$digest()
            })
        }

        orgDetails.specifyPassword.cancel = () => {
            orgDetails.specifyPassword.begun = false
            orgDetails.specifyPassword.reset()
        }
    }

    orgDetails.unlockUser = () => {
        Loader.onFor('orgDetails.unlockUser')
        APIError.offFor('orgDetails.unlockUser')
        //Need to call two API's One is unlock Password Account and Update person stutus to active
        API.cui.unlockPersonPassword({qs:[['subject', $stateParams.userId]]})
        .then(res => {
            orgDetails.user.stutus='active'
            API.cui.updatePerson({personId:$stateParams.userId, data:orgDetails.user})
            .then(res => {
                orgDetails.unlockUserSuccess=true
            })
            .fail(err => {
                APIError.onFor('orgDetails.unlockUser')
                $timeout(() => {APIError.offFor('orgDetails.unlockUser')},3000)
            })
            .always(() => {
                Loader.offFor('orgDetails.unlockUser')
                $scope.$digest()
            })
        })
        .fail(err => {
            APIError.onFor('orgDetails.unlockUser')
            $timeout(() => {APIError.offFor('orgDetails.unlockUser')},3000)
        })
        .always(() => {
            Loader.offFor('orgDetails.unlockUser')
            $scope.$digest()
        })
    }

    /* --------------------------------------------- ON CLICK END ---------------------------------------------- */
})
