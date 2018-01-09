app.controller('HomeController', ['$scope', '$location', '$q', 'databaseService', 'AuthService', function($scope, $location, $q, databaseService, AuthService){
    
    $scope.showDownloadURL = false;
    $scope.downloadURL = '';
    $scope.fileName = '';
    $scope.creatingFile = false;
    
    $scope.loadCategories = function(){
        $scope.categories = [];
        $scope.loadedCategoryCount = false;
        databaseService.getAllCategories().then(function(result){
            $scope.categories = result;
            $scope.categoryCount = databaseService.categoryCount;
            $scope.loadedCategoryCount = true;
            
            var questionPromises = [];
            for(i = 0; i < $scope.categories.length; i++) {
                questionPromises.push(databaseService.getQuestionsFromCategory($scope.categories[i].category_name));
            }
            
            $q.all(questionPromises).then(function(result) {
                for(i = 0; i < result.length; i++) {
                    $scope.categories[i].questions = result[i][1].length;
                }
            }, function(error) {
                //console.log(error);
            });
            
            $scope.user = AuthService.user;
            
        }, function(error){
        });
    };
    
    $scope.loadQuestions = function(){
        $scope.questions = [];
        $scope.loadedQuestionCount = false;
        databaseService.getAllQuestions("category_name").then(function(result){
            $scope.questions = result;
            $scope.questionCount = databaseService.questionCount;
            $scope.loadedQuestionCount = true;
        }, function(error){
            console.log(error);
        })    
    };
    
    $scope.loadApplicants = function(){
        $scope.loadedApplicantCount = false;
        databaseService.getListOfApplicants().then(function(result){
           $scope.applicantCount = result.length;
            $scope.loadedApplicantCount = true;
        }, function(error){
            console.log(error);
        });
    };
    
    $scope.loadExams = function(){
        $scope.loadedExamCount = false;
        databaseService.getAllExams().then(function(result){
            $scope.examCount = result.length;
            $scope.loadedExamCount = true;
        }, function(error){
            console.log(error);
        });
    };
    
    $scope.createBackup = function() {
        $scope.creatingFile = true;
        databaseService.getAllData().then(function(result) {
            var jsonString = JSON.stringify(result);
            var file = new Blob([jsonString], {type:'text/plain'});
            
            // IE10+
            if(window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(file, filename);
            }
            else {
                var url = URL.createObjectURL(file);
                $scope.showDownloadURL = true;
                $scope.downloadURL = url;
                $scope.fileName = "idt-mobile-exam-backup.txt";
            }
            $scope.creatingFile = false;
        }, function(error) {
            console.log(error);
        });  
    };
    
    
}]);