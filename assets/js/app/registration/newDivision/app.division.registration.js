angular.module('app')
.controller('divisionCtrl',['$scope', 'API', 'Person', function($scope, API, Person) {
	var newDivision = this;
	newDivision.userLogin = {};
    newDivision.orgSearch = {};

    newDivision.passwordPolicies = [  // WORKAROUND CASE #5
        {
            'allowUpperChars': true,
            'allowLowerChars': true,
            'allowNumChars': true,
            'allowSpecialChars': true,
            'requiredNumberOfCharClasses': 3
        },
        {
            'disallowedChars':'^&*)(#$'
        },
        {
            'min': 8,
            'max': 18
        },
        {
            'disallowedWords': ['password', 'admin']
        }
    ];

	Person.getSecurityQuestions()
    .then(function(res) {
    	// Removes first question as it is blank
        res.data.splice(0,1);

        // Splits questions to use between both dropdowns
        var numberOfQuestions = res.data.length,
        numberOfQuestionsFloor = Math.floor(numberOfQuestions/2);

        newDivision.userLogin.challengeQuestions1 = res.data.slice(0,numberOfQuestionsFloor);
        newDivision.userLogin.challengeQuestions2 = res.data.slice(numberOfQuestionsFloor);

        // Preload question into input
        newDivision.userLogin.question1 = newDivision.userLogin.challengeQuestions1[0];
        newDivision.userLogin.question2 = newDivision.userLogin.challengeQuestions2[0];
    })
    .catch(function(err) {
    });

    // Return all organizations
    API.doAuth()
    .then(function() {
        API.cui.getOrganizations()
        .then(function(res){
            newDivision.organizationList = res;
        });
    })
    .fail(function(err){
        console.log(err);
    });

    var searchOrganizations = function() {
        // this if statement stops the search from executing
        // when the controller first fires  and the search object is undefined/
        // once pagination is impletemented this won't be needed
        if (newDivision.orgSearch) {
            API.cui.getOrganizations({'qs': [['name', newDivision.orgSearch.name]]})
            .then(function(res){
                newDivision.organizationList = res;
                $scope.$apply();
            })
            .fail(function(err){
                console.log(err);
            });
        }
    };

    $scope.$watchCollection('newDivision.orgSearch', searchOrganizations);

}]);
