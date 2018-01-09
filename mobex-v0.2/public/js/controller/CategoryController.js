app.controller('CategoryController', ['$scope', '$routeParams', '$q', 'databaseService', function($scope, $routeParams, $q, databaseService){
    
    $scope.category;
    $scope.isEmpty = false;
    $scope.loadedCategory = false;
    
    $scope.loadQuestions = function(){
        $scope.loadedCategory = false;
 
        databaseService.getCategory($routeParams.id).then(function(result){
            $scope.category = result;

            $scope.category.subcategories = [];
            
            // for version with subcategories
            databaseService.getSubcategories($scope.category.category_name).then(function(result){
                $scope.category.subcategories = result;
                
                var questionPromises = [];
                for(var i = 0; i < result.length; i++) {
                    questionPromises.push(databaseService.getQuestionsFromCategory(result[i].category_name));
                }
                
                $q.all(questionPromises).then(function(questionsPerCategoryArray){
                    console.info("promise result", questionsPerCategoryArray);
                    
                    for(var i = 0; i < $scope.category.subcategories.length; i++) {
                        $scope.category.subcategories[i].questions = [];
                    }
                    
                    for(var i = 0; i < questionsPerCategoryArray.length; i++) {
                        var categoryQuestions = questionsPerCategoryArray[i][1];

                        for(var j = 0; j < $scope.category.subcategories.length; j++) {
                            
                            for(var k = 0; k < categoryQuestions.length; k++) {
                                if(categoryQuestions[k].category_name == $scope.category.subcategories[j].category_name) {
                                    $scope.category.subcategories[j].questions.push(categoryQuestions[k]);
                                }
                                else {
                                    break;
                                }
                            }   
                        }
                    }
                    
                    //$scope.isEmpty = true;
                    $scope.loadedCategory = true;
                });
           });
            
            // for the version with no subcategories
           /* databaseService.getQuestionsFromCategory($scope.category.category_name).then(function(result){
                if(result.length > 0){
                    $scope.isEmpty = false;
                    $scope.questions = result;
                }
                else {
                    $scope.isEmpty = true;
                }
                $scope.loadedCategory = true;
            }, function(error){
                console.log(error);
            });*/
            
        }, function(error){
            console.log(error);                    
        });
    
    };
    
}]);