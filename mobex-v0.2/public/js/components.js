/* COMPONENTS */

// Add category modal
app.component('addCategoryComponent', {
  templateUrl: 'views/addCategoryModal.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (databaseService, $scope) {
    var $ctrl = this;
      
    $ctrl.$onInit = function(){
        $ctrl.categoryDesc  = '';
        $ctrl.categoryName = '';
        $ctrl.timeLimit = 0;
    }

    var saveCategory = function(){
        $ctrl.categories = [];
        
        if($ctrl.categoryDesc.length > 0 && $ctrl.categoryName.length > 0 && $ctrl.timeLimit > 0){
            databaseService.checkIfCategoryExists($ctrl.categoryName).then(function(exist){
                if(!exist) { 
                    databaseService.checkIfSubcategoryExists($ctrl.categoryName).then(function(existSub){
                        if(!existSub) {
                           databaseService.addCategory($ctrl.categoryDesc, $ctrl.categoryName, $ctrl.timeLimit).then(function(result){
                                $ctrl.categoryDesc = "";
                                $ctrl.categoryName = "";
                                $ctrl.timeLimit = "";
                                $ctrl.close();
                                $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Successfully added category.'});

                            }, function(error){
                                console.log(error);
                            });
                        }
                        else {
                            $ctrl.close();
                            $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: 'A category with the same name already exists.'});
                        }
                    }, function(error) {
                        console.log(error);
                    });
                    
                    
                } 
                else {
                    $ctrl.close();
                    $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: 'A category with the same name already exists.'});
                }
                
            }, function(error) {
                console.log(error);
            });
            
            console.log("save");
            
            
        }
    };

    $ctrl.ok = function () {
        saveCategory();
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});

// Add subcategory modal
app.component('addSubcategoryComponent', {
  templateUrl: 'views/addSubcategoryModal.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (databaseService, $scope) {
    var $ctrl = this;

    $ctrl.$onInit = function(){
        $ctrl.categories = $ctrl.resolve.categories;
        $ctrl.subcategoryDesc = '';
        $ctrl.subcategoryName = '';
        //$ctrl.parentCategory = '';
    }
      
    var saveSubcategory = function(){
        
        if($ctrl.subcategoryDesc.length > 0 && $ctrl.subcategoryName.length > 0 && $ctrl.parentCategory){
            
            databaseService.checkIfCategoryExists($ctrl.subcategoryName).then(function(exist){
                if(!exist) {
                    databaseService.checkIfSubcategoryExists($ctrl.subcategoryName).then(function(existSub){
                        if(!existSub) {
                            $ctrl.parentCategory = $ctrl.parentCategory.category_name;
                            databaseService.addSubcategory($ctrl.subcategoryDesc, $ctrl.subcategoryName, $ctrl.parentCategory).then(function(result){
                                $ctrl.subcategoryDesc = "";
                                $ctrl.subcategoryName = "";
                                $ctrl.parentCategory = "";
                                $ctrl.close();
                                $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Successfully added subcategory.'});

                            }, function(error){
                                console.log(error);
                            });
                        }
                        else {
                            $ctrl.close();
                            $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: 'A category with the same name already exists.'});
                        }
                    }, function(error) {
                        console.log(error);
                    });
                } 
                else {
                    $ctrl.close();
                    $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: 'A category with the same name already exists.'});
                }
                
            }, function(error) {
                console.log(error);
            });
            
            
        }
    };

    $ctrl.ok = function () {
        saveSubcategory();
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});
    
// Delete category modal
app.component('deleteCategoryComponent', {
  templateUrl: 'views/deleteCategoryModal.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (databaseService, $scope) {
    var $ctrl = this;
      
    var deleteCategory = function(){
        $ctrl.categories = [];
        databaseService.deleteCategory($ctrl.resolve.key).then(function(result){
            $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Category successfully deleted.'});
            $ctrl.close();
            databaseService.getAllCategories().then(function(result){
                $ctrl.resolve.categories = result;
            }, function(error){
                console.log(error);
            });
        }, function(error){
           console.log(error); 
        });
    };

    $ctrl.ok = function () {
        if($ctrl.resolve.category.subcategories && $ctrl.resolve.category.subcategories.length > 0) {
            $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: 'Please delete its subcategories first.'});
            $ctrl.close();
        }
        else {
            deleteCategory();
        }
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});

