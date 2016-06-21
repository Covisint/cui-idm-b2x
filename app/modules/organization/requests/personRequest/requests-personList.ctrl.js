angular.module('organization')
.controller('personRequestsCtrl',function(API,APIError,Loader,Sort,User,$q,$scope,$state) {

    const personRequests = this;
    const organizationId = User.user.organization.id;
    const loaderName = 'personRequests.';

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

    Loader.onFor(loaderName + 'requests');

    API.cui.getPersonRegistrationRequest()
    .then((res) => {
        personRequests.userList = res;
        personRequests.requestCount = res.length;
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
            API.cui.getOrganizationHierarchy({organizationId: organizationId})
            .then((res) => {
                personRequests.organizationList = flattenHierarchy(res.children);
            })
        );

        $q.all(promises)
        .catch((error) => {
            APIError.onFor(loaderName + 'requests');
        })
        .finally(() => {
            Loader.offFor(loaderName + 'requests');
        });
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    personRequests.sort = (sortType) => {
        Sort.listSort(personRequests.userList, sortType, personRequests.sortFlag);
        personRequests.sortFlag =! personRequests.sortFlag;
    };

    personRequests.loadRequest = (registrantId, orgId) => {
        $state.go('organization.requests.personRequest', {userID: registrantId, orgID: orgId});
    };

    // ON CLICK END ----------------------------------------------------------------------------------

});
