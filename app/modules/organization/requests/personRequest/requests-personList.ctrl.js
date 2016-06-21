angular.module('organization')
.controller('personRequestsCtrl',function(API,Sort,User,$scope,$q) {

    const personRequests = this;
    const organizationId = User.user.organization.id;

    personRequests.loading = true;
    personRequests.sortFlag = false;

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

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

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    API.cui.getPersonRegistrationRequest()
    .then((res) => {
        personRequests.userList = res;
        let promises = [];

        personRequests.userList.forEach((person) => {
            promises.push(
                API.cui.getPerson({personId: person.registrant.id})
                .then((res) => {
                    person.name = res.name;
                    person.person = res;
                    return API.cui.getOrganization({organizationId: res.organization.id});
                })
                .then((res) => {
                    person.organization = res;
                })
            );
        });

        promises.push(
            API.cui.getOrganizationHierarchy({organizationId: User.user.organization.id})
            .then((res) => {
                personRequests.organizationList = flattenHierarchy(res.children);
            })
        );

        $q.all(promises)
        .then(() => {
            personRequests.loading = false;
        });
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    personRequests.sort = function sort(sortType) {
        Sort.listSort(personRequests.userList, sortType, personRequests.sortFlag);
        personRequests.sortFlag =! personRequests.sortFlag;
    };

    // ON CLICK END ----------------------------------------------------------------------------------

});
