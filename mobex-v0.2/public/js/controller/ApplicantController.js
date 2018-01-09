app.controller('ApplicantController', ['$scope', '$routeParams','databaseService', function($scope, $routeParams, databaseService){
    $scope.applicant;
    $scope.categories;
    $scope.finalResult;
    $scope.applicantId;
    $scope.loadedApplicant = false;
    
    var totalExamScore = 0;
    var passingGrade = 0;
    
    $scope.loadApplicant = function(){
        $scope.loadedApplicant = false;
        databaseService.getApplicant($routeParams.id).then(function(result){
            $scope.applicantId = $routeParams.id;
            $scope.applicant = result.val();
            $scope.categories = $scope.applicant.answersInEachCategory;
            if($scope.categories) {
                for(var i = 0; i < $scope.categories.length; i++) {
                    if(typeof $scope.categories[i].questions != 'undefined') {
                        totalExamScore += $scope.categories[i].questions.length;
                    }
                    else {
                        $scope.categories[i].questions = [];
                    }
                }
            }
            if($scope.categories) {
                // determine if answers are correct
                for(var i = 0; i < $scope.categories.length; i++) {
                    var questions = $scope.categories[i].questions;
                    for(var j = 0; j < questions.length; j++) {
                        if(typeof questions[j].answer != 'undefined' && questions[j].answer != null) {
                            if(questions[j].answer == questions[j].correct_answer) {
                                questions[j].correct = true;
                            }
                        }
                        else if(typeof questions[j].answers != 'undefined' && questions[j].answers != null) {
                            if(questions[j].answers.length && questions[j].correct_answers.length) {
                                var correct = true;
                                for(var k = 0; k < questions[j].answers.length; k++) {
                                    if(questions[j].answers[k].theAnswer != questions[j].correct_answers[k].theAnswer) {
                                        correct = false;
                                    }
                                }
                                questions[j].correct = correct;
                            }
                        }
                    }
                }
            }
            
            $scope.totalExamScore = totalExamScore;
            $scope.loadedApplicant = true;
        }, function(error){
            console.log(error);                    
        });
    }
}]);