angular.module('organization')
.controller('orgDetailsCtrl', function(API, Loader, $scope, $stateParams,APIError,APIHelpers,$timeout,$q,$state) {

    const orgDetails = this
    const loaderName = 'orgDetails.'
    orgDetails.prevState={
        params:{
            orgId:$stateParams.orgId
        },
        name:"organization.directory.userList"
    }
    orgDetails.mobileHandler = 'profile'
    orgDetails.profileUsersSwitch = 'profile'
    orgDetails.appsHierarchySwitch = 'apps'

    orgDetails.dropDown={
        suspend:false,
        unsuspend:false,
        remove:false
    }
    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(loaderName + 'orgInfo')
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
        Loader.offFor(loaderName + 'userInfo')
        $scope.$digest()
    })*/


    const apiPromises = [
        API.cui.getOrganization({ organizationId: $stateParams.orgId  })
    ]

    $q.all(apiPromises)
    .then(([organization]) => {
        // CuiMobileNavFactory.setTitle(user.name.given + '.' + user.name.surname)
        orgDetails.organization = Object.assign({}, organization);
        Loader.offFor(loaderName + 'orgInfo')
    })
    .catch(() => {
        Loader.offFor(loaderName + 'orgInfo')
        APIError.onFor('orgDetails.org')
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------------- ON CLICK START ---------------------------------------------- */

    orgDetails.toggleDropDown= (type) => {
        Object.keys(orgDetails.dropDown).forEach(key => {
            if (key===type) {
                orgDetails.dropDown[key]=!orgDetails.dropDown[key]
            }else{
                orgDetails.dropDown[key]=false
            }
        })
    }
    orgDetails.suspendOrg = () => {
        Loader.onFor(loaderName + 'suspend')
        APIError.offFor(loaderName + 'suspend')
        API.cui.suspendOrg({qs:[['reason',orgDetails.suspendReason],['organizationId',$stateParams.orgId]]})
        .then(res => {
            orgDetails.organization.status="suspended"
            orgDetails.suspendOrgSuccess=true
            Loader.offFor(loaderName + 'suspend')
            $scope.$digest()
            $timeout(() => {
                orgDetails.dropDown.suspend=false
                orgDetails.suspendOrgSuccess=false
            },2000)
        })
        .fail(err => {
            APIError.onFor(loaderName + 'suspend')
            Loader.offFor(loaderName + 'suspend')
            $scope.$digest()
            console.log('There was an error suspending the organization', + err)
        })
    }

    orgDetails.unsuspendOrg = () => {
        Loader.onFor(loaderName + 'unsuspend')
        APIError.offFor(loaderName + 'unsuspend')
        API.cui.unsuspendOrg({qs:[['reason',orgDetails.unsuspendReason],['organizationId',$stateParams.orgId]]})
        .then(res => {
            orgDetails.organization.status="active"
            orgDetails.unsuspendOrgSuccess=true
            Loader.offFor(loaderName + 'unsuspend')
            $scope.$digest()
            $timeout(() => {
                orgDetails.dropDown.unsuspend=false
                orgDetails.unsuspendOrgSuccess=false
            },2000)
        })
        .fail(err => {
            APIError.onFor(loaderName + 'unsuspend')
            Loader.offFor(loaderName + 'unsuspend')
            $scope.$digest()
            console.log('There was an error suspending user App', + err)
        })
    }

    orgDetails.removeOrg = () => {
        Loader.onFor(loaderName + 'remove')
        APIError.offFor(loaderName + 'remove')
        API.cui.removeOrg({qs:[['reason',orgDetails.suspendReason],['organizationId',$stateParams.orgId]]})
        .then(res => {
            // orgDetails.app.grant.status="removeed"
            orgDetails.removeOrgSuccess=true
            Loader.offFor(loaderName + 'remove')
            $scope.$digest()
            $timeout(() => {
                orgDetails.removeOrgSuccess=false
                $state.go('organization.hierarchy',{orgId:API.user.organization.id})
            },2000)
        })
        .fail(err => {
            APIError.onFor(loaderName + 'remove')
            Loader.offFor(loaderName + 'remove')
            $scope.$digest()
            console.log('There was an error removing the organization', + err)
        })
    }

    /* --------------------------------------------- ON CLICK END ---------------------------------------------- */
})
