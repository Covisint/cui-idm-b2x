angular.module('app')
.controller('divisionCtrl',['$scope', 'API', 'Person', function($scope, API, Person) {
	var newDivision = this;
	newDivision.userLogin = {};

	newDivision.tosError = [
		{
			test: "test",
			name: 'tosRequired',
			check: function() {
				return newDivision.tos;
			}
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
        newDivision.userLogin.question1 = newDivision.userLogin.challengeQuestions1[0].id;
        newDivision.userLogin.question2 = newDivision.userLogin.challengeQuestions2[0].id;
    })
    .catch(function(err) {
        console.log(err);
    });
	
}]); 
