app.controller('QuestionsController', ['$scope', '$uibModal', 'databaseService', function($scope, $uibModal, databaseService){
    
    $scope.pagination = {
        currentPage: 1,
        pageMaxSize: 5,
        totalItems: 0,
        itemsPerPage: 5
    };
    
    var animationsEnabled = true;
    
    $scope.filteredQuestions = [];
    $scope.questions = [];
    $scope.allQuestions = [];
    $scope.isEmpty = false;
    $scope.alerts = [];
    $scope.searchQuery = {};
    $scope.searchQuery.query = '';
    
    $scope.$watch('pagination.itemsPerPage', function(newval, oldval) {
       if(newval != oldval) {
           $scope.filterQuestions();
       }
    });
    
    // used for sort
    $scope.reverseSort = false;
    $scope.sortPropertyName = '';
    $scope.sortBy = function(propertyName) {
        $scope.sortPropertyName = propertyName;
        $scope.reverseSort = !$scope.reverseSort;
    };
    
    $scope.pageChanged = function() {
        $scope.filterQuestions();
    };
    
    $scope.openQDeleteModal = function (key) {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'deleteQuestionComponent',
          resolve: {
            key: function () {
              return key;
            },
            alerts: function () {
                return $scope.alerts;
            },
            questions: function () {
              return $scope.questions;
            }
          }
        });

        modalInstance.result.then(function () {
            // after add operation reload all questions
            $scope.loadQuestions("category_name");
        }, function () {
        });
    };
    
    // current does not search like '%query%', only searches by single keyword
    // Will be slow once data becomes very big 
    $scope.searchQuestion = function() {
        var query = $scope.searchQuery.query;
        if ( $.trim(query) == '' ) {
            $scope.questions = $scope.allQuestions;
            $scope.pagination.totalItems = $scope.questions.length;
            $scope.filterQuestions();
            return;
        }
        query = query.toLowerCase();
        
        var results = [];
        
        for(var i = 0; i < $scope.allQuestions.length; i++) {
            var question = $scope.allQuestions[i];
            
            // whole string
            if(question.set.toLowerCase() == query || question.category_name.toLowerCase() == query || question.level.toLowerCase() == query || question.type.toLowerCase() == query) {
                results.push(question);
                continue;
            }
            
            // individual string split by spaces
            var exam_set = question.set.split(/[ ]+/);
            var category_name = question.category_name.split(/[ ]+/);  
            var theQuestion = question.question.split(/[ ]+/);
            
            
            // exam set
            if(exam_set.length && exam_set.length > 0) { 
                var matchExamSet = false;
                for(var j = 0; j < exam_set.length; j++) {
                    if(exam_set[j].toLowerCase() == query) {
                        matchExamSet = true;
                        results.push(question);
                        break;
                    }
                }
                if(matchExamSet) {
                    continue;
                }
            }
            // category
            if(category_name.length && category_name.length > 0) {
                var matchCategory = false;
                for(var j = 0; j < category_name.length; j++) {
                    if(category_name[j].toLowerCase() == query) {
                        matchCategory = true;
                        results.push(question);
                        break;
                    }
                }
                if(matchCategory) {
                    continue;
                }
            }
            
            
            // question
            if(theQuestion.length && theQuestion.length > 0) {
                var matchQuestion = false;
                for(var j = 0; j < theQuestion.length; j++) {
                    if(theQuestion[j].toLowerCase() == query) {
                        matchQuestion = true;
                        results.push(question);
                        break;
                    }
                }
                if(matchQuestion) {
                    continue;
                }
            }
            
            
            
        }
        
        $scope.questions = results;
        $scope.pagination.totalItems = results.length;
        $scope.filterQuestions();
    };
    
    $scope.filterQuestions = function() {
        $scope.filteredQuestions = [];
        var startIndex = ($scope.pagination.currentPage-1)*$scope.pagination.itemsPerPage;
        
        for(var i = 0; i < $scope.pagination.itemsPerPage; i++) {
            if($scope.questions[startIndex+i]) {
                $scope.filteredQuestions.push($scope.questions[startIndex+i]);
            }
        }
        
    };
     
    $scope.loadQuestions = function(){
        $scope.questions = [];
        $scope.loadedQuestions = false;
        databaseService.getAllQuestions("category_name").then(function(result){
            if(result.length > 0){
                $scope.isEmpty = false;
                $scope.questions = result;
                $scope.allQuestions = result;
                $scope.pagination.totalItems = $scope.questions.length;
                $scope.filterQuestions();
            }
            else {
                $scope.isEmpty = true;
            }
            $scope.loadedQuestions = true;
        }, function(error){
            console.log(error);
        });
    };
    
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
    
}]);