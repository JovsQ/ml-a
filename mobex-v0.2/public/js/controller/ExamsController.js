app.controller('ExamsController', ['$scope', '$timeout', '$uibModal', 'databaseService', function($scope, $timeout, $uibModal, databaseService){
    
    $scope.pagination = {
        currentPage: 1,
        pageMaxSize: 5,
        totalItems: 0,
        itemsPerPage: 5
    };
    
    $scope.filteredExams = [];
    var animationsEnabled = true;
    $scope.exams = [];
    $scope.isEmpty = false;
    $scope.alerts = [];
    
    $scope.$watch('pagination.itemsPerPage', function(newval, oldval) {
       if(newval != oldval) {
           $scope.filterExams();
       }
    });
    
    var clearOneAlert = function() {
        if($scope.alerts.length > 0) {
            $scope.alerts.splice(0, 1);
        }
    }
    
    var timeoutLength = 4000;
    
    $scope.$watch('alerts.length', function(newval, oldval){
        if(newval != 0) {
            $timeout(clearOneAlert, timeoutLength);
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
        $scope.filterExams();
    };
    
    $scope.loadExams = function(){
        $scope.loadedExams = false;
        databaseService.getAllExams().then(function(result){
            if(result.length > 0){
                $scope.isEmpty = false;
                $scope.exams = result;
                $scope.pagination.totalItems = $scope.exams.length;
                $scope.filterExams();
            }
            else {
                $scope.isEmpty = true;
            }
            $scope.loadedExams = true;
        }, function(error){
            console.log(error);
        });
    };
    
    $scope.filterExams = function() {
        $scope.filteredExams = [];
        var startIndex = ($scope.pagination.currentPage-1)*$scope.pagination.itemsPerPage;
        
        for(var i = 0; i < $scope.pagination.itemsPerPage; i++) {
            if($scope.exams[startIndex+i]) {
                $scope.filteredExams.push($scope.exams[startIndex+i]);
            }
        }
        
    };
    
    $scope.addExam = function(){
        databaseService.addExamSet().then(function(result){
            $scope.loadExams();
        }, function(error){
           console.log(error); 
        });
    }
    
    $scope.addExamModal = function () {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'addExamComponent',
          resolve: {
              alerts: function(){
                  return $scope.alerts;
              },
              exams: function () {
                  return $scope.exams;
              }
          }
        });

        modalInstance.result.then(function () {
            // after add operation reload all exams
            $scope.loadExams();
        }, function () {
        });
    };
    
    $scope.openEditModal = function (key, exam) {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'editExamComponent',
          resolve: {
            key: function () {
              return key;
            },
            exam: function() {
                return exam;
            },
            alerts: function () {
                return $scope.alerts;
            },
            exams: function () {
              return $scope.exams;
            }
          }
        });

        modalInstance.result.then(function () {
            // after edit operation reload all exams
            $scope.loadExams();
        }, function () {
        });
    };
    
    $scope.openDeleteModal = function ($index, key) {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'deleteExamComponent',
          resolve: {
            key: function () {
              return key;
            },
            alerts: function () {
                return $scope.alerts;
            },
            exams: function () {
              return $scope.exams;
            },
            index: function () {
                return $index;
            }
          }
        });

        modalInstance.result.then(function () {
            // after delete operation reload all categories
            $scope.loadExams();
        }, function () {
        });
    };

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
}]);