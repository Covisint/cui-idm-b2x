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
    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    const getClaims = (app) => {
        const packageId = app.servicePackage.id

        Loader.onFor(loaderName + 'claims')
        API.cui.getPersonPackageClaims({ grantee:API.getUser(), useCuid:true, packageId })
        .then(res => {
            APIError.offFor(loaderName + 'claims')
            userAppDetails.claims = res
        })
        .fail(err => {
            APIError.onFor(loaderName + 'claims')
        })
        .always(() => {
            Loader.offFor(loaderName + 'claims')
            $scope.$digest()
        })
    }

    // Returns claims that are associated with a package id
    const getPackageClaims = (packageId) => {
        API.cui.getPackageClaims({qs: [['packageId', packageId]]})
        .then(packageClaims => {
            APIError.offFor(loaderName + 'packageClaims')
            userAppDetails.packageClaims = packageClaims
        })
        .fail(err => {
            console.error('Failed getting package claims')
            APIError.onFor(loaderName + 'packageClaims')
        })
        .always(() => {
            Loader.offFor(loaderName + 'packageClaims')
            $scope.$digest()
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
                getPackageClaims(userAppDetails.app.servicePackage.id)
                // getClaims(userAppDetails.app)
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
                const claimValues = Object.keys(claimsObject[claimId]).reduce((claims, claimValueId) => {
                    claims.push({ claimValueId })
                    return claims
                },[])

                packageClaims.push({
                    claimId,
                    claimValues
                })
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
                    packageClaims: buildPackageClaims(userAppDetails.packageClaims)
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
        personId: API.getUser(),
        useCuid:true,
        qs: APIHelpers.getQs(qs)
    }
    userAppDetails.app=DataStorage.getType('userAppDetail')
    if (userAppDetails.app&& userAppDetails.app.id===$stateParams.appId) {        
        // getClaims(userAppDetails.app)
        getPackageClaims(userAppDetails.app.servicePackage.id)
        getRelatedApps(userAppDetails.app)
        // Update application detail for any new changes during reload
        // Commenting out as API is not giving full details for service.id query parameter get
        //it is relying on previous page details which has full details
        // getApp(true)
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

    userAppDetails.suspendApp = () => {
        Loader.onFor(loaderName + 'suspend')
        let data=buildData('suspend')
        API.cui.suspendPersonApp({data:data})
        .then(res => {
            userAppDetails.suspendAppSuccess=true
            Loader.offFor(loaderName + 'suspend')
            $scope.$digest()
            $timeout(() => {
                userAppDetails.suspendExpanded=false
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
        let data=buildData('unsuspend')
        API.cui.unsuspendPersonApp({data:data})
        .then(res => {
            userAppDetails.unsuspendAppSuccess=true
            Loader.offFor(loaderName + 'unsuspend')
            $scope.$digest()
            $timeout(() => {
                userAppDetails.unsuspendExpanded=false
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
    }

    userAppDetails.modifyClaims = () => {
        Loader.onFor(loaderName + 'modifyClaims')
        API.cui.grantClaims(buildClaimData())
        .then(res => {
            userAppDetails.modifyClaimsSuccess=true
            Loader.offFor(loaderName + 'modifyClaims')
            $scope.$digest()
            $timeout(() => {
                userAppDetails.claimsExpanded=false
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
