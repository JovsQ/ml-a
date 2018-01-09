app.controller('CategoriesController', ['$scope', '$q', '$timeout', '$uibModal', 'databaseService', 'orderByFilter', function($scope, $q, $timeout, $uibModal, databaseService, orderBy){
    
    $scope.pagination = {
        currentPage: 1,
        pageMaxSize: 5,
        totalItems: 0,
        itemsPerPage: 5
    };
    
    var animationsEnabled = true;
    
    $scope.categories = [];
    $scope.categoriesAndSubcategories = [];
    $scope.isEmpty = false;
    
    $scope.alerts = [/*{ type: 'alert alert-danger', msg: 'Oh snap! Change a few things up and try submitting again.' }*/];
    
    $scope.$watch('pagination.itemsPerPage', function(newval, oldval) {
       if(newval != oldval) {
           $scope.filterCategories();
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
        
        $scope.categories = orderBy($scope.categories, $scope.sortPropertyName, $scope.reverseSort);
        putTogetherCategoriesAndSubcategories();
        
        $scope.filterCategories();
    };
    
    var putTogetherCategoriesAndSubcategories = function() {
        $scope.categoriesAndSubcategories = [];
        var totalItems = 0;
        for(var i = 0; i < $scope.categories.length; i++) {
            $scope.categoriesAndSubcategories.push($scope.categories[i]);
            totalItems++;
            if($scope.categories[i].subcategories) {
                for(var j = 0; j < $scope.categories[i].subcategories.length; j++) {
                    $scope.categories[i].subcategories[j].isSubcategory = true;
                    $scope.categories[i].subcategories[j].category_key = $scope.categories[i].key;
                    $scope.categoriesAndSubcategories.push($scope.categories[i].subcategories[j]);
                    totalItems++;
                }
            }
        }
        $scope.pagination.totalItems = totalItems;
    };
    
    $scope.pageChanged = function() {
        $scope.filterCategories();
    };
    
    $scope.loadCategories = function(){
        $scope.categories = [];
        $scope.categoriesAndSubcategories = [];
        $scope.categoryCount = databaseService.categoryCount;
        $scope.loadedCategories = false;    
        var questionPromises = [];
        databaseService.getAllCategories().then(function(result){
            if(result.length > 0){
                $scope.isEmpty = false;
                $scope.categories = result;
                //$scope.pagination.totalItems = $scope.categories.length;
                putTogetherCategoriesAndSubcategories();
                $scope.filterCategories();
            }
            else {
                $scope.isEmpty = true;
            }
            $scope.loadedCategories = true;
            for(var i = 0; i < $scope.categories.length; i++) {
                questionPromises.push(databaseService.getQuestionsFromCategory($scope.categories[i].category_name));
            }

            $q.all(questionPromises).then(function(result) {
                for(var i = 0; i < result.length; i++) {
                    $scope.categories[i].questions = result[i][1].length;
                }
                
                var subcatQuestionPromises = [];
                for(var i = 0; i < $scope.categories.length; i++) {
                    if($scope.categories[i].subcategories) {
                        for(var j = 0; j < $scope.categories[i].subcategories.length; j++) {
                            subcatQuestionPromises.push(databaseService.getQuestionsFromCategory($scope.categories[i].subcategories[j].category_name));
                        }
                    }
                }
                
                $q.all(subcatQuestionPromises).then(function(subcatQuestionResult){
                    for(var i = 0; i < subcatQuestionResult.length; i++) {
                        
                        // attach to categories' subcategories the length of questions
                        for(var j = 0; j < $scope.categories.length; j++) {
                            if($scope.categories[j].subcategories) {
                                for(var k = 0; k < $scope.categories[j].subcategories.length; k++) {
                                    if(subcatQuestionResult[i][0] == $scope.categories[j].subcategories[k].category_name) {
                                        $scope.categories[j].subcategories[k].questions = subcatQuestionResult[i][1].length;
                                    }
                                }
                            }
                        }
                    }
                });
                
            }, function(error) {
                //console.log(error);
            });
        }, function(error){
            console.log(error);
        });
        
    };
    
    $scope.filterCategories = function() {
        $scope.filteredCategories = [];
        var startIndex = ($scope.pagination.currentPage-1)*$scope.pagination.itemsPerPage;
        
        for(var i = 0; i < $scope.pagination.itemsPerPage; i++) {
            if($scope.categoriesAndSubcategories[startIndex+i]) {
                $scope.filteredCategories.push($scope.categoriesAndSubcategories[startIndex+i]);
            }
        }
    };
    
    $scope.openAddModal = function () {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'addCategoryComponent',
          resolve: {
              alerts: function(){
                  return $scope.alerts;
              },
              categories: function () {
                  return $scope.categories;
              }
          }
        });

        modalInstance.result.then(function () {
            // after add operation reload all categories
            $scope.loadCategories();
        }, function () {
        });
    };
    
    $scope.openAddSubcategoryModal = function() {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'addSubcategoryComponent',
          resolve: {
              alerts: function(){
                  return $scope.alerts;
              },
              categories: function () {
                  return $scope.categories;
              }
          }
        });

        modalInstance.result.then(function () {
            // after add operation reload all categories
            $scope.loadCategories();
        }, function () {
        });
    };
    
    $scope.openEditModal = function (key, category) {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'editCategoryComponent',
          resolve: {
            key: function () {
              return key;
            },
            category: function() {
                return category;
            },
            alerts: function () {
                return $scope.alerts;
            },
            categories: function () {
              return $scope.categories;
            }
          }
        });

        modalInstance.result.then(function () {
            // after edit operation reload all categories
            $scope.loadCategories();
        }, function () {
        });
    };
    
    $scope.openEditSubcategoryModal = function (key, subcategory) {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'editSubcategoryComponent',
          resolve: {
            key: function () {
              return key;
            },
            subcategory: function() {
                return subcategory;
            },
            alerts: function () {
                return $scope.alerts;
            },
            categories: function () {
              return $scope.categories;
            }
          }
        });

        modalInstance.result.then(function () {
            // after edit operation reload all categories
            $scope.loadCategories();
        }, function () {
        });
    };
    
    $scope.openDeleteModal = function (key, category) {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'deleteCategoryComponent',
          resolve: {
            key: function () {
              return key;
            },
            alerts: function () {
                return $scope.alerts;
            },
            categories: function () {
              return $scope.categories;
            },
            category: function() {
                return category;
            }
          }
        });

        modalInstance.result.then(function () {
            // after delete operation reload all categories
            $scope.loadCategories();
        }, function () {
        });
    };
    
    $scope.openDeleteSubcategoryModal = function(key, category) {
        var modalInstance = $uibModal.open({
          animation: animationsEnabled,
          component: 'deleteSubcategoryComponent',
          resolve: {
            key: function () {
              return key;
            },
            alerts: function () {
                return $scope.alerts;
            },
            categories: function () {
              return $scope.categories;
            },
            category: function() {
                return category;
            }
          }
        });

        modalInstance.result.then(function () {
            // after delete operation reload all categories
            $scope.loadCategories();
        }, function () {
        });
    };

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
    
}]);