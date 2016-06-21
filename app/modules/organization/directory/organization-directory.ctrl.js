angular.module('organization')
.controller('orgDirectoryCtrl',function($scope,$stateParams,API,$filter,Sort,$state,$q,User,$pagination) {
    'use strict';

    const orgDirectory = this;

    orgDirectory.loading = true;
    orgDirectory.sortFlag = false;
    orgDirectory.userList = [];
    orgDirectory.unparsedUserList = [];
    orgDirectory.statusList = ['active', 'locked', 'pending', 'suspended', 'rejected', 'removed'];
    orgDirectory.statusCount = [0,0,0,0,0,0,0];
    orgDirectory.paginationPageSize = orgDirectory.paginationPageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const handleError = function handleError(err) {
        orgDirectory.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    const getStatusList = function(users) {
        let statusList = [];
        let statusCount = [orgDirectory.unparsedUserList.length];

        users.forEach(function(user) {
            if (user.status) {
                let statusInStatusList = _.some(statusList, function(status, i) {
                    if (angular.equals(status, user.status)) {
                        statusCount[i+1] ? statusCount[i+1]++ : statusCount[i+1] = 1;
                        return true;
                    }
                    return false;
                });

                if (!statusInStatusList) {
                    statusList.push(user.status);
                    statusCount[statusList.length] = 1;
                }
            }
        });
        orgDirectory.statusCount = statusCount;
        return statusList;
    };

    const flattenHierarchy = (orgChildrenArray) => {
        if (orgChildrenArray) {
            let childrenArray = orgChildrenArray;
            let orgList = [];

            childrenArray.forEach(function(childOrg) {
                if (childOrg.children) {
                    let newChildArray = childOrg.children;
                    delete childOrg['children'];
                    orgList.push(childOrg);
                    orgList.push(flattenHierarchy(newChildArray));
                }
                else {
                    orgList.push(childOrg);
                }
            });
            return _.flatten(orgList);
        }
    };

    const getUserListAppCount = (userArray) => {
        let userList = userArray;

        userList.forEach((user) => {
            API.cui.getPersonGrantedCount({personId: user.id})
            .then((res) => {
                user.appCount = res;
            })
            .fail((error) => {
                user.appCount = 0;
            });
        });

        return userList;
    };

    const getPeopleAndCount = () => {
        const getPersonOptions = {
            'qs': [
                ['organization.id', String(orgDirectory.organization.id)],
                ['pageSize', String(orgDirectory.paginationPageSize)],
                ['page', String(1)]
            ]
        };

        const countPersonOptions = {
            'qs': ['organization.id', String(orgDirectory.organization.id)]
        };

        $q.all([API.cui.getPersons(getPersonOptions), API.cui.countPersons(countPersonOptions)])
        .then((res) => {
            orgDirectory.unparsedUserList = angular.copy(res[0]);
            orgDirectory.statusList = getStatusList(orgDirectory.userList);
            orgDirectory.orgPersonCount = res[1];
            orgDirectory.userList = orgDirectory.unparsedUserList = getUserListAppCount(orgDirectory.unparsedUserList);
            orgDirectory.loading = false;
            orgDirectory.reRenderPagination && orgDirectory.reRenderPagination();
        });
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    API.cui.getOrganizationHierarchy({organizationId: User.user.organization.id})
    .then((res) => {
        orgDirectory.organization = res;
        orgDirectory.organizationList = flattenHierarchy(res.children);
        getPeopleAndCount();
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    orgDirectory.getOrgMembers = (organization) => {
        orgDirectory.loading = true;
        orgDirectory.organization = organization;
        API.cui.getPersons({'qs': [['organization.id', String(orgDirectory.organization.id)]]})
        .then(function(res) {
            orgDirectory.userList = orgDirectory.unparsedUserList = getUserListAppCount(res);
            orgDirectory.statusList = getStatusList(orgDirectory.userList);
            return API.cui.countPersons({'qs': ['organization.id', String(orgDirectory.organization.id)]});
        })
        .then(function(res) {
            orgDirectory.orgPersonCount = res;
            orgDirectory.loading = false;
            $scope.$digest();
        })
        .fail(handleError);
    };

    orgDirectory.sort = function sort(sortType) {
        Sort.listSort(orgDirectory.userList, sortType, orgDirectory.sortFlag);
        orgDirectory.sortFlag =! orgDirectory.sortFlag;
    };

    orgDirectory.parseUsersByStatus = function parseUsersByStatus(status) {
        if (status === 'all') {
            orgDirectory.userList = orgDirectory.unparsedUserList;
        }
        else {
            let filteredUsers = _.filter(orgDirectory.unparsedUserList, function(user) {
                return user.status === status;
            });
            orgDirectory.userList = filteredUsers;
        }
    };

    orgDirectory.paginationHandler = function paginationHandler(page) {
        API.cui.getPersons({'qs': [['organization.id', String(orgDirectory.organization.id)],
                                    ['pageSize', String(orgDirectory.paginationPageSize)], ['page', String(page)]]})
        .then(function(res) {
            orgDirectory.userList = orgDirectory.unparsedUserList = getUserListAppCount(res);
            orgDirectory.statusList = getStatusList(orgDirectory.userList);
        })
        .fail(handleError);
    };

    orgDirectory.userClick = (clickedUser) => {
        switch (clickedUser.status) {
            case 'active':
            case 'unactivated':
            case 'inactive':
                $state.go('organization.directory.userDetails', {userID: clickedUser.id, orgID: clickedUser.organization.id});
                break;
            case 'pending':
                $state.go('organization.requests.personRequest', {userID: clickedUser.id, orgID: clickedUser.organization.id});
                break;
        }
    };

    // ON CLICK END ----------------------------------------------------------------------------------

    // WATCHERS START --------------------------------------------------------------------------------

    $scope.$watch('orgDirectory.paginationPageSize', function(newValue, oldValue) {
        if (newValue && oldValue && newValue !== oldValue) {
            API.cui.getPersons({'qs': [['organization.id', String(orgDirectory.organization.id)],
                                ['pageSize', String(orgDirectory.paginationPageSize)], ['page', 1]]})
            .then(function(res) {
                orgDirectory.userList = orgDirectory.unparsedUserList = getUserListAppCount(res);
                orgDirectory.paginationCurrentPage = 1;
                orgDirectory.statusList = getStatusList(orgDirectory.userList);
            })
            .fail(handleError);
        }
    });

    // WATCHERS END ----------------------------------------------------------------------------------

});
