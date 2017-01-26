angular.module('applications')
.controller('myApplicationDetailsCtrl', function(API, $scope, $stateParams, $state, $q, APIHelpers, Loader, APIError,DataStorage) {
    let myApplicationDetails = this
    myApplicationDetails.relatedApps=[]

    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    const getClaims = (app) => {
        const packageId = app.servicePackage.id

        Loader.onFor(loaderName + 'claims')
        API.cui.getPersonPackageClaims({ grantee:API.getUser(), useCuid:true, packageId })
        .then(res => {
            APIError.offFor(loaderName + 'claims')
            myApplicationDetails.claims = res
        })
        .fail(err => {
            APIError.onFor(loaderName + 'claims')
        })
        .always(() => {
            Loader.offFor(loaderName + 'claims')
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
            myApplicationDetails.app = Object.assign({}, res[0])
            if (!updating) {
            getClaims(myApplicationDetails.app)
            getRelatedApps(myApplicationDetails.app)
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
            myApplicationDetails.relatedApps=myApplicationDetails.relatedApps.concat(res[0])
            myApplicationDetails.relatedApps=myApplicationDetails.relatedApps.concat(res[1])
        })
        .catch(err => {
            APIError.onFor(loaderName + 'relatedApps')
        })
        .finally(()=>{
            Loader.offFor(loaderName + 'relatedApps')
        })
    }
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    const loaderName = 'myApplicationDetails.'

    const qs = {
        'service.id': $stateParams.appId
    }

    const opts = {
        personId: API.getUser(),
        useCuid:true,
        qs: APIHelpers.getQs(qs)
    }
    myApplicationDetails.app=DataStorage.getType('myAppDetail')
    if (myApplicationDetails.app&& myApplicationDetails.app.id===$stateParams.appId) {        
        getClaims(myApplicationDetails.app)
        getRelatedApps(myApplicationDetails.app)
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

    myApplicationDetails.goToDetails = (application) => {
        $state.go('applications.myApplicationDetails', {
            'packageId':application.packageId,
            'appId':application.id
        })
    }

    // ON CLICK FUNCTIONS END ------------------------------------------------------------------------

})
