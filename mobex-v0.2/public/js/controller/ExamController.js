app.controller('ExamController', ['$scope', '$routeParams', 'databaseService', function($scope, $routeParams, databaseService){
    
    $scope.exam;
    $scope.isEmpty = false;
    $scope.loadedExamSet = false;
    
    $scope.loadExams = function(){
        $scope.loadedExamSet = false;
        databaseService.getExam($routeParams.id).then(function(result){
            $scope.exam = result;
            databaseService.getQuestionsFromSet($scope.exam.val().name).then(function(result){
                if(result.length > 0){
                    $scope.isEmpty = false;
                    $scope.questions = result;
                }
                else {
                    $scope.isEmpty = true;
                }
                $scope.loadedExamSet = true;
            }, function(error){
                console.log(error);
            });
        }, function(error){
            console.log(error);                    
        });
    
    };
    
}]);