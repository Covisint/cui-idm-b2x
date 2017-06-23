angular.module('organization')
.controller('orgDirectoryCtrl', function(API,APIError,APIHelpers,CuiMobileNavFactory,Loader,User,UserList,$filter,$pagination,$q,$state,$stateParams) {
    
    const orgDirectory = this
    const scopeName = 'orgDirectory.'
    orgDirectory.stateParamsOrgId=$stateParams.orgId
    orgDirectory.search = {}
    orgDirectory.sortBy = {}

    /* ---------------------------------------- HELPER FUNCTIONS START ---------------------------------------- */

    const switchBetween = (property, firstValue, secondValue) => {
        orgDirectory.search[property] === firstValue
            ? orgDirectory.search[property] = secondValue
            : orgDirectory.search[property] = firstValue
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
        orgDirectory.search['organization.id'] = organizationId || $stateParams.orgId || User.user.organization.id
        orgDirectory.search.pageSize = orgDirectory.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

        let apiCalls = [
            UserList.getUsers({ qs: APIHelpers.getQs(orgDirectory.search) }),
            UserList.getUserCount({ qs: [['organization.id', orgDirectory.search['organization.id']]] }),
            API.cui.getOrganization({organizationId: orgDirectory.search['organization.id']})
        ]

        Loader.onFor(scopeName + 'userList')
        APIError.offFor(scopeName + 'userList')

        $q.all(apiCalls)
        .then(([users, userCount, organization]) => {
            orgDirectory.organization = organization
            // orgDirectory.organizationList = APIHelpers.flattenOrgHierarchy(orgHierarchy)
            orgDirectory.userList = users
            orgDirectory.userCount = userCount
            orgDirectory.statusData = APIHelpers.getCollectionValuesAndCount(users, 'status', true)
            CuiMobileNavFactory.setTitle(organization.name)
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

    orgDirectory.search = Object.assign({}, $stateParams)
    initDirectory()

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */


    // headers="['cui-name', 'username', 'status']" 

    orgDirectory.sortingCallbacks = {
      name () {
          orgDirectory.sortBy.sortBy = 'name'
          orgDirectory.sort(['name.given', 'name.surname'], orgDirectory.sortBy.sortType)
      },
      username () {
          orgDirectory.sortBy.sortBy = 'username'
          orgDirectory.sort('username', orgDirectory.sortBy.sortType)
      },
      status () {
          orgDirectory.sortBy.sortBy = 'status'
          orgDirectory.sort('status', orgDirectory.sortBy.sortType)
      }
    }

    orgDirectory.sort = (sortBy, order) => {
        cui.log('sort', sortBy, order)

      orgDirectory.userList = _.orderBy(orgDirectory.userList, sortBy, order)
    }

    orgDirectory.updateSearchParams = (page) => {
        if (page) orgDirectory.search.page = page 
        $state.transitionTo('organization.directory.userList', orgDirectory.search, {notify: false})
        initDirectory(orgDirectory.search['organization.id'])
    }

    orgDirectory.updateSearchByName = (name) => {
        orgDirectory.updateSearchParams()
    }
    orgDirectory.actionCallbacks = {
        sort (sortType) {
            switch(sortType) {
            case 'name':
                switchBetween('sortBy', '+name.given', '-name.given')
                break
            case 'username':
                switchBetween('sortBy', '+person.username', '-person.username')
                break
            case 'status':
                switchBetween('sortBy', '+person.status', '-person.status')
                break
            }

            // if (!orgDirectory.search.hasOwnProperty('sortBy')) orgDirectory.search['sortBy'] = '+' + sortType
            // else if (orgDirectory.search.sortBy.slice(1) !== sortType) orgDirectory.search.sortBy = '+' + sortType
            // else switchBetween('sortBy', '+' + sortType, '-' + sortType)
            orgDirectory.updateSearchParams()
        },
        refine (refineType) {
            if (refineType === 'all') delete orgDirectory.search['status']
            else {
                if (!orgDirectory.search.hasOwnProperty('status')) orgDirectory.search['status'] = refineType
                else orgDirectory.search.status = refineType
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
