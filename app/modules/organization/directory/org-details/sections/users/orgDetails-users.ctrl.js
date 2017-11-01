angular.module('organization')
.controller('orgDetailsUsersCtrl', function(API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,UserList,$filter,$pagination,$q,$state,$stateParams) {
    
    const orgDetailsUsers = this
    const scopeName = 'orgDetailsUsers.'
    orgDetailsUsers.stateParamsOrgId=$stateParams.orgId
    orgDetailsUsers.search = {}
    orgDetailsUsers.sortBy = {}

    /* ---------------------------------------- HELPER FUNCTIONS START ---------------------------------------- */

    const switchBetween = (property, firstValue, secondValue) => {
        orgDetailsUsers.search[property] === firstValue
            ? orgDetailsUsers.search[property] = secondValue
            : orgDetailsUsers.search[property] = firstValue
    }

    const getUserListAppCount = (userList) => {
        userList.forEach(user => {
            API.cui.getPersonGrantedAppCount({personId: user.id})
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
        orgDetailsUsers.search['organization.id'] = organizationId || $stateParams.orgId || User.user.organization.id
        orgDetailsUsers.search.pageSize = orgDetailsUsers.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

        let apiCalls = [
            UserList.getUsers({ qs: APIHelpers.getQs(orgDetailsUsers.search) }),
            UserList.getUserCount({ qs: [['organization.id', orgDetailsUsers.search['organization.id']]] }),
            API.cui.getOrganization({organizationId: orgDetailsUsers.search['organization.id']})
        ]

        Loader.onFor(scopeName + 'userList')
        APIError.offFor(scopeName + 'userList')

        $q.all(apiCalls)
        .then(([users, userCount, organization]) => {
            orgDetailsUsers.organization = organization
            // orgDetailsUsers.organizationList = APIHelpers.flattenOrgHierarchy(orgHierarchy)
            orgDetailsUsers.userList = users
            orgDetailsUsers.userCount = userCount
            orgDetailsUsers.statusData = APIHelpers.getCollectionValuesAndCount(users, 'status', true)
            CuiMobileNavFactory.setTitle(organization.name)
            orgDetailsUsers.reRenderPagination && orgDetailsUsers.reRenderPagination()
            getUserListAppCount(orgDetailsUsers.userList)
        })
        .catch(error => {
            APIError.onFor(scopeName + 'userList')
        })
        .finally(() => {
            Loader.offFor(scopeName + 'userList')
        })
    }

    orgDetailsUsers.search = Object.assign({}, $stateParams)
    initDirectory()

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */


    // headers="['cui-name', 'username', 'status']" 

    orgDetailsUsers.sortingCallbacks = {
      name () {
          orgDetailsUsers.sortBy.sortBy = 'name'
          orgDetailsUsers.sort(['name.given', 'name.surname'], orgDetailsUsers.sortBy.sortType)
      },
      username () {
          orgDetailsUsers.sortBy.sortBy = 'username'
          orgDetailsUsers.sort('username', orgDetailsUsers.sortBy.sortType)
      },
      status () {
          orgDetailsUsers.sortBy.sortBy = 'status'
          orgDetailsUsers.sort('status', orgDetailsUsers.sortBy.sortType)
      }
    }

    orgDetailsUsers.sort = (sortBy, order) => {
        cui.log('sort', sortBy, order)

      orgDetailsUsers.userList = _.orderBy(orgDetailsUsers.userList, sortBy, order)
    }

    orgDetailsUsers.updateSearchParams = (page) => {
        if (page) orgDetailsUsers.search.page = page 
        $state.transitionTo('organization.directory.orgDetails', orgDetailsUsers.search, {notify: false})
        initDirectory(orgDetailsUsers.search['organization.id'])
    }

    orgDetailsUsers.updateSearchByName = (name) => {
        orgDetailsUsers.updateSearchParams()
    }
    orgDetailsUsers.actionCallbacks = {
        sort (sortType) {
            switch(sortType) {
            case 'name':
                switchBetween('sortBy', '+person.name', '-person.name')
                break
            case 'username':
                switchBetween('sortBy', '+person.username', '-person.username')
                break
            case 'status':
                switchBetween('sortBy', '+person.status', '-person.status')
                break
            }

            // if (!orgDetailsUsers.search.hasOwnProperty('sortBy')) orgDetailsUsers.search['sortBy'] = '+' + sortType
            // else if (orgDetailsUsers.search.sortBy.slice(1) !== sortType) orgDetailsUsers.search.sortBy = '+' + sortType
            // else switchBetween('sortBy', '+' + sortType, '-' + sortType)
            orgDetailsUsers.updateSearchParams()
        },
        refine (refineType) {
            if (refineType === 'all') delete orgDetailsUsers.search['status']
            else {
                if (!orgDetailsUsers.search.hasOwnProperty('status')) orgDetailsUsers.search['status'] = refineType
                else orgDetailsUsers.search.status = refineType
            }
            orgDetailsUsers.updateSearchParams()
        }
    }

    orgDetailsUsers.userClick = (clickedUser) => {
        const stateOpts = {
            userId: clickedUser.id,
            orgId: clickedUser.organization.id,
        }
        if (clickedUser.status === 'pending') $state.go('organization.requests.personRequest', stateOpts)
        else $state.go('organization.directory.userDetails', stateOpts)
    }

    orgDetailsUsers.getOrgMembers = (organization) => {
        CuiMobileNavFactory.setTitle($filter('cuiI18n')(organization.name))
        initDirectory(organization.id)
    }

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

});
