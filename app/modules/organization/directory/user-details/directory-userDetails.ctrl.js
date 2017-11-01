angular.module('organization')
.controller('userDetailsCtrl', function(API, Loader, $scope, $stateParams,APIError,APIHelpers,$timeout,$q) {

    const userDetails = this
    const scopeName = 'userDetails.'
    userDetails.prevState={
        params:{
            orgId:$stateParams.orgId
        },
        name:"organization.directory.userList"
    }
    userDetails.stateParamsOrgId=$stateParams.orgId
    userDetails.mobileHandler = 'profile'
    userDetails.profileRolesSwitch = 'profile'
    userDetails.appsHistorySwitch = 'apps'

    userDetails.dropDown={
        suspend:false,
        unsuspend:false,
        remove:false,
        specifyPassword:false,
        resetPassword:false
    }

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(scopeName + 'userInfo')

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
       userDetails.user = Object.assign({}, user)
        userDetails.organization = Object.assign({}, organization);
        userDetails.passwordAccount= Object.assign({}, password)
        return API.cui.getPasswordPolicy({ policyId: userDetails.organization.passwordPolicy.id })
    })
    .then(res => {
        userDetails.passwordPolicy = res

        res.rules.forEach(rule => {
            if (rule.type === 'history') {
                userDetails.numberOfPasswords = rule.numberOfPasswords
            }
        })
        Loader.offFor(scopeName + 'userInfo')
    })
    .catch(() => {
        Loader.offFor(scopeName + 'userInfo')
        APIError.onFor('userDetails.user')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------------- ON CLICK START ---------------------------------------------- */
    userDetails.toggleDropDown= (type) => {
        Object.keys(userDetails.dropDown).forEach(key => {
            if (key===type) {
                userDetails.dropDown[key]=!userDetails.dropDown[key]
            }else{
                userDetails.dropDown[key]=false
            }
        })
    }

    userDetails.suspend = (personId) => {

        const name = 'userDetails.suspend'

        userDetails.suspend.reset = () => {
            Loader.offFor(name)
            APIError.offFor(name)
            userDetails.user.suspendReason = ''
            userDetails.suspend.success && delete userDetails.suspend.success
        }

        userDetails.suspend.reset()

        userDetails.suspend.confirm = () => {
            Loader.onFor(name)
            APIError.offFor(name)

            const reason = encodeURIComponent(userDetails.user.suspendReason)

            API.cui.suspendPerson({
                qs: APIHelpers.getQs({
                    personId,
                    reason
                })
            })
            .then(
                res => {
                    APIError.offFor(name)
                    userDetails.suspend.success = true
                    userDetails.user.status = 'suspended'
                    $timeout(userDetails.suspend.cancel, 1500)
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

        userDetails.suspend.cancel = () => {
            userDetails.dropDown.suspend = false
            userDetails.suspend.reset()
        }
    }

    userDetails.unsuspend = (personId) => {

        const name = 'userDetails.unsuspend'

        userDetails.unsuspend.reset = () => {
            Loader.offFor(name)
            APIError.offFor(name)
            userDetails.user.unsuspendReason = ''
            userDetails.unsuspend.success && delete userDetails.unsuspend.success
        }

        userDetails.unsuspend.reset()

        userDetails.unsuspend.confirm = () => {
            Loader.onFor(name)
            APIError.offFor(name)

            const reason = encodeURIComponent(userDetails.user.unsuspendReason)

            API.cui.unsuspendPerson({
                qs: APIHelpers.getQs({
                    personId,
                    reason
                })
            })
            .then(
                res => {
                    APIError.offFor(name)
                    userDetails.unsuspend.success = true
                    userDetails.user.status = 'active'
                    $timeout(userDetails.unsuspend.cancel, 1500)
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

        userDetails.unsuspend.cancel = () => {
            userDetails.dropDown.unsuspend = false
            userDetails.unsuspend.reset()
        }
    }

    userDetails.remove =(personId) => {

        const name = 'userDetails.remove'

        userDetails.remove.reset = () => {
            Loader.offFor(name)
            APIError.offFor(name)
            userDetails.user.removeReason = ''
            userDetails.remove.success && delete userDetails.remove.success
        }

        userDetails.remove.reset()

        userDetails.remove.confirm = () => {
            Loader.onFor(name)
            APIError.offFor(name)

            const reason = encodeURIComponent(userDetails.user.removeReason)

            API.cui.removePerson({
                personId:personId,
                qs: APIHelpers.getQs({
                    reason
                })
            })
            .then(
                res => {
                    APIError.offFor(name)
                    userDetails.remove.success = true
                    $scope.$digest()
                    $timeout(()=>{
                $state.go('organization.directory',{orgId:API.user.organization.id})
            }, 1500)
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

        userDetails.remove.cancel = () => {
            userDetails.dropDown.remove = false
            userDetails.remove.reset()
        }        
    }

    userDetails.resetPassword = () => {
        const name = 'userDetails.resetPassword'

        Loader.onFor(name)
        APIError.offFor(name)
        API.cui.resetPersonPassword({
            qs: [['subject', $stateParams.userId]],
        })
        .then(
            res => {
                APIError.offFor(name)
                userDetails.resetPasswordValue=res
                userDetails.resetPassword.begun = true
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

    userDetails.specifyPassword = () => {
        errorTimer && $timeout.cancel(errorTimer) // cancel the timer if there's one pending
        let errorTimer

        const name = 'userDetails.specifyPassword'

        userDetails.specifyPassword.reset = () => {
            Loader.offFor(name)
            APIError.offFor(name)
            APIError.offFor('userDetails.passwordHistory')
            userDetails.specifyPassword.success && delete userDetails.specifyPassword.success
            userDetails.specifyPassword.passwordHistoryError = false
            userDetails.specifyPassword.newPassword = ''
            userDetails.specifyPassword.newPasswordConfirm = ''
        }

        userDetails.specifyPassword.validate = (password, formObject, input) => {
            const validSwitch = (input, isValidBoolean) => {
                switch (input) {
                    case 'newPassword':
                        userDetails.specifyPassword.validNewPassword = isValidBoolean
                    case 'newPasswordConfirm':
                        userDetails.specifyPassword.validNewPasswordRe = isValidBoolean
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

        userDetails.specifyPassword.confirm = () => {
            APIError.offFor(name)
            Loader.onFor(name)

          /*  if (!userDetails.specifyPassword.form.$valid) {
                angular.forEach(userDetails.specifyPassword.form.$error, error => {
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
                        password: userDetails.specifyPassword.newPassword
                    }
                })
            })
            .then(res => {
                return API.cui.expirePersonPassword({
                    qs: [['subject', $stateParams.userId]],
                    data: {
                        subject: $stateParams.userId,
                        password: userDetails.specifyPassword.newPassword,
                        passwordPolicyId: userDetails.passwordPolicy.id,
                        authenticationPolicyId: userDetails.organization.authenticationPolicy.id
                    }
                })
            })
            .then(res => {
                userDetails.specifyPassword.success = true
                $timeout(userDetails.specifyPassword.cancel, 1500)
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

        userDetails.specifyPassword.cancel = () => {
            userDetails.dropDown.specifyPassword = false
            userDetails.specifyPassword.reset()
        }
    }

    userDetails.unlockUser = () => {
        Loader.onFor('userDetails.unlockUser')
        APIError.offFor('userDetails.unlockUser')
        //Need to call two API's One is unlock Password Account and Update person stutus to active
        API.cui.unlockPersonPassword({qs:[['subject', $stateParams.userId]]})
        .then(res => {
            userDetails.user.stutus='active'
            API.cui.updatePerson({personId:$stateParams.userId, data:userDetails.user})
            .then(res => {
                userDetails.unlockUserSuccess=true
            })
            .fail(err => {
                APIError.onFor('userDetails.unlockUser')
                $timeout(() => {APIError.offFor('userDetails.unlockUser')},3000)
            })
            .always(() => {
                Loader.offFor('userDetails.unlockUser')
                $scope.$digest()
            })
        })
        .fail(err => {
            APIError.onFor('userDetails.unlockUser')
            $timeout(() => {APIError.offFor('userDetails.unlockUser')},3000)
        })
        .always(() => {
            Loader.offFor('userDetails.unlockUser')
            $scope.$digest()
        })
    }

    /* --------------------------------------------- ON CLICK END ---------------------------------------------- */
})