// Delete subcategory modal
app.component('deleteSubcategoryComponent', {
    // same delete modal
  templateUrl: 'views/deleteCategoryModal.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (databaseService, $scope) {
    var $ctrl = this;
      
    var deleteCategory = function(){
        $ctrl.categories = [];
        databaseService.deleteSubcategory($ctrl.resolve.key).then(function(result){
            $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Subcategory successfully deleted.'});
            $ctrl.close();
            databaseService.getAllCategories().then(function(result){
                $ctrl.resolve.categories = result;
            }, function(error){
                console.log(error);
            });
        }, function(error){
           console.log(error); 
        });
    };

    $ctrl.ok = function () {
        if($ctrl.resolve.category.questions > 0) {
            $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: 'Please delete the questions under "'+$ctrl.resolve.category.category_name+'" category first.'});
            $ctrl.close();
        }
        else {
            deleteCategory();
        }
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});

// Edit category modal
app.component('editCategoryComponent', {
  templateUrl: 'views/editCategoryModal.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (databaseService) {
    var $ctrl = this;
    var oldName = "";
    $ctrl.$onInit = function(){
        $ctrl.categoryName = $ctrl.resolve.category.category_name;
        console.log($ctrl.categoryName);
        oldName = $ctrl.categoryName;
        $ctrl.categoryDesc = $ctrl.resolve.category.category_desc;
        $ctrl.timeLimit = $ctrl.resolve.category.time_limit;
    }

    var editCategory = function(){
        databaseService.editCategory($ctrl.resolve.key, $ctrl.categoryName, $ctrl.categoryDesc, $ctrl.timeLimit).then(function(result){
            
            var newName = $ctrl.categoryName;
            databaseService.editSubcategoriesParentCategory(oldName, newName).then(function(editresult){
                $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Category successfully edited and subcategories successfully updated.'});
                $ctrl.close();
            }, function(error) {
                console.log(error);
                $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: error});
                $ctrl.close();
            });
            databaseService.getAllCategories().then(function(result){
                $ctrl.resolve.categories = result;
            }, function(error){
                console.log(error);
            });
        }, function(error){
           console.log(error); 
            $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: error});
            $ctrl.close();
        });
    };

    $ctrl.ok = function () {
        editCategory();
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});

// Edit subcategory modal
app.component('editSubcategoryComponent', {
  templateUrl: 'views/editSubcategoryModal.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (databaseService) {
    var $ctrl = this;
    var oldName = '';
      
    $ctrl.$onInit = function(){
        $ctrl.categoryName = $ctrl.resolve.subcategory.category_name;
        oldName = $ctrl.categoryName;
        $ctrl.categoryDesc = $ctrl.resolve.subcategory.category_desc;
        $ctrl.parentCategory = $ctrl.resolve.subcategory.parent_category;
        $ctrl.categories = $ctrl.resolve.categories;
    }

    var editSubcategory = function(){
        
        if(typeof $ctrl.parentCategory == 'object') {
            $ctrl.parentCategory = $ctrl.parentCategory.category_name;
        }
        databaseService.editSubcategory($ctrl.resolve.key, $ctrl.categoryDesc, $ctrl.categoryName, $ctrl.parentCategory).then(function(result){
            
            var newName = $ctrl.categoryName;
            databaseService.editQuestionsCategoryName(oldName, newName).then(function(result){
                $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Subcategory successfully edited and questions successfully updated.'});
                $ctrl.close();
            }, function(error) {
                console.log(error);
                $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: error});
                $ctrl.close();
            });
            
            databaseService.getAllCategories().then(function(result){
                $ctrl.resolve.categories = result;
            }, function(error){
                console.log(error);
            });
        }, function(error){
            console.log(error); 
            $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: error});
                $ctrl.close();
        });
    };

    $ctrl.ok = function () {
        editSubcategory();
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});

