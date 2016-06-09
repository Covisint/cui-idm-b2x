angular.module('applications')
.controller('myApplicationsCtrl', ['localStorageService','$scope','$stateParams','API','$state','$filter','$q','$pagination',
function(localStorageService,$scope,$stateParams,API,$state,$filter,$q,$pagination) {

    let myApplications = this;

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    const switchBetween = (property, firstValue, secondValue) => { // helper function to switch a property between two values or set to undefined if values not passed;
        if(!firstValue) myApplications.search[property] = undefined;
        myApplications.search[property] === firstValue ? myApplications.search[property] = secondValue : myApplications.search[property] = firstValue;
    };

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    const onLoad = (previouslyLoaded) => {

        if(previouslyLoaded) {
            myApplications.redoneLoading = false;
        }
        else { // pre populate fields based on state params on first load
            myApplications.search = {};
            myApplications.search.name = $stateParams.name;
            myApplications.search.category = $stateParams.category;
            myApplications.search.pageSize = parseInt($stateParams.pageSize);
            myApplications.search.page = parseInt($stateParams.page);
            myApplications.search.sort = $stateParams.sort;
            myApplications.search.refine = $stateParams.refine;

            API.cui.getCategories()
            .then((res)=>{
                myApplications.categories = res;
                $scope.$digest();
            });
        }

        let query = [];

        myApplications.search.pageSize = myApplications.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
        query.push(['pageSize',String(myApplications.search.pageSize)]);


        myApplications.search.page = myApplications.search.page || 1;
        query.push(['page',String(myApplications.search.page)]);


        if(myApplications.search.name) query.push(['service.name',myApplications.search.name]);
        if(myApplications.search.category) query.push(['service.category',myApplications.search.category]);
        if(myApplications.search.sort) query.push(['sortBy',myApplications.search.sort]); //  "+service.name", "-service.name", "+service.creation", "-service.creation", "+grant.instant", "-grant.instant"
        if(myApplications.search.refine) query.push(['grant.status',myApplications.search.refine]); // active or suspendend for granted, pending from a dif. endpoint

        const opts = {
            personId: API.getUser(),
            useCuid:true,
            qs: query
        };

        const promises = [API.cui.getPersonGrantedApps(opts),API.cui.getPersonGrantedCount(opts)];

        $q.all(promises)
        .then((res)=>{
            myApplications.list = res[0];
            myApplications.count = res[1];
            myApplications.redoneLoading = myApplications.doneLoading = true;
            if(myApplications.reRenderPaginate) myApplications.reRenderPaginate();
        });
    };

    onLoad(false);

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

    myApplications.pageChange = (newpage) => {
        myApplications.updateSearch('page',newpage);
    };

    myApplications.updateSearch = (updateType,updateValue) => {
        switch (updateType){
            case 'alphabetic':
                switchBetween('sort','+service.name','-service.name');
                break;
            case 'date':
                switchBetween('sort','+grant.instant','-grant.instant');
                break;
            case 'status':
                myApplications.search.page = 1;
                myApplications.search.refine = updateValue;
                break;
            case 'category':
                myApplications.search.page = 1;
                myApplications.search.category = $filter('cuiI18n')(updateValue);
                break;
        };

        $state.transitionTo('applications.myApplications', myApplications.search, {notify:false}); // doesn't change state, only updates the url
        onLoad(true);

    };

    myApplications.goToDetails = (application) => {
        const opts = {
            appId: application.id
        };
        $state.go('applications.myApplicationDetails',opts);
    };


    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

}]);
