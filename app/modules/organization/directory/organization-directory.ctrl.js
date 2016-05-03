angular.module('organization')
.controller('orgDirectoryCtrl', ['$scope','$stateParams','API','$filter','Sort',
function($scope,$stateParams,API,$filter,Sort) {
    'use strict';

    const orgDirectory = this;
    let organizationId = $stateParams.id;

    orgDirectory.organization = {};
    orgDirectory.loading = true;
    orgDirectory.sortFlag = false;
    orgDirectory.userList = [];
    orgDirectory.unparsedUserList = [];
    orgDirectory.statusList = ['active', 'locked', 'pending', 'suspended', 'rejected', 'removed'];
    orgDirectory.statusCount = [0,0,0,0,0,0,0];

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

    const flattenHierarchy = function flattenHierarchy(orgChildrenArray) {
        let childrenArray = orgChildrenArray;
        let orgList = [];

        childrenArray.forEach(function(childOrg) {
            if (childOrg.children) {
                let newchildArray = childOrg.children;
                delete childOrg.children;
                orgList.push(childOrg);
                flattenHierarchy(childrenArray);
            }
            else {
                orgList.push(childOrg);
            }
        });

        return orgList;
    };

    const onLoadFinish = function onLoadFinish(organizationResponse) {
        API.cui.getOrganizationHierarchy({organizationId: organizationResponse.id})
        .then(function(res) {
            orgDirectory.organization = res;
            orgDirectory.organizationList = flattenHierarchy(res.children);
            return API.cui.getPersons({'qs': [['organization.id', orgDirectory.organization.id],
                                                ['pageSize', orgDirectory.paginationSize], ['page',1]]});
        })
        .then(function(res) {
            orgDirectory.userList = res;
            orgDirectory.unparsedUserList = res;
            orgDirectory.statusList = getStatusList(orgDirectory.userList);
            return API.cui.countPersons({'qs': ['organization.id', orgDirectory.organization.id]});
        })
        .then(function(res) {
            orgDirectory.orgPersonCount = res;
            orgDirectory.loading = false;
            $scope.$digest();
        })
        .fail(handleError);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    if (!organizationId) {
        // If no id parameter is passed load directory of logged in user's organization.
        API.cui.getPerson({personId: API.getUser(), useCuid:true})
        .then(function(person) {
            return API.cui.getOrganization({organizationId: person.organization.id});
        })
        .then(function(res) {
            onLoadFinish(res);
        })
        .fail(handleError);
    }
    else {
        // Load organization directory of id parameter
        API.cui.getOrganization({organizationId: organizationId})
        .then(function(res) {
            onLoadFinish(res);
        })
        .fail(handleError);
    }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    orgDirectory.getOrgMembers = function getOrgMembers(organization) {
        orgDirectory.loading = true;
        orgDirectory.organization = organization;
        API.cui.getPersons({'qs': [['organization.id', orgDirectory.organization.id]]})
        .then(function(res) {
            orgDirectory.userList = res;
            orgDirectory.unparsedUserList = res;
            orgDirectory.statusList = getStatusList(orgDirectory.userList);
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
        API.cui.getPersons({'qs': [['organization.id', orgDirectory.organization.id],
                                    ['pageSize', orgDirectory.paginationSize], ['page', page]]})
        .then(function(res) {
            orgDirectory.userList = res;
            orgDirectory.unparsedUserList = res;
            orgDirectory.statusList = getStatusList(orgDirectory.userList);
        })
        .fail(handleError);
    };

    // ON CLICK END ----------------------------------------------------------------------------------

    // WATCHERS START --------------------------------------------------------------------------------

    $scope.$watch('orgDirectory.paginationSize', function(newValue) {
        if (newValue) {
            API.cui.getPersons({'qs': [['organization.id', orgDirectory.organization.id],
                                ['pageSize', orgDirectory.paginationSize], ['page', 1]]})
            .then(function(res) {
                orgDirectory.userList = res;
                orgDirectory.unparsedUserList = res;
                orgDirectory.paginationCurrentPage = 1;
                orgDirectory.statusList = getStatusList(orgDirectory.userList);
            })
            .fail(handleError);
        }
    });

    // WATCHERS END ----------------------------------------------------------------------------------

}]);