// Delete question modal
app.component('deleteQuestionComponent', {
  templateUrl: 'views/deleteQuestionModal.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (databaseService, $scope) {
    var $ctrl = this;
      
    var deleteQuestion = function(){
        $ctrl.categories = [];
        databaseService.deleteQuestion($ctrl.resolve.key).then(function(result){
            $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Question successfully deleted.'});
            $ctrl.close();
            databaseService.getAllQuestions("category_name").then(function(result){
                $ctrl.resolve.questions = result;
            }, function(error){
                console.log(error);
            });
        }, function(error){
           console.log(error); 
        });
    };

    $ctrl.ok = function () {
        deleteQuestion();
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});

// Add exam modal
app.component('addExamComponent', {
  templateUrl: 'views/addExamModal.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (databaseService, $scope) {
    var $ctrl = this;

    var saveExam = function(){
        $ctrl.exams = [];
        if($ctrl.examName.length > 0 && $ctrl.examDesc.length > 0){
            databaseService.addExamSet($ctrl.examName, $ctrl.examDesc).then(function(result){
                $ctrl.examName = "";
                $ctrl.examDesc = "";
                $ctrl.close();
                $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Successfully added exam set.'});
            }, function(error){
                console.log(error);
            });
        }
    };

    $ctrl.ok = function () {
        saveExam();
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});

// Edit exam modal
app.component('editExamComponent', {
  templateUrl: 'views/editExamModal.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (databaseService) {
    var $ctrl = this;
      
    $ctrl.$onInit = function(){
        $ctrl.examName = $ctrl.resolve.exam.name;
        $ctrl.examDesc = $ctrl.resolve.exam.description;
    }

    var editExam = function(){
        databaseService.editExam($ctrl.resolve.key, $ctrl.examName, $ctrl.examDesc).then(function(result){
            $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Exam set successfully edited.'});
            $ctrl.close();
            databaseService.getAllExams().then(function(result){
                $ctrl.resolve.exams = result;
            }, function(error){
                console.log(error);
            });
        }, function(error){
           console.log(error); 
        });
    };

    $ctrl.ok = function () {
        editExam();
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});

// Delete exam modal
app.component('deleteExamComponent', {
  templateUrl: 'views/deleteExamModal.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (databaseService, $scope) {
    var $ctrl = this;
      
    var deleteExam = function(){
        $ctrl.exams = [];
        databaseService.deleteExam($ctrl.resolve.key).then(function(result){
            $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Exam successfully deleted.'});
            $ctrl.close();
            databaseService.getAllExams().then(function(result){
                $ctrl.resolve.exams = result;
            }, function(error){
                console.log(error);
            });
        }, function(error){
           console.log(error); 
        });
    };

    $ctrl.ok = function () {
        deleteExam();
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});

// Add applicant modal
app.component('addApplicantComponent', {
  templateUrl: 'views/addApplicantModal.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (databaseService, $scope) {
    var $ctrl = this;

    var saveApplicant = function() {
        if($.trim($ctrl.applicantName) != '' && $.trim($ctrl.applicantEmail) != '' && $.trim($ctrl.applicantCode) != '') {
            databaseService.addApplicant($ctrl.applicantName, $ctrl.applicantEmail, $ctrl.applicantCode).then(function(result){
                $ctrl.applicantName = "";
                $ctrl.applicantEmail = "";
                $ctrl.close();
                $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Successfully added applicant.'});
                
            }, function(error){
                console.log(error); 
                $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: error});
            });
        }
    };
      
    $ctrl.generateCode = function() {
          $ctrl.applicantCode = randomString(6);
    };
      
    var randomString = function(length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    }

    $ctrl.ok = function () {
        saveApplicant();
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});

app.component('editApplicantComponent', {
    templateUrl: 'views/editApplicantModal.html',
    bindings: {
        resolve: '<',
        close: '&',
        dismiss: '&'
    },
    controller: function (databaseService) {
        var $ctrl = this;

        $ctrl.$onInit = function(){
            $ctrl.applicantName = $ctrl.resolve.applicantName;
            $ctrl.applicantNewEmail = $ctrl.resolve.applicantEmail;
            $ctrl.applicantOldEmail = $ctrl.resolve.applicantEmail;
            $ctrl.applicantCode = $ctrl.resolve.applicantCode;
            $ctrl.applicantKey = $ctrl.resolve.key;
        }

        var editApplicant = function(){
            console.log("edit applicant");
            console.log("old email " + $ctrl.applicantOldEmail);
            console.log("new email " + $ctrl.applicantNewEmail);
            
            databaseService.editApplicant($ctrl.applicantKey, $ctrl.applicantName, $ctrl.applicantOldEmail, $ctrl.applicantCode, $ctrl.applicantNewEmail).then(function(result){
                $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Applicant successfully edited.'});
                $ctrl.close();
                
            }, function(error){
                console.log(error);
                $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: 'Error editing applicant. ERROR: ' + error});
                $ctrl.close();
            });
            
        };

        $ctrl.ok = function () {
            editApplicant();
        };

        $ctrl.cancel = function () {
          $ctrl.dismiss({$value: 'cancel'});
        };
      }
});

app.component('deleteApplicantComponent', {
    templateUrl: 'views/deleteApplicantModal.html',
    bindings: {
        resolve: '<',
        close: '&',
        dismiss: '&'
    },
    controller: function (databaseService, $scope) {
        var $ctrl = this;

        var deleteApplicant = function(){
            $ctrl.exams = [];
            databaseService.deleteApplicant($ctrl.resolve.key, $ctrl.resolve.applicantEmail, $ctrl.resolve.applicantCode).then(function(result){
                $ctrl.resolve.alerts.push({type: 'alert alert-success', msg: 'Applicant successfully deleted.'});
                $ctrl.close();
            }, function(error){
                console.log(error); 
                $ctrl.resolve.alerts.push({type: 'alert alert-danger', msg: 'Error deleting applicant. ERROR: ' + error});
                $ctrl.close();
            });
        };

        $ctrl.ok = function () {
            deleteApplicant();
        };

        $ctrl.cancel = function () {
          $ctrl.dismiss({$value: 'cancel'});
        };
      }
});