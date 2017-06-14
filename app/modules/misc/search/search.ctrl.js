angular.module('misc')
    .controller('searchCtrl', ['API', '$scope', '$stateParams', '$state', 'AppRequests', 'localStorageService', '$q', '$pagination', function(API, $scope, $stateParams, $state, AppRequests, localStorage, $q, $pagination) {
        let search = this;

        $scope.currentParentOrg = API.user.organization.id;

        $scope.users = null;
        $scope.timer = null
        $scope.searchType = "people";
        $scope.searchOrgId = "";

        $scope.keypress = function() {
            $scope.users = [];
            if ($scope.timer) { clearTimeout($scope.timer); }
            $scope.timer = window.setTimeout(function() {
                $scope.searchNow();
            }, 200);
        }

        var orgDirectory = this
        orgDirectory.search = {}
        orgDirectory.sortBy = {}
        orgDirectory.organizationList = null;

        API.cui.getOrganizationHierarchy({ organizationId: $scope.currentParentOrg })
            .done(personResponse => {
                $scope.orgs = $scope.flattenOrgHierarchy(personResponse);
            })
            .fail(error => {
            })

        $scope.userClick = function(clickedUser) {

            const stateOpts = {
                userId: clickedUser.id,
                orgId: clickedUser.organization.id,
            }
            if (clickedUser.status === 'pending') $state.go('organization.requests.personRequest', stateOpts)
            else $state.go('organization.directory.userDetails', stateOpts)

        }

        $scope.orgClick = function(clickedOrd) {
            const stateOpts = {
                orgId: clickedOrd.id,
            }
            $state.go('organization.profile', stateOpts)
        }

        $scope.flattenOrgHierarchy = function(orgHierarchy) {
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

        $scope.addPerson = function(newPerson) {

            // Prevent Duplicates
            var add = true;
            $scope.users.forEach(function(person) {
                if (newPerson.id == person.id) { add = false; }
            })

            if (newPerson.status == 'pending') { add = false; }
            if (add) { $scope.users.push(newPerson) }

        }

        $scope.searchNow = function() {

            $scope.users = [];
            $scope.orgs = [];

            if ($scope.searchterms) {

                if ($scope.searchType == "people") {
                    
                    API.cui.getPersons({
                            qs: [
                                ['fullName', $scope.searchterms]
                            ]
                        })
                        .done(personResponse => {

                            personResponse.forEach(function(x) {
                                $scope.addPerson(x);
                            })

                            $scope.$apply();
                        })
                        .fail(error => {


                        })
                    API.cui.getPersons({
                            qs: [
                                ['email', $scope.searchterms]
                            ]
                        })
                        .done(personResponse => {

                            personResponse.forEach(function(x) {
                                $scope.addPerson(x);
                            })

                            $scope.$apply();
                        })
                        .fail(error => {

                        })

                }

                if ($scope.searchType == "organizations") {

                    API.cui.getOrganizations({
                            qs: [
                                ['name', $scope.searchterms + "*"]
                                // ['organization.id', 'OQ-ADM-PER-DEV01273701']
                            ]
                        })
                        .done(orgsResponse => {

                            $scope.orgs = orgsResponse;
                            $scope.$apply();
                        })
                        .fail(error => {

                        })


                }
            }
        }

    }]);
