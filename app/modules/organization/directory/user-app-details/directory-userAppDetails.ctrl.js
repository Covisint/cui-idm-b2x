angular.module('organization')
.controller('userAppDetailsCtrl', function(API, $scope, $stateParams, $state, $q, APIHelpers, Loader, APIError,DataStorage,$timeout) {
    let userAppDetails = this
    userAppDetails.relatedApps=[]
    userAppDetails.prevState={
        params:{
            userId:$stateParams.userId,
            orgId:$stateParams.orgId
        },
        name:"organization.directory.userDetails"
    }
    userAppDetails.dropDown={
        claims:false,
        suspend:false,
        unsuspend:false,
        remove:false
    }
    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    const getClaims = (app) => {
        let deferred=$q.defer()
        const packageId = app.servicePackage.id

        Loader.onFor(loaderName + 'claims')
        API.cui.getPersonPackageClaims({ grantee:$stateParams.userId, packageId })
        .then(userClaims => {
            APIError.offFor(loaderName + 'claims')
            deferred.resolve(userClaims)
        })
        .fail(err => {
            APIError.onFor(loaderName + 'claims')
            deferred.reject(err)
        })
        .always(() => {
            Loader.offFor(loaderName + 'claims')
            $scope.$digest()
        })
        return deferred.promise
    }

    // Returns claims that are associated with a package id
    const getPackageClaims = (packageId) => {
        let deferred=$q.defer()
        API.cui.getPackageClaims({qs: [['packageId', packageId]]})
        .then(packageClaims => {
            APIError.offFor(loaderName + 'packageClaims')
            deferred.resolve(packageClaims)
        })
        .fail(err => {
            console.error('Failed getting package claims')
            APIError.onFor(loaderName + 'packageClaims')
            deferred.reject(err)
        })
        .always(() => {
            Loader.offFor(loaderName + 'packageClaims')
            $scope.$digest()
        })
        return deferred.promise
    }

    const getFormattedClaimData = () => {
        $q.all([getClaims(userAppDetails.app),getPackageClaims(userAppDetails.app.servicePackage.id)])
        .then(res => {            
            userAppDetails.userClaims = res[0]
            userAppDetails.packageClaims=res[1]
            userAppDetails.claimSelection={}
            //initialize and preselect claims which are already granted to user
            userAppDetails.packageClaims.forEach(packageClaim => {
                userAppDetails.claimSelection[packageClaim.claimId] = {}
                let grantedClaim=_.find(userAppDetails.userClaims.packageClaims,{claimId:packageClaim.claimId})
                if (grantedClaim) {
                    packageClaim.claimValues.forEach(claimValue => {
                        if (_.find(grantedClaim.claimValues,{claimValueId:claimValue.claimValueId})) {
                            userAppDetails.claimSelection[packageClaim.claimId][claimValue.claimValueId]=true
                        }
                    })
                }
            })
        })
    }

    const getApp= (updating)=>{
        if (!updating) {
            Loader.onFor(loaderName + 'app')
        }
        API.cui.getPersonGrantedApps(opts)
        .then(res => {
            APIError.offFor(loaderName + 'app')
            userAppDetails.app = Object.assign({}, res[0])
            if (!updating) {
                getFormattedClaimData()
                getRelatedApps(userAppDetails.app)
            }
        })
        .fail(err => {
            APIError.onFor(loaderName + 'app')
        })
        .done(() => {
            Loader.offFor(loaderName + 'app')
            $scope.$digest()
        })
    }
    const getRelatedApps=(app) => {
        const packageId = app.servicePackage.id
        let qs
        if (app.servicePackage.parent) {
            qs=[['servicePackage.id',app.servicePackage.parent.id]]
        }else{
            qs=[['servicePackage.parentPackage.id',app.servicePackage.id]]
        }
        Loader.onFor(loaderName + 'relatedApps')
        let apiPromises=[
        API.cui.getPersonRequestableApps({personId:API.getUser(),'qs':[['servicePackage.parentPackage.id',packageId]] }),
        API.cui.getPersonGrantedApps({personId:API.getUser(),'qs':qs })
        ]
        $q.all(apiPromises)
        .then(res=>{
            APIError.offFor(loaderName + 'relatedApps')
            userAppDetails.relatedApps=userAppDetails.relatedApps.concat(res[0])
            userAppDetails.relatedApps=userAppDetails.relatedApps.concat(res[1])
        })
        .catch(err => {
            APIError.onFor(loaderName + 'relatedApps')
        })
        .finally(()=>{
            Loader.offFor(loaderName + 'relatedApps')
        })
    }

    const buildData = (type) => {
        let reason
        if (type=="suspend") {
            reason=userAppDetails.suspendReason
        }else{
            reason=userAppDetails.unsuspendReason
        }
        return {
            grantee:{
                id:$stateParams.userId,
                type:'person'
            },
            servicePackage:{
                id:userAppDetails.app.servicePackage.id
            },
            justification:reason
        }

    }

    const buildClaimData = () => {

        const buildPackageClaims = (claimsObject) => {
            if (Object.keys(claimsObject).length === 0) {
                return undefined;
            } // if there's no claims in this claim object
            let packageClaims = []
            Object.keys(claimsObject).forEach(claimId => {
                if (Object.keys(claimsObject[claimId]).length === 0) {
                    return;
                } // if no claimValues selected for that claimId
                let claimValues =[]
                Object.keys(claimsObject[claimId]).forEach(claimValueId => {
                    if (claimsObject[claimId][claimValueId]) {//If checked
                        claimValues.push({claimValueId:claimValueId})
                    }
                })
                // const claimValues = Object.keys(claimsObject[claimId]).reduce((claims, claimValueId) => {
                //     claims.push({ claimValueId })
                //     return claims
                // },[])
                if (claimValues.length!==0) {
                    packageClaims.push({
                        claimId,
                        claimValues
                    })
                }
            })
            return packageClaims
        }
        return {
                data: {
                    grantee: {
                        id: $stateParams.userId,
                        type: 'person'
                    },
                    servicePackage: {
                        id: userAppDetails.app.servicePackage.id,
                        type: 'servicePackage'
                    },
                    packageClaims: buildPackageClaims(userAppDetails.claimSelection)
                }
            }
    }
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    const loaderName = 'userAppDetails.'

    const qs = {
        'service.id': $stateParams.appId
    }

    const opts = {
        personId: $stateParams.userId,
        qs: APIHelpers.getQs(qs)
    }
    userAppDetails.app=DataStorage.getType('userAppDetail')
    if (userAppDetails.app&& userAppDetails.app.id===$stateParams.appId) {        
        getFormattedClaimData()
        getRelatedApps(userAppDetails.app)
        // Update application detail for any new changes during reload
        // Commenting out as API is not giving full details for service.id query parameter get
        //it is relying on previous page details which has full details
         getApp(true)
    }
    else{
        getApp(false)
    }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START ----------------------------------------------------------------------

    userAppDetails.goToDetails = (application) => {
        $state.go('applications.userAppDetails', {
            'packageId':application.packageId,
            'appId':application.id
        })
    }

    userAppDetails.toggleDropDown= (type) => {
        Object.keys(userAppDetails.dropDown).forEach(key => {
            if (key===type) {
                userAppDetails.dropDown[key]=!userAppDetails.dropDown[key]
            }else{
                userAppDetails.dropDown[key]=false
            }
        })
    }
    userAppDetails.suspendApp = () => {
        Loader.onFor(loaderName + 'suspend')
        APIError.offFor(loaderName + 'suspend')
        let data=buildData('suspend')
        API.cui.suspendPersonApp({data:data})
        .then(res => {
            userAppDetails.app.grant.status="suspended"
            userAppDetails.suspendAppSuccess=true
            Loader.offFor(loaderName + 'suspend')
            $scope.$digest()
            $timeout(() => {
                userAppDetails.dropDown.suspend=false
                userAppDetails.suspendAppSuccess=false
            },2000)
        })
        .fail(err => {
            APIError.onFor(loaderName + 'suspend')
            Loader.offFor(loaderName + 'suspend')
            $scope.$digest()
            console.log('There was an error suspending user App', + err)
        })
    }

    userAppDetails.unsuspendApp = () => {
        Loader.onFor(loaderName + 'unsuspend')
        APIError.offFor(loaderName + 'unsuspend')
        let data=buildData('unsuspend')
        API.cui.unsuspendPersonApp({data:data})
        .then(res => {
            userAppDetails.app.grant.status="active"
            userAppDetails.unsuspendAppSuccess=true
            Loader.offFor(loaderName + 'unsuspend')
            $scope.$digest()
            $timeout(() => {
                userAppDetails.dropDown.unsuspend=false
                userAppDetails.unsuspendAppSuccess=false
            },2000)
        })
        .fail(err => {
            APIError.onFor(loaderName + 'unsuspend')
            Loader.offFor(loaderName + 'unsuspend')
            $scope.$digest()
            console.log('There was an error suspending user App', + err)
        })
    }

    userAppDetails.removeApp = () => {
        Loader.onFor(loaderName + 'remove')
        APIError.offFor(loaderName + 'remove')
        API.cui.revokePersonApp({personId:$stateParams.userId,packageId:userAppDetails.app.servicePackage.id})
        .then(res => {
            // userAppDetails.app.grant.status="removeed"
            userAppDetails.removeAppSuccess=true
            Loader.offFor(loaderName + 'remove')
            $scope.$digest()
            $timeout(() => {
                userAppDetails.removeAppSuccess=false
                $state.go('organization.directory.userDetails',userAppDetails.prevState.params)
            },2000)
        })
        .fail(err => {
            APIError.onFor(loaderName + 'remove')
            Loader.offFor(loaderName + 'remove')
            $scope.$digest()
            $timeout(() => {
                APIError.offFor(loaderName + 'remove')
            },3000)
            console.log('There was an error removing user App', + err)
        })
    }

    userAppDetails.modifyClaims = () => {
        Loader.onFor(loaderName + 'modifyClaims')
        APIError.offFor(loaderName + 'modifyClaims')
        API.cui.grantClaims(buildClaimData())
        .then(res => {
            userAppDetails.modifyClaimsSuccess=true
            Loader.offFor(loaderName + 'modifyClaims')
            $scope.$digest()
            $timeout(() => {
                userAppDetails.dropDown.claims=false
                userAppDetails.modifyClaimsSuccess=false
            },2000)
        })
        .fail(err => {
            APIError.onFor(loaderName + 'modifyClaims')
            Loader.offFor(loaderName + 'modifyClaims')
            $scope.$digest()
            console.log('There was an error updating user\'s app claims', + err)
        })
        
    }
    // ON CLICK FUNCTIONS END ------------------------------------------------------------------------

})
