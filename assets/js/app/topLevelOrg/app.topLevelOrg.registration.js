angular.module('app')
.controller('tloCtrl',['$scope', 'API', 'Person', function($scope, API, Person) {
	var newTLO = this;
	newTLO.userLogin = {};

	newTLO.tosError = [
		{
			test: "test",
			name: 'tosRequired',
			check: function() {
				return newTLO.tos;
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

        newTLO.userLogin.challengeQuestions1 = res.data.slice(0,numberOfQuestionsFloor);
        newTLO.userLogin.challengeQuestions2 = res.data.slice(numberOfQuestionsFloor);

        newTLO.userLogin.question1 = newTLO.userLogin.challengeQuestions1[0].id;
        newTLO.userLogin.question2 = newTLO.userLogin.challengeQuestions2[0].id;
    })
    .catch(function(err) {
        console.log(err);
    });
	
}]); 
