angular.module('misc')
    .controller('searchCtrl', ['API', '$scope', '$stateParams', '$state', '$q', '$pagination','APIHelpers','Loader', 'APIError',
    function(API, $scope, $stateParams, $state, $q, $pagination,APIHelpers,Loader,APIError) {
        let search = this;
        search.currentParentOrg = API.user.organization.id;

        search.users = null;
        search.timer = null
        search.searchType = "organizations";
        search.searchOrgId = "";
        search.searchterms=""
        search.count=1000
        search.pageError=false

        // search.keypress = function() {
        //     search.users = [];
        //     if (search.timer) { clearTimeout(search.timer); }
        //     search.timer = window.setTimeout(function() {
        //         search.searchNow();
        //     }, 200);
        // }

        /* -------------------------------------------- HELPER FUNCTIONS END --------------------------------------------- */

        search.flattenOrgHierarchy = function(orgHierarchy) {
            /*
                Takes the organization hierarchy response and returns a flat object array containing the id's and name's of
                the top level organization as well as it's divisions.
            */

            if (orgHierarchy) {
                let organizationArray = [];

                organizationArray.push({
                    id: orgHierarchy.id,
                    name: orgHierarchy.name
                });

                if (orgHierarchy.children) {
                    orgHierarchy.children.forEach((division) => {
                        organizationArray.push({
                            id: division.id,
                            name: division.name
                        });

                        if (division.children) {
                            let flatArray = _.flatten(division.children);

                            flatArray.forEach((childDivision) => {
                                organizationArray.push({
                                    id: childDivision.id,
                                    name: childDivision.name
                                });
                            });
                        }
                    });
                }
                return organizationArray;
            } else {
                throw new Error('No organization hierarchy object provided');
            }
        }

        search.addPerson = function(newPerson) {

            // Prevent Duplicates
            var add = true;
            search.users.forEach(function(person) {
                if (newPerson.id == person.id) { add = false; }
            })

            if (newPerson.status == 'pending') { add = false; }
            if (add) { search.users.push(newPerson) }

        }

        search.searchNow = function(type) {
            search.pageError=false
            if (type) {
                search.searchParams.page=1
            }
            Loader.onFor('search.loading')
            search.users = [];
            search.orgs = [];
            let qsArray=APIHelpers.getQs(search.searchParams)
            //Need to filter out pending and unactive
            qsArray.push(['status','active'],['status','suspended'])
            // if (search.searchterms|| !type) {

                if (search.searchType == "people") {
                    let qsArrayNameSearch=angular.copy(qsArray)
                    qsArrayNameSearch.push(['fullName', search.searchterms],['status','locked'])
                    const promises= [API.cui.countPersons({qs:qsArrayNameSearch}),API.cui.getPersons({qs: qsArrayNameSearch})]
                    $q.all(promises)
                    .then(res=>{
                        search.personCount=res[0]
                        search.users=res[1]
                        if (search.users.length===0) {
                            search.noRecords=true
                        }
                        Loader.offFor('search.loading')
                    })                    
                    .catch(error => {
                        Loader.offFor('search.loading')
                        search.pageError=true
                    })
                    //     qsArray.push(['email', search.searchterms])
                    // API.cui.getPersons({
                    //         qs: qsArray
                    //     })
                    //     .done(personResponse => {

                    //         personResponse.forEach(function(x) {
                    //             search.addPerson(x);
                    //         })

                    //         $scope.$digest()
                    //     })
                    //     .fail(error => {

                    //     })

                }
                if (search.searchType == "organizations") {
                    qsArray.push(['name', search.searchterms + "*"])
                    API.cui.getOrganizations({qs: qsArray})
                    .done(orgsResponse => {
                        search.orgs = orgsResponse;
                        if (search.orgs.length===0) {
                            search.noRecords=true
                        }
                    })
                    .fail(error => {
                        search.pageError=true
                    })
                    .always(handleAll)
                }
            // }
        }

        const handleAll= () => {
            Loader.offFor('search.loading')
            $scope.$digest()
        }

        /* -------------------------------------------- HELPER FUNCTIONS END --------------------------------------------- */

        /* -------------------------------------------- ON LOAD START --------------------------------------------- */
        search.searchParams = Object.assign({}, $stateParams)
        search.searchParams.pageSize = search.searchParams.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0]
        if (!search.searchParams.page) {
            search.searchParams.page=1
        }
        search.sortBy = {}
        search.organizationList = null;
        // API.cui.getOrganizationsCount({qs:APIHelpers.getQs(search.searchParams)})
        // .then(count=>{
        //     search.orgCount=count
        //     return API.cui.getOrganizations({qs:APIHelpers.getQs(search.searchParams)})
        // })
        Loader.onFor('search.loading')
        let qs=APIHelpers.getQs(search.searchParams)
        qs.push(['status','active'],['status','suspended'])
        API.cui.getOrganizations({qs:qs})
        .then(res => {
            search.orgs = res
            if (search.orgs.length===0) {
                search.noRecords=true
            }
        })
        .fail(error => {
            search.pageError=true
        })
        .always(handleAll)

        /* -------------------------------------------- ON LOAD END --------------------------------------------- */

        /* -------------------------------------------- ON CLICK FUNCTIONS START --------------------------------------------- */
        search.updateSearchParams = function(page) {
            if (page) {
                search.searchParams.page=page
            }
            $state.transitionTo('search', search.searchParams, {notify: false})
            search.searchNow()
        }

        search.userClick = function(clickedUser) {

            const stateOpts = {
                userId: clickedUser.id,
                orgId: clickedUser.organization.id,
            }
            if (clickedUser.status === 'pending') $state.go('organization.requests.personRequest', stateOpts)
            else $state.go('organization.directory.userDetails', stateOpts)

        }

        search.orgClick = function(clickedOrd) {
            const stateOpts = {
                orgId: clickedOrd.id,
            }
            $state.go('organization.directory.orgDetails', stateOpts)
        }

        /* -------------------------------------------- ON CLICK FUNCTIONS END --------------------------------------------- */
    }]);
