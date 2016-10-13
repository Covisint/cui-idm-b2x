angular.module('organization')
.controller('orgDirectoryCtrl', function(API,APIError,$filter,APIHelpers,CommonAPI,CuiMobileNavFactory,DataStorage,Loader,User,UserList,$pagination,$q,$state,$stateParams) {

    const orgDirectory = this
    const scopeName = 'orgDirectory.'

    orgDirectory.sortBy = {}
    orgDirectory.page = parseInt($stateParams.page || 1)
    orgDirectory.pageSize = parseInt($stateParams.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions().intervals[0])
    orgDirectory.statusList = ['active', 'locked', 'pending', 'suspended', 'rejected', 'removed']

    /* ---------------------------------------- HELPER FUNCTIONS START ---------------------------------------- */

    const updateStateParams = ({ page, pageSize } = {}) => {
        if (page && pageSize) {
            orgDirectory.sortBy.page = page
            orgDirectory.sortBy.pageSize = pageSize
        }
        $state.transitionTo('organization.directory.userList', orgDirectory.sortBy, { notify: false })
    }

    const populateUsers = ({ page, pageSize, userList} = {}) => {
        orgDirectory.userList = _.drop(orgDirectory.unparsedUserList, (page -1) * pageSize).slice(0, pageSize)

        if (orgDirectory.sortBy.hasOwnProperty('sortBy')) {
            orgDirectory.sortingCallbacks[orgDirectory.sortBy.sortBy]()
        }
    }

    const invertSortingDirection = () => {
        if (orgDirectory.sortBy.sortType === 'asc') orgDirectory.sortBy.sortType = 'desc'
        else orgDirectory.sortBy.sortType = 'asc'
    }

    /* ----------------------------------------- HELPER FUNCTIONS END ----------------------------------------- */

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    const initDirectory = (organizationId) => {
        const _organizationId = organizationId || $stateParams.orgId || User.user.organization.id

        Loader.onFor(scopeName + 'userList')
        APIError.offFor(scopeName + 'userList')

        $q.all([
            CommonAPI.getOrganizationHierarchy(_organizationId),
            UserList.getUsers({qs: [
                ['organization.id', _organizationId]
            ]})
        ])
        .then(([orgHierarchy, users]) => {
            orgDirectory.organization = orgHierarchy
            CuiMobileNavFactory.setTitle($filter('cuiI18n')(orgHierarchy.name))
            orgDirectory.organizationList = APIHelpers.flattenOrgHierarchy(orgHierarchy)
            orgDirectory.unparsedUserList = orgDirectory.userList = users

            orgDirectory.cuiTableOptions = {
                paginate: true,
                recordCount: orgDirectory.userList.length,
                pageSize: orgDirectory.pageSize,
                initialPage: orgDirectory.page,
                onPageChange: (page, pageSize) => {
                    updateStateParams({ page, pageSize })
                    populateUsers({ page, pageSize })
                }
            }

            orgDirectory.cuiTableOptions.onPageChange(orgDirectory.page, orgDirectory.pageSize)
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

    orgDirectory.actionCallbacks = {
        sort (sortType) {
            if (!orgDirectory.sortBy.hasOwnProperty['sortType']) orgDirectory.sortBy['sortType'] = 'asc'
            if (orgDirectory.sortBy.sortBy === sortType) invertSortingDirection()
            orgDirectory.sortingCallbacks[sortType]()
        }
    }

    orgDirectory.sortingCallbacks = {
        name () {
            orgDirectory.sortBy.sortBy = 'name'
            updateStateParams()
            orgDirectory.sort(['name.given', 'name.surname'], orgDirectory.sortBy.sortType)
        },
        username () {
            orgDirectory.sortBy.sortBy = 'username'
            updateStateParams()
            orgDirectory.sort('username', orgDirectory.sortBy.sortType)
        },
        status () {
            orgDirectory.sortBy.sortBy = 'status'
            updateStateParams()
            orgDirectory.sort('status', orgDirectory.sortBy.sortType)
        }
    }

    orgDirectory.sort = (sortBy, order) => {
        orgDirectory.userList = _.orderBy(orgDirectory.userList, sortBy, order)
    }

    orgDirectory.parse = (status) => {
        if (status === 'all') {
            populateUsers({
                page: orgDirectory.page, 
                pageSize: orgDirectory.pageSize
            })
        }
        else {
            populateUsers(populateUsers({
                page: orgDirectory.page, 
                pageSize: orgDirectory.pageSize
            }))
            orgDirectory.userList = _.filter(orgDirectory.userList, (user) => {
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
        initDirectory(organization.id)
    }

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

})
