angular.module('organization')
.controller('newOrgGrantClaimsCtrl', function(API,APIHelpers,DataStorage,Loader,NewGrant,$stateParams,$q,$scope,$state,$timeout) {
    
    const newOrgGrantClaims = this
    const loaderType = 'newOrgGrantClaims.'
    newOrgGrantClaims.prevStateParams={
        orgId:$stateParams.orgId
    }
    newOrgGrantClaims.packageRequests = {}

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    NewGrant.pullFromStorage(newOrgGrantClaims,$stateParams.orgId,'organization');
    if (newOrgGrantClaims.numberOfRequests===0) {
        $state.go('organization.requests.newOrgGrantSearch',{orgId:$stateParams.orgId})
    }
    // get the claims for each app being requested
    Object.keys(newOrgGrantClaims.appsBeingRequested).forEach((appId, i) => {
        const app = newOrgGrantClaims.appsBeingRequested[appId]

        if (!newOrgGrantClaims.packageRequests[app.servicePackage.id]) {
            newOrgGrantClaims.packageRequests[app.servicePackage.id] = {
                claims: {},
                administratorRights: false
            }
        }

        Loader.onFor(loaderType + 'claims' + i)

        // const opts = {
        //     qs: APIHelpers.getQs({
        //         packageId: newOrgGrantClaims.appsBeingRequested[appId].servicePackage.id
        //     })
        // }

        // API.cui.getPackageClaims(opts)
        // .then(res => {
        //     newOrgGrantClaims['claims' + i] = Object.assign({}, res)
        //     res.forEach(claim => {
        //         newOrgGrantClaims.packageRequests[app.servicePackage.id].claims[claim.claimId] = {}
        //     })
        //     Loader.offFor(loaderType + 'claims' + i)
        //     $scope.$digest()
        // })
        // .fail(err => { 
        //     // claims endpoint throws an error when the package has no claims
        //     newOrgGrantClaims['claims' + i] = []
        //     Loader.offFor(loaderType + 'claims' + i)
        //     $scope.$digest()
        // })
    })

    Loader.onFor(loaderType + 'org')
    API.cui.getOrganization({ organizationId: $stateParams.orgId })
    .then(res => {
        newOrgGrantClaims.org = Object.assign({}, res)
        Loader.offFor(loaderType + 'org')
        $scope.$digest()
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    newOrgGrantClaims.submit = () => {
        Loader.onFor(loaderType + 'submit')
        newOrgGrantClaims.success = false;
        let claimsPromises=[]
        // Grant Packages
        $q.all(NewGrant.packageGrants($stateParams.orgId ,'organization', newOrgGrantClaims.packageRequests).map(opts => API.cui.grantOrganizationPackage(opts)))
        // .then(res => {
        //     // grant claims
        //     let claimsData=NewGrant.claimGrants($stateParams.orgId ,'organization', newOrgGrantClaims.packageRequests)
        //     claimsData.forEach(claimData => {
        //         if(claimData.data.packageClaims&&claimData.data.packageClaims.length!==0){
        //             claimsPromises.push(API.cui.grantClaims(claimData))
        //         }
        //     })
        //     return $q.all(claimsPromises)
        // })
        .then(res => {
            Loader.offFor(loaderType + 'submit')
            newOrgGrantClaims.success = true
            DataStorage.setType('newOrgGrant',{})
            $timeout(() => {
                $state.go('organization.applications',{orgId:newOrgGrantClaims.prevStateParams.orgId});
            }, 3000);
        })
        .catch(err => {
            Loader.offFor(loaderType + 'submit')
            newOrgGrantClaims.error = true
        })
    }

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

})
