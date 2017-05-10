angular.module('applications')
.controller('myApplicationsCtrl', function(API,APIError,APIHelpers,DataStorage,Loader,User,$filter,$pagination,$q,$scope,$state,$stateParams) {
	const myApplications = this
    const userId = User.user.id
    const loaderName = 'myApplications.'
    let checkedLocalStorage = false

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------
    const getCountsOfcategories=()=>{
        myApplications.categories.forEach((category,index)=>{
            console.log($filter('cuiI18n')(category.name))
            let opts = {
                personId: userId,
                useCuid:true
            }
            opts.qs=[['service.category',$filter('cuiI18n')(category.name)]]
            API.cui.getPersonGrantedAppCount(opts)
            .then(res=>{
                //Need to minus each category count with not displayble and other than active apps according to thier categories
                category.count=res
                -
                (
                    Object.assign(myApplications.list).filter(x => 
                        x.category&& $filter('cuiI18n')(x.category)===$filter('cuiI18n')(category.name)
                    ).length
                    -
                    Object.assign(myApplications.viewList).filter(x => 
                            x.category&& $filter('cuiI18n')(x.category)===$filter('cuiI18n')(category.name)
                    ).length
                )                
                if (index===myApplications.categories.length-1) {
                    $scope.$digest();
                };
            })
            .fail(err=>{
                console.log(err);
                if (index===myApplications.categories.length-1) {
                    $scope.$digest();
                };
            })            
        })
    }

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------
    const loadStoredData = () => {
        // Check DataStorage if this page has been loaded before. We initially populate this screen
        // with data that was previously retrieved from the API while we redo calls to get the up to date data.
        const storedData = DataStorage.getType('myApplicationsList')

        if (storedData) {
            Loader.onFor(loaderName + 'apps')
            myApplications.list = storedData.appList
            myApplications.viewList = Object.assign(myApplications.list).filter(x => x.servicePackage.displayable===true&&x.grant.status=='active')
            myApplications.count = storedData.appCount
            myApplications.categories = storedData.categories
            Loader.offFor(loaderName + 'apps')
        }

        checkedLocalStorage = true
        onLoad(false)
    }

    const onLoad = (previouslyLoaded) => {
        if (previouslyLoaded) {
            Loader.onFor(loaderName + 'reloadingApps')
        }
        else {
            checkedLocalStorage ? Loader.onFor(loaderName + 'updating') : Loader.onFor(loaderName + 'apps')
            myApplications.search = Object.assign({}, $stateParams)

            Loader.onFor(loaderName + 'categories')
            API.cui.getPersonAppCategories({personId:API.getUser()})
            .then(res => {
                APIError.offFor(loaderName + 'categories')
                myApplications.categories = res;
                getCountsOfcategories()
                APIError.offFor(loaderName + 'categories')
            })
            .fail(err => {
            	console.error('There was an error in fetcting user\'s app category details ' +err)
                APIError.onFor(loaderName + 'categories')
            })
            .done(() => {
                Loader.offFor(loaderName + 'categories')
                $scope.$digest()
            })
        }

        myApplications.search.pageSize = myApplications.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]

        const opts = {
            personId: API.getUser(),
            useCuid:true,
            qs: APIHelpers.getQs(myApplications.search)
        }
        opts.qs.push(['grant.status','active'])
        const promises = [
            API.cui.getPersonGrantedApps(opts), 
            API.cui.getPersonGrantedAppCount(opts)
        ]

        $q.all(promises)
        .then(res => {
            myApplications.viewList = Object.assign(res[0]).filter(x => x.servicePackage.displayable===true&&x.grant.status=='active')
            if (!previouslyLoaded) {
                myApplications.count = res[1]
            }
            myApplications.popupCount = myApplications.count-Object.assign(res[0]).filter(x => x.servicePackage.displayable!==true || x.grant.status!=='active').length
            myApplications.list=res[0];
            // re-render pagination if available
            myApplications.reRenderPaginate && myApplications.reRenderPaginate()

            const storageData = {
                appList: myApplications.list, 
                appCount: myApplications.count, 
                categories: myApplications.categories
            }
            DataStorage.setType('myApplicationsList', storageData)
            APIError.offFor(loaderName + 'apps')
        })
        .catch(err => {
        	console.error('There was an error in fetcting user\'s granted applications ' +err)
            APIError.onFor(loaderName + 'apps')
        })
        .finally(() => {
            if (previouslyLoaded) {
                Loader.offFor(loaderName + 'reloadingApps')
            } 
            else {
                checkedLocalStorage ? Loader.offFor(loaderName + 'updating') : Loader.offFor(loaderName + 'apps')
            }
        })
    }

    loadStoredData()

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

    myApplications.pageChange = (newpage) => {
        myApplications.updateSearch('page', newpage)
    }

    myApplications.updateSearch = (updateType, updateValue) => {
        switch (updateType) {
            case 'category':
                myApplications.search.page = 1
                myApplications.search['service.category'] = $filter('cuiI18n')(updateValue)
                break
        }

        // doesn't change state, only updates the url
        $state.transitionTo('applications.myApplications', myApplications.search, { notify:false })
        onLoad(true)
    }
})
