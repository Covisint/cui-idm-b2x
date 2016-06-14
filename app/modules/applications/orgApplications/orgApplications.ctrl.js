angular.module('applications')
.controller('orgApplicationsCtrl', function(API,Sort,User,$scope,$stateParams,$pagination,$q) {
    'use strict';

    const orgApplications = this;
    const organizationId = User.user.organization.id;

    let apiPromises = [];
    let sortFlag = '+';

    orgApplications.loading = true;
    orgApplications.categoryList = [];
    orgApplications.paginationPageSize = orgApplications.paginationPageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    const handleError = function handleError(err) {
        orgApplications.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    const sortFlagSwitch = () => {
        switch (sortFlag) {
            case ('+'):
                sortFlag = '-';
                break;
            case ('-'):
                sortFlag = '+';
                break;
        }
    };

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    apiPromises.push(

        API.cui.getOrganizationGrantedApps({organizationId: organizationId, 
            qs:[['pageSize', String(orgApplications.paginationPageSize)], ['page', '1']]})
        .then((res) => {
            orgApplications.appList = res;
        }),

        API.cui.getOrganizationGrantedCount({organizationId: organizationId})
        .then((res) => {
            orgApplications.grantedCount = res;
        }),

        API.cui.getOrgPendingServicePackages({qs:[['requestor.id', organizationId], ['requestor.type', 'organization']]})
        .then((res) => {
            orgApplications.requestableApps = res;

            res.forEach((servicePackage) => {
                return API.cui.getPackageServices({packageId: servicePackage.servicePackage.id})
                .then((res) => {
                    res.forEach((pendingService) => {
                        pendingService.grant = { 
                            status: 'pending'
                        };
                        orgApplications.appList.push(pendingService);
                    });
                });
            });
        }),

        API.cui.getCategories()
        .then((res) => {
            res.forEach((category) => {
                orgApplications.categoryList.push(category.name);
            });
        })
    );

    $q.all(apiPromises)
    .then(() => {
        orgApplications.loading = false;
    })
    .catch((err) => {
        console.log(err);
    });

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

    orgApplications.sortFilter = (sortType, sortValue) => {
        let sortPromises = [], englishSortValue = '';
        orgApplications.loading = true;
        
        if (sortValue && sortValue !== 'all') {
            sortValue.forEach((languageValue) => {
                if (languageValue.lang === 'en') {
                    englishSortValue = languageValue.text;
                }
            });
        }

        if (sortType === 'category') {
            if (sortValue === 'all') {
                sortPromises.push(
                    API.cui.getOrganizationGrantedApps({organizationId: organizationId,
                        qs:[['pageSize', orgApplications.paginationPageSize], ['page', orgApplications.paginationCurrentPage]]})
                    .then((res) => {
                        orgApplications.appList = res;
                    })
                );
            }
            else {
                sortPromises.push(
                    API.cui.getOrganizationGrantedApps({organizationId: organizationId,
                        qs:[['service.' + sortType, englishSortValue], ['pageSize', orgApplications.paginationPageSize], ['page', orgApplications.paginationCurrentPage]]})
                    .then((res) => {
                        orgApplications.appList = res;
                    }) 
                );    
            }
            
        }
        else {
            sortPromises.push(
                API.cui.getOrganizationGrantedApps({organizationId: organizationId,
                    qs:[['sortBy', sortFlag + 'service.' + sortType], ['pageSize', orgApplications.paginationPageSize], ['page', orgApplications.paginationCurrentPage]]})
                .then((res) => {
                    orgApplications.appList = res;
                    sortFlagSwitch();
                })
            );
        }

        $q.all(sortPromises)
        .then((res) => {
            orgApplications.loading = false;
        })
        .catch((error) => {
            console.log(error);
        });
    };

    orgApplications.paginationHandler = (page) => {
        orgApplications.loading = true;
        API.cui.getOrganizationGrantedApps({organizationId: organizationId, 
                qs:[['pageSize', orgApplications.paginationPageSize], ['page', page]]})
        .then((res) => {
            orgApplications.appList = res;
            orgApplications.loading = false;
            $scope.$digest();
        })
        .fail(handleError);
    };

    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

    // WATCHERS START -----------------------------------------------------------------------------------------

    $scope.$watch('orgApplications.paginationPageSize', function(newValue, oldValue) {
        if (newValue && oldValue && newValue !== oldValue) {
            orgApplications.loading = true;

            API.cui.getOrganizationGrantedApps({organizationId: organizationId, 
                qs:[['pageSize', orgApplications.paginationPageSize], ['page', 1]]})
            .then((res) => {
                orgApplications.appList = res;
                orgApplications.paginationCurrentPage = 1;
                orgApplications.loading = false;
                $scope.$digest();
            })
            .fail(handleError);
        }
    });

    // WATCHED END --------------------------------------------------------------------------------------------

});
