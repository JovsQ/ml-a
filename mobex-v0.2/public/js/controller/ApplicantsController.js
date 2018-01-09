app.controller('ApplicantsController', ['$scope', '$uibModal', 'databaseService', function($scope, $uibModal, databaseService){
    
    $scope.pagination = {
        currentPage: 1,
        pageMaxSize: 5,
        totalItems: 0,
        itemsPerPage: 25
    };
    
    var animationsEnabled = true;
    $scope.applicants = [];
    $scope.allApplicants = [];
    $scope.isEmpty = false;
    $scope.searchQuery = {};
    $scope.searchQuery.query = '';
    $scope.alerts = [];
    
    // used for sort
    // used in this way in ng-repeat, eg. applicant in filteredApplicants  | orderBy:sortPropertyName:reverseSort
    // but not used anymore since it should be sorted always by "date_added" (the time the applicant was added in the dashboard)
    // array.sort() is used instead
    $scope.reverseSort = true;
    $scope.sortPropertyName = 'date_added';
    $scope.sortBy = function(propertyName) {
        $scope.sortPropertyName = propertyName;
        $scope.reverseSort = !$scope.reverseSort;
    };
    
    $scope.$watch('pagination.itemsPerPage', function(newval, oldval) {
       if(newval != oldval) {
           $scope.filterApplicants();
       }
    });
    
    $scope.pageChanged = function() {
        $scope.filterApplicants();
    };
    

    
    $scope.loadApplicants = function(){
        $scope.loadedApplicants = false;
        databaseService.getListOfApplicants().then(function(result){
            if(result.length > 0) {
                $scope.isEmpty = false;
                result.sort(sortDateAdded);
                $scope.applicants = result;
                $scope.allApplicants = result;
                $scope.pagination.totalItems = $scope.applicants.length;
                $scope.filterApplicants();
            }
            else {
                $scope.isEmpty = true;
            }
            $scope.loadedApplicants = true;
        }, function(error){
            console.log(error);
        });
    };
    
    var sortDateAdded = function(a, b) {
      return new Date(b.date_added) - new Date(a.date_added);  
    };
    
    // current does not search like '%query%', only searches by single keyword
    // Will be slow once the number of applicants becomes very big
    $scope.searchApplicant = function() {
        var query = $scope.searchQuery.query;
        if ( $.trim(query) == '' ) {
            $scope.applicants = $scope.allApplicants;
            $scope.filterApplicants();
            return;
        }
        var results = [];
        query = query.toLowerCase();
        
        for(var i = 0; i < $scope.allApplicants.length; i++) {
            var applicant = $scope.allApplicants[i];
            
            if(applicant.name.toLowerCase() == query || (applicant.exam_result && applicant.exam_result.toLowerCase() == query) || (applicant.position_applying_for && applicant.position_applying_for.toLowerCase() == query) || (applicant.exam_date && applicant.exam_date.toLowerCase() == query)) {
                results.push(applicant);
                continue;
            }
            
            var name = applicant.name.split(/[ ]+/);
            var position = (typeof applicant.position_applying_for != 'undefined')?applicant.position_applying_for.split(/[ ]+/):[];
            var examResult = (typeof applicant.exam_result != 'undefined')?applicant.exam_result.split(/[ ]+/):[];
            
            
            if(name.length && name.length > 0) {
                for(var j = 0; j < name.length; j++) {
                    if(name[j].toLowerCase() == query) {
                        results.push(applicant);
                        continue;
                    }
                }
            }
            if((typeof applicant.location != 'undefined' && query == applicant.location.name) || 
                    query == applicant.gender || query == applicant.email){
                results.push(applicant);
                continue;
            }
            else if(position.length > 0) {
                for(var j = 0; j < position.length; j++) {
                    if(position[j].toLowerCase() == query) {
                        results.push(applicant);
                        continue;
                    }
                }
            }
            
            // exam result
            if(examResult.length && examResult.length > 0) {
                var matchExamResult = false;
                for(var j = 0; j < examResult.length; j++) {
                    if(examResult[j].toLowerCase() == query) {
                        matchExamResult = true;
                        results.push(applicant);
                        break;
                    }
                }
                if(matchExamResult) {
                    continue;
                }
            }
            
        }
        
        $scope.applicants = results;
        $scope.pagination.totalItems = results.length;
        $scope.filterApplicants();
    };
    
    $scope.filterApplicants = function() {
        $scope.filteredApplicants = [];
        var startIndex = ($scope.pagination.currentPage-1)*$scope.pagination.itemsPerPage;
        
        for(var i = 0; i < $scope.pagination.itemsPerPage; i++) {
            if($scope.applicants[startIndex+i]) {
                $scope.filteredApplicants.push($scope.applicants[startIndex+i]);
            }
        }
        
    };
    
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
    
    $scope.addApplicantModal = function() {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'addApplicantComponent',
          resolve: {
              alerts: function(){
                  return $scope.alerts;
              }
          }
        });

        modalInstance.result.then(function () {
            console.log("load applicant");
            // after add operation reload all categories
            $scope.applicants = [];
            $scope.allApplicants = [];
            $scope.loadApplicants();
        }, function () {
        });
    };
    
    $scope.openEditModal = function (key, applicantEmail, applicantName, applicantCode) {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'editApplicantComponent',
          resolve: {
            key: function () {
              return key;
            },
            applicantEmail: function() {
                return applicantEmail;
            },
            applicantName: function() {
                return applicantName;
            },
            applicantCode: function() {
                return applicantCode;
            },
            alerts: function () {
                return $scope.alerts;
            }
          }
        });

        modalInstance.result.then(function () {
            // after edit operation reload all applicants
            $scope.loadApplicants();
        }, function () {
        });
    };
    
    $scope.openDeleteModal = function (key, applicantEmail, applicantCode) {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'deleteApplicantComponent',
          resolve: {
            key: function () {
              return key;
            },
            applicantEmail: function() {
                return applicantEmail;
            },
            applicantCode: function() {
                return applicantCode;
            },
            alerts: function () {
                return $scope.alerts;
            }
          }
        });

        modalInstance.result.then(function () {
            // after delete operation reload all applicants
            $scope.loadApplicants();
        }, function () {
        });
    };
    
}]);