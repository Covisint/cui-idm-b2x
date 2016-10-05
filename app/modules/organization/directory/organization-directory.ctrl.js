angular.module('organization')
.controller('orgDirectoryCtrl', function(API,CommonAPI,CuiMobileNavFactory,DataStorage,Loader,User,UserList,$pagination,$q,Sort,$state,$stateParams) {

    const orgDirectory = this
    const scopeName = 'orgDirectory.'

    orgDirectory.sortBy = {}
    orgDirectory.page = parseInt($stateParams.page || 1)
    orgDirectory.pageSize = parseInt($stateParams.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions[0])
    orgDirectory.sortFlag = true

    // TODO REFACTOR!!!
    // - test evertyhing
    // - see what else makes sense to export into factorie(s)
    // - sorts/refines/etc from API or local??

    /* ---------------------------------------- HELPER FUNCTIONS START ---------------------------------------- */
    /* ----------------------------------------- HELPER FUNCTIONS END ----------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    const loadOrgDirectory = (organizationId) => {
        const _organizationId = organizationId || $stateParams.orgId || User.user.organization.id

        Loader.onFor(scopeName + 'userList')
        APIError.offFor(scopeName + 'userList')

        $q.all([
            CommonAPI.getOrganizationHierarchy(_organizationId),
            UserList.getUsers({qs: [
                ['organization.id', organizationId],
                ['page', orgDirectory.page],
                ['pageSize', orgDirectory.pageSize]
            ]}),
            UserList.getUserCount({qs: [['organization.id', _organizationId]]})
        ])
        .done((orgHierarchy, users, userCount) => {
            orgDirectory.organization = orgHierarchy
            orgDirectory.organizationList = APIHelpers.flattenOrgHierarchy(orgHierarchy)
            orgDirectory.unparsedUserList = orgDirectory.userList = users
            orgDirectory.orgPersonCount = userCount
        })
        .catch(error => {
            APIError.onFor(scopeName + 'userList')
        })
        .always(() => {
            Loader.offFor(scopeName + 'userList')
        })
    }

    loadOrgDirectory()

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgDirectory.sort = (sortType) => {
        Sort.listSort(orgDirectory.userList, sortType, orgDirectory.sortFlag)
        orgDirectory.sortFlag =! orgDirectory.sortFlag
    }

    orgDirectory.parseUsersByStatus = (status) => {
        if (status === 'all') orgDirectory.userList = orgDirectory.unparsedUserList
        else {
            orgDirectory.userList = _.filter(orgDirectory.unparsedUserList, (user) => {
                return user.status === status
            })
        }
    }

    orgDirectory.userClick = (clickedUser) => {
        const stateOpts = {
            userId: clickedUser.id,
            orgId: clickedUser.organization.id,
        }

        if (clickedUser.status === 'pending') $state.go('organization.requests.personRequest', stateOpts)
        else $state.go('organization.directory.userDetails', stateOpts)
    }

    orgDirectory.getOrgMembers = (organization) => {
        CuiMobileNavFactory.setTitle($filter('cuiI18n')(organization.name))
        loadOrgDirectory(organization.id)
    }

    orgDirectory.pageChange = (newpage) => {
        userDirectory.page = newPage
        loadOrgDirectory()
    }

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

})

//     orgDirectory.statusList = ['active', 'locked', 'pending', 'suspended', 'rejected', 'removed']

//     // HELPER FUNCTIONS START ------------------------------------------------------------------------


//     const getUserListAppCount = (userArray) => {
//         let userList = userArray

//         userList.forEach((user) => {
//             API.cui.getPersonGrantedCount({personId: user.id})
//             .then((res) => {
//                 user.appCount = res
//             })
//             .fail((error) => {
//                 user.appCount = 0
//             })
//         })

//         return userList
//     }

//     // HELPER FUNCTIONS END --------------------------------------------------------------------------

//     // WATCHERS START --------------------------------------------------------------------------------

//     $scope.$watch('orgDirectory.paginationPageSize', function(newValue, oldValue) {
//         if (newValue && oldValue && newValue !== oldValue) {
//             API.cui.getPersons({'qs': [['organization.id', String(orgDirectory.organization.id)],
//                                 ['pageSize', String(orgDirectory.paginationPageSize)], ['page', 1]]})
//             .then(function(res) {
//                 orgDirectory.userList = orgDirectory.unparsedUserList = getUserListAppCount(res)
//                 orgDirectory.paginationCurrentPage = 1
//                 orgDirectory.statusList = getStatusList(orgDirectory.userList)
//             })
//             .fail(handleError)
//         }
//     })

//     // WATCHERS END ----------------------------------------------------------------------------------

// })
