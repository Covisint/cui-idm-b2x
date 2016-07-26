angular.module('common')
.directive('cuiTable', ($pagination, $q) => ({
    restrict: 'E',
    transclude: true,
    scope: {
        cuiTableConfig: '='
    },
    template: `
        <div>
            <div class="cui-flex-table">
                <ng-transclude></ng-transclude>
            </div>
            <div class="cui-paginate__container" ng-if="cuiTableConfig.paginate">
                <span class="cui-paginate__results-label">
                    {{'cui-num-results-page' | translate}}
                </span>
                <results-per-page class="cui-paginate__select" ng-model="cuiTableConfig.pageSize"></results-per-page>
                <paginate class="cui-paginate"
                    results-per-page="cuiTableConfig.pageSize"
                    count="cuiTableConfig.recordCount"
                    on-page-change="cuiTableConfig.pageChangeHandler"
                    ng-model="cuiTableConfig.initalPage"
                    attach-rerender-to="cuiTableConfig.reRenderPaginate">
                </paginate>
            </div>
        </div>
    `,
    link: (scope, iElem, iAttrs) => {
        const initScope = () => {
            if (!scope.cuiTableConfig) scope.cuiTableConfig = {}

            if (scope.cuiTableConfig.paginate) {
                const requiredOptions = ['recordCount', 'pageSize', 'initialPage', 'onPageChange']
                try {
                    requiredOptions.forEach(requiredOption => {
                        if (scope.cuiTableConfig[requiredOption] == undefined) {
                            throw new Error(`Cui-table error : if pagination is enabled then cui-table-config must have .${ requiredOption }`)
                        }
                    })
                } catch (e) {
                    throw new Error(e)
                }
            }
        }
        try {
            initScope()
        } catch (e) {
            console.error(e)
            return
        }

        scope.cuiTableConfig.pageChangeHandler = (page) => {
            scope.cuiTableConfig.onPageChange(page, scope.cuiTableConfig.pageSize)
        }

        const watchers = {
            pageSize: scope.$watch('cuiTableConfig.pageSize', (newPageSize, oldPageSize) => {
                if (newPageSize && oldPageSize && newPageSize!==oldPageSize) {
                    scope.cuiTableConfig.pageChangeHandler(1)
                }
            }),
            count: scope.$watch('cuiTableConfig.recordCount', (newRecordCount, oldRecordCount) => {
                if (newRecordCount && oldRecordCount && newRecordCount!==oldRecordCount) {
                    scope.cuiTableConfig.pageChangeHandler(1)
                    scope.cuiTableConfig.reRenderPaginate()
                }
            })
        }
        scope.$on('$destroy', () => {
            angular.forEach(watchers, (cancelWatcher) => { cancelWatcher() })
        })
    }
}))

angular.module('common')
.directive('userListHeader', () => ({
    restrict: 'E',
    replace: true,
    scope: {
        sorting: '=',
        sortingCallbacks: '='
    },
    templateUrl: 'app/common-templates/user-list/user-list-header.html',
    link: (scope) => {
        scope.userListHeader.nameCallback = scope.sortingCallbacks.name || angular.noop
        scope.userListHeader.usernameCallback = scope.sortingCallbacks.username || angular.noop
        scope.userListHeader.registeredCallback = scope.sortingCallbacks.registered || angular.noop
        scope.userListHeader.statusCallback = scope.sortingCallbacks.status || angular.noop
    }
}))

angular.module('common')
.directive('userListRow', () => ({
    restrict: 'E',
    replace: true,
    templateUrl: 'app/common-templates/user-list/user-list-row.html'
}))
