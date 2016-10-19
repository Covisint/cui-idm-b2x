angular.module('organization')
.controller('orgDirectoryCtrl', function(API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,UserList,$filter,$pagination,$q,$state,$stateParams) {
    
    const orgDirectory = this
    const scopeName = 'orgDirectory.'

    orgDirectory.search = {}

    /* ---------------------------------------- HELPER FUNCTIONS START ---------------------------------------- */

    const switchBetween = (property, firstValue, secondValue) => {
        orgDirectory.search[property] === firstValue
            ? orgDirectory.search[property] = secondValue
            : orgDirectory.search[property] = firstValue
    }

    const getUserListAppCount = (userList) => {
        userList.forEach(user => {
            API.cui.getPersonGrantedCount({personId: user.id})
            .then(res => {
                user.appCount = res
            })
            .fail(error => {
                user.appCount = '...'
            })
        })
    }

    /* ----------------------------------------- HELPER FUNCTIONS END ----------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    const initDirectory = (organizationId) => {
        orgDirectory.search['organization.id'] = organizationId || $stateParams.orgId || User.user.organization.id
        orgDirectory.search.pageSize = orgDirectory.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

        let apiCalls = [
            UserList.getUsers({ qs: APIHelpers.getQs(orgDirectory.search) }),
            UserList.getUserCount({ qs: [['organization.id', orgDirectory.search['organization.id']]] }),
            API.cui.getOrganizationHierarchy({organizationId: orgDirectory.search['organization.id']})
        ]

        Loader.onFor(scopeName + 'userList')
        APIError.offFor(scopeName + 'userList')

        $q.all(apiCalls)
        .then(([users, userCount, orgHierarchy]) => {
            orgDirectory.organization = orgHierarchy
            orgDirectory.organizationList = APIHelpers.flattenOrgHierarchy(orgHierarchy)
            orgDirectory.userList = users
            orgDirectory.userCount = userCount
            orgDirectory.statusData = APIHelpers.getCollectionValuesAndCount(users, 'status', true)
            CuiMobileNavFactory.setTitle($filter('cuiI18n')(orgHierarchy.name))
            orgDirectory.reRenderPagination && orgDirectory.reRenderPagination()
            getUserListAppCount(orgDirectory.userList)
        })
        .catch(error => {
            APIError.onFor(scopeName + 'userList')
        })
        .finally(() => {
            Loader.offFor(scopeName + 'userList')
        })
    }

    initDirectory()

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgDirectory.updateSearchParams = (page) => {
        if (page) orgDirectory.search.page = page
        $state.transitionTo('organization.directory.userList', orgDirectory.search, {notify: false})
        initDirectory(orgDirectory.search['organization.id'])
    }

    orgDirectory.actionCallbacks = {
        sort (sortType) {
            if (!orgDirectory.search.hasOwnProperty('sortBy')) orgDirectory.search['sortBy'] = '+' + sortType
            else if (orgDirectory.search.sortBy.slice(1) !== sortType) orgDirectory.search.sortBy = '+' + sortType
            else switchBetween('sortBy', '+' + sortType, '-' + sortType)
            orgDirectory.updateSearchParams()
        },
        refine (refineType) {
            if (refineType === 'all') delete orgDirectory.search['refine']
            else {
                if (!orgDirectory.search.hasOwnProperty('refine')) orgDirectory.search['refine'] = refineType
                else orgDirectory.search.refine = refineType
            }
            orgDirectory.updateSearchParams()
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
        initDirectory(organization.id)
    }

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

})
