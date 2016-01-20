angular.module('app')
.controller('tloCtrl',['$scope', 'API', 'Person', function($scope, API, Person) {
	var newTLO = this;
	newTLO.userLogin = {};

  newTLO.passwordPolicies = [
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

      newTLO.userLogin.challengeQuestions1 = res.data.slice(0,numberOfQuestionsFloor);
      newTLO.userLogin.challengeQuestions2 = res.data.slice(numberOfQuestionsFloor);

      // Preload question into input
      newTLO.userLogin.question1 = newTLO.userLogin.challengeQuestions1[0];
      newTLO.userLogin.question2 = newTLO.userLogin.challengeQuestions2[0];
  })
  .catch(function(err) {
      console.log(err);
  });

}]);
