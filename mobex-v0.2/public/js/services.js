/* SERVICES */

// Service for queries on categories & questions
app.service("databaseService", ['$q', '$location', 'AuthService', function($q, $location, AuthService){
	var self = this;
    var categoryRef = firebase.database().ref('category/');
    var subcategoryRef = firebase.database().ref('subcategory/');
    var questionRef = firebase.database().ref('question/');
    var examRef = firebase.database().ref('exam/');
    var applicantRef = firebase.database().ref('applicant/');
    
    /* CATEGORY-RELATED QUERIES */
    
	this.getAllCategories = function() {
 		var deferred = $q.defer();
        
		categoryRef.on("value", function(snapshot) {
            var subcategoryPromises = [];
            var categories = [];
            //for each category get its properties
			snapshot.forEach(function(childSnapshot) {
                var category = [];
                category.category_name = childSnapshot.val().category_name;
                category.category_desc = childSnapshot.val().category_desc;
                category.time_limit = childSnapshot.val().time_limit;
                category.key = childSnapshot.key;
				categories.push(category);
                subcategoryPromises.push(self.getSubcategories(category.category_name));
			});
            $q.all(subcategoryPromises).then(function(result) {
                // attach the subcategories to their parent category
                for(var i = 0; i < result.length; i++) {
                    for(var j = 0; j < categories.length; j++) {
                        if(result[i].length > 0 && result[i][0].parent_category == categories[j].category_name) {
                            categories[j].subcategories = result[i];
                        }
                    }
                }
                deferred.resolve(categories);
            });
            self.categoryCount = snapshot.numChildren();
		}, function (error) {
		  	console.log("The read failed: " + error.code);
		});	
        
		return deferred.promise;
	};
    
        
    this.checkIfCategoryExists = function(categoryName) {
        var deferred = $q.defer();
        
        categoryRef.orderByChild("category_name").equalTo(categoryName).once("value", function(categorySnapshot){
            var exist = false;
            categorySnapshot.forEach(function(cat){
                exist = true;
            });
            deferred.resolve(exist);
        }, function(error) {
            console.log("The read failed: " + error.code); 
            deferred.reject(error);
        });
        
        return deferred.promise;
    };
    
    this.checkIfSubcategoryExists = function(subcategoryName) {
         var deferred = $q.defer();
        
        subcategoryRef.orderByChild("category_name").equalTo(subcategoryName).once("value", function(subcategorySnapshot){
            var exist = false;
            subcategorySnapshot.forEach(function(cat){
                exist = true;
            });
            deferred.resolve(exist);
        }, function(error) {
            console.log("The read failed: " + error.code); 
            deferred.reject(error);
        });
        
        return deferred.promise;
    };
    
    this.getSubcategories = function(mainCategory) {
        var deferred = $q.defer();
        subcategoryRef.orderByChild("parent_category").equalTo(mainCategory).once("value", function(subcatSnapshot) {
            var subcategories = [];
            subcatSnapshot.forEach(function(subcat) {
                var subcategory = subcat.val();
                subcategory.key = subcat.key;
                subcategories.push(subcategory);
            });
            deferred.resolve(subcategories);
        }, function(error) {
           console.log("The read failed: " + error.code); 
            deferred.reject(error);
        });
        
        return deferred.promise;
    };
    
    this.getQuestionsFromCategory = function(category_name) {
		var deferred = $q.defer();
        
        questionRef.orderByChild("category_name").equalTo(category_name).once("value", function(questionSnapshot){
            var questionsFromCategory = [];
            // changed to 2d array to know if the category has no questions
            questionsFromCategory.push(category_name);
            questionsFromCategory.push(new Array());
            //console.info(category_name, questionSnapshot.val());
			questionSnapshot.forEach(function(childQuestionSnapshot) {
                questionsFromCategory[1].push(childQuestionSnapshot.val());
			});
			deferred.resolve(questionsFromCategory);
		}, function(error) {
			console.log("The read failed: " + error.code);
            deferred.reject(error);
		});

		return deferred.promise;
	};
    
    this.getQuestionsFromSet = function(exam_name) {
		var deferred = $q.defer();
        
        questionRef.orderByChild("set").equalTo(exam_name).once("value", function(questionSnapshot){
            var questions = [];
            questionSnapshot.forEach(function(childQuestionSnapshot) {
				questions.push(childQuestionSnapshot);
			});
			deferred.resolve(questions);
		}, function(error) {
			console.log("The read failed: " + error.code);
		});

		return deferred.promise;
	};
    
    this.addApplicant = function(applicantName, applicantEmail, applicantCode) {
        var deferred = $q.defer();

        AuthService.createUser(applicantEmail, applicantCode, true).then(function(result){
            var applicant = {
                applicant_name: applicantName,
                email: applicantEmail,
                code: applicantCode,
                date_added: (new Date()).toString()
            };
            
            var onComplete = function(error) {
            if (error) {
                deferred.reject(error.message);
            } else {
                deferred.resolve("Success");
            }
        };

        applicantRef.push(applicant, onComplete);
            
        }, function(error) {
           deferred.reject(error); 
        });
        
        return deferred.promise;
    };
    
    this.editApplicant = function(applicantKey, applicantName, applicantOldEmail, applicantCode, applicantNewEmail) {
        var deferred = $q.defer();
        var auth = firebase.auth();
        
        // need to log in to update the email
        auth.signInWithEmailAndPassword(applicantOldEmail, applicantCode).then(function(user){
            user.updateEmail(applicantNewEmail).then(function(result){
                console.log("Updated" + applicantName + "'s email");
                
                var oldAuthenticationUser = localStorage.getItem("idtfirebaseapp_username");
                var oldAuthenticationPass = localStorage.getItem("idtfirebaseapp_password");
                
                if(oldAuthenticationUser != null && oldAuthenticationUser != "" && oldAuthenticationUser != "null" && oldAuthenticationPass != null && oldAuthenticationPass != "" && oldAuthenticationPass != "null") {
                    auth.signInWithEmailAndPassword(oldAuthenticationUser, oldAuthenticationPass).then(function(olduser){
                       console.log("Old user logged in");
                    });
                }

                var applicantRef = firebase.database().ref('applicant/'+ applicantKey);
                
                var applicant = {
                    applicant_name: applicantName,
                    email: applicantNewEmail
                };
                
                var onComplete = function(error) {
                    if (error) {
                        deferred.reject(error);
                    } else {
                        var userRef = firebase.database().ref('user/');
                        userRef.once('value', function(snapshot) {
                            var exist = false;

                            snapshot.forEach(function(childSnapshot) {
                                var userObj = childSnapshot.val();
                                if(applicantOldEmail == userObj.username) {
                                    exist = true;

                                    var updateUser = {
                                        username: applicantNewEmail
                                    }
                                    
                                    var userKeyRef = firebase.database().ref('user/'+childSnapshot.key);
                                    
                                    var onUserUpdateComplete = function(errorUserUpdate) {
                                        if(errorUserUpdate) {
                                            deferred.reject(errorUserUpdate.message);
                                        }  else {
                                            deferred.resolve("Edit Applicant Success");
                                        }
                                    };
                                    
                                    userKeyRef.update(updateUser, onUserUpdateComplete);
                                }
                            });
                            if(!exist) {
                                deferred.reject("User " + applicantOldEmail + " does not exist.");
                            }
                        }, function(error) {
                            deferred.reject(error.message);
                        });
                    }
                };
                
                applicantRef.update(applicant, onComplete);

            }, function(error){
                deferred.reject(error.message);
            });
            
        }, function(error){
            deferred.reject(error.message);
        });
        
        return deferred.promise;
    };
    
    this.deleteApplicant = function(applicantKey, applicantEmail, applicantCode) {
        var deferred = $q.defer();
        var auth = firebase.auth();
        auth.signInWithEmailAndPassword(applicantEmail, applicantCode).then(function(user){
            user.delete().then(function() {
                console.log("Deleted " + applicantEmail);
                
                var oldAuthenticationUser = localStorage.getItem("idtfirebaseapp_username");
                var oldAuthenticationPass = localStorage.getItem("idtfirebaseapp_password");
                
                if(oldAuthenticationUser != null && oldAuthenticationUser != "" && oldAuthenticationUser != "null" && oldAuthenticationPass != null && oldAuthenticationPass != "" && oldAuthenticationPass != "null") {
                    auth.signInWithEmailAndPassword(oldAuthenticationUser, oldAuthenticationPass).then(function(olduser){
                        console.log("Old user logged in");
                        $location.path("/applicants");
                        
                        var applicantRef = firebase.database().ref('applicant/'+applicantKey);
                        
                        var onComplete = function(error) {
                            if (error) {
                                deferred.reject(error.message);
                            } else {
                                deferred.resolve("Success");
                                var userRef = firebase.database().ref('user/');
                                userRef.once('value', function(snapshot) {
                                    var exist = false;

                                    snapshot.forEach(function(childSnapshot) {
                                        var userObj = childSnapshot.val();
                                        if(applicantEmail == userObj.username) {
                                            exist = true;

                                            var userKeyRef = firebase.database().ref('user/'+childSnapshot.key);

                                            var onUserDeleteComplete = function(errorDelete) {
                                                if(errorDelete) {
                                                    deferred.reject(errorDelete.message);
                                                }  else {
                                                    deferred.resolve("Delete Applicant Success");
                                                }
                                            };
                                            userKeyRef.remove(onUserDeleteComplete);
                                        }
                                    });
                                    if(!exist) {
                                        deferred.reject("User " + applicantEmail + " does not exist.");
                                    }
                                }, function(error) {
                                    deferred.reject(error.message);
                                });
                            }
                        };

                        applicantRef.remove(onComplete);  
                    });
                }
            }, function(error) {
               deferred.reject(error.message); 
            });
        });

        return deferred.promise;
    };
    
    
    this.getCategory = function(key){
        var ref = firebase.database().ref('category/'+key);
        var deferred = $q.defer();
        
        ref.once("value", function(snapshot){
            var category = [];
            category.key = snapshot.key;
            category.category_name = snapshot.val().category_name;
            category.category_desc = snapshot.val().category_desc;
            category.time_limit = snapshot.val().time_limit;
            deferred.resolve(category);
        }, function(error){
            deferred.reject(error);
        });
        
        return deferred.promise;
    }
    
    this.addCategory = function(categoryDesc, categoryName, timeLimit) {
 		var deferred = $q.defer();

        var category = {
            category_desc: categoryDesc,
            category_name: categoryName,
            time_limit: timeLimit
        };
        
        var onComplete = function(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve("Success");
            }
        };

        categoryRef.push(category, onComplete);
        
        return deferred.promise;
    };
    
    this.editCategory = function(category_key, categoryName, categoryDesc, timeLimit){
        var ref = firebase.database().ref('category/'+category_key);
        var deferred = $q.defer();
        
        var category = {
            category_desc: categoryDesc,
            category_name: categoryName,
            time_limit: timeLimit
        };
        
        var onComplete = function(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve("Success");
            }
        };
        
        ref.update(category, onComplete);
        
        return deferred.promise;        
    }
    
    this.deleteCategory = function(category_key){
        var ref = firebase.database().ref('category/'+category_key);
        var deferred = $q.defer();
        
        var onComplete = function(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve("Success");
            }
        };
        ref.remove(onComplete);        
        
        return deferred.promise;
    };
    
    this.addSubcategory = function(subcategoryDesc, subcategoryName, parentCategory) {
 		var deferred = $q.defer();
        console.log(parentCategory);
        var subcategory = {
            category_desc: subcategoryDesc,
            category_name: subcategoryName,
            parent_category: parentCategory
        };
        
        var onComplete = function(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve("Success");
            }
        };

        subcategoryRef.push(subcategory, onComplete);
        
        return deferred.promise;
    };
    
    this.editSubcategory = function(subcategory_key, subcategoryDesc, subcategoryName, parentCategory) {
        var ref = firebase.database().ref('subcategory/'+subcategory_key);
        var deferred = $q.defer();
        
        var subcategory = {
            category_desc: subcategoryDesc,
            category_name: subcategoryName,
            parent_category: parentCategory
        };
        
        var onComplete = function(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve("Success");
            }
        };
        
        ref.update(subcategory, onComplete);
        
        return deferred.promise;     
    };
    
    this.deleteSubcategory = function(subcategory_key) {
        var ref = firebase.database().ref('subcategory/'+subcategory_key);
        var deferred = $q.defer();
        
        var onComplete = function(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve("Success");
            }
        };
        
        ref.remove(onComplete);        
        
        return deferred.promise;
    };
    
    // edit all subcategories that has the oldName as their parent category and change it to newName
    this.editSubcategoriesParentCategory = function(oldName, newName) {
        var deferred = $q.defer();
        
        subcategoryRef.orderByChild("parent_category").equalTo(oldName).once("value", function(subcatSnapshot) {
            var updates = {};
            subcatSnapshot.forEach(function(subcat){
                var subcatObj = subcat.val();
                subcatObj.parent_category = newName;
                updates[subcat.key] = subcatObj;
            });
            
            subcategoryRef.update(updates, function(error) {
                if(error) {
                    console.log(error);
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(updates);        
                }
            });
                        
        }, function(error) {
            console.log(error);
            deferred.reject(error);
        });
        
        return deferred.promise;
    };
    
    /* QUESTION-RELATED QUERIES */
    
    // choiceType is used for image type of question (text or image choices)
    this.addQuestion = function(theQuestion, questionType, difficulty, theChoices, theAnswer, theCategory, examSet, questionImage, choiceType) {
            var deferred = $q.defer();
        
            var question = {
                question: theQuestion,
                question_image: questionImage || "",
                type: questionType,
                level: difficulty,
                choices: theChoices,
                answer: theAnswer,
                category_name: theCategory,
                set: examSet,
                choice_type: choiceType || "text"
            }
            
            var onComplete = function(error) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve("Success");
                }
            };
            
            questionRef.push(question, onComplete);
        
            return deferred.promise;
    };
    
    this.addFillQuestion = function(theQuestion, questionType, difficulty, theAnswers, theWrongAnswers, theCategory, examSet) {
        var deferred = $q.defer();
        
        var question = {
            question: theQuestion,
            type: questionType,
            level: difficulty,
            answers: theAnswers,
            wrong_answers: theWrongAnswers,
            category_name: theCategory,
            set: examSet
        };
        
        var onComplete = function(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve("Success");
            }
        };
        questionRef.push(question, onComplete);
        
        return deferred.promise;
    };

    this.getAllQuestions = function(orderBy){
        var deferred = $q.defer();

        questionRef.orderByChild(orderBy).once("value", function(questionSnapshot){
            var questionList = [];
            questionSnapshot.forEach(function(childQuestionSnapshot) {
                var question = [];
                question.key = childQuestionSnapshot.key;
                question.id = childQuestionSnapshot.val().question_id;
                question.question = childQuestionSnapshot.val().question;
                question.type = childQuestionSnapshot.val().type;
                question.level = childQuestionSnapshot.val().level;
                question.set = childQuestionSnapshot.val().set;
                question.category_name = childQuestionSnapshot.val().category_name;
                question.answer = childQuestionSnapshot.val().answer;
                question.answers = childQuestionSnapshot.val().answers;
                question.choices = childQuestionSnapshot.val().choices;
                questionList.push(question);
            });
            self.questionCount = questionSnapshot.numChildren();
            deferred.resolve(questionList);
        }, function(error) {
            console.log("The read failed: " + error.code);
        });

        return deferred.promise;
    }
    
    this.getQuestion = function(key){
        var ref = firebase.database().ref('question/'+key);
		var deferred = $q.defer();
        
        ref.once("value", function(snapshot){
            var question = {};
            question.key = snapshot.key;
            var questionSnapshot = snapshot.val();
            
            question.questionContent = questionSnapshot.question;
            question.questionType = questionSnapshot.type;
            if(question.questionType == 'multiple' || question.questionType == 'image') {
                question.correctAnswer = questionSnapshot.answer;
            }
            else if(question.questionType == 'fill') {
                question.answers = [];
                for(var i = 0; i < questionSnapshot.answers.length; i++) {
                    question.answers.push({
                        number: questionSnapshot.answers[i].number,
                        theAnswer: questionSnapshot.answers[i].theAnswer
                    });
                }
                
                question.wrong_answers = [];
                for(var i = 0; i < questionSnapshot.wrong_answers.length; i++) {
                    question.wrong_answers.push(questionSnapshot.wrong_answers[i]);
                }
                
            }
            question.question_image = [];
            if(questionSnapshot.question_image && questionSnapshot.question_image.length) {
                for(var i=0; i < questionSnapshot.question_image.length; i++) {
                    console.log(i);
                    question.question_image.push({
                       name: questionSnapshot.question_image[i] 
                    });
                }
            }
            question.categoryName = questionSnapshot.category_name;
            question.questionLevel = questionSnapshot.level;
            if(question.questionType == 'multiple' || question.questionType == 'image') {
                question.choices = [];
                for(var i=0; i < questionSnapshot.choices.length; i++){
                    var selected = false;
                    if(i == question.correctAnswer) selected = true;
                    question.choices.push({
                        name: questionSnapshot.choices[i],
                        selected: selected
                    });
                }
            }
            question.set = questionSnapshot.set;
            question.typeOfChoices = questionSnapshot.choice_type;
            
            deferred.resolve(question);
        }, function(error){
            deferred.reject(error);
        });
        
        return deferred.promise;
    }
    
    this.editQuestion = function(question_key, theQuestion, questionType, difficulty, theChoices, theAnswer, theCategory) {
            var ref = firebase.database().ref('question/'+question_key);
            var deferred = $q.defer();
        
            var question = {
                question: theQuestion,
                type: questionType,
                level: difficulty,
                choices: theChoices,
                answer: theAnswer,
                category_name: theCategory
            }
            
            var onComplete = function(error) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve("Success");
                }
            };
            console.log(question);
            ref.update(question, onComplete);
        
            return deferred.promise;
    };
    
    this.editFillQuestion = function(question_key, theQuestion, questionType, difficulty, theAnswers, theWrongAnswers, theCategory) {
        var ref = firebase.database().ref('question/'+question_key);
            var deferred = $q.defer();
        
            var question = {
                question: theQuestion,
                type: questionType,
                level: difficulty,
                answers: theAnswers,
                category_name: theCategory
            }
            
            if(typeof theWrongAnswers != 'undefined' && theWrongAnswers.length > 0) {
                question.wrong_answers = theWrongAnswers;
            }
            
            var onComplete = function(error) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve("Success");
                }
            };
        
            ref.update(question, onComplete);
        
            return deferred.promise;
    };
    
    this.editImageQuestion = function(question_key, theQuestion, questionType, difficulty, theChoices, theAnswer, theCategory, questionImages) {
        var ref = firebase.database().ref('question/'+question_key);
            var deferred = $q.defer();
        
            var question = {
                question: theQuestion,
                type: questionType,
                level: difficulty,
                choices: theChoices,
                answer: theAnswer,
                category_name: theCategory,
                question_image: questionImages
            }
            
            var onComplete = function(error) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve("Success");
                }
            };
            
            ref.update(question, onComplete);
        
            return deferred.promise;
    };
    
    this.deleteQuestion = function(question_key){
        var ref = firebase.database().ref('question/'+question_key);
        var deferred = $q.defer();
        
        var onComplete = function(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve("Success");
            }
        };
        
        ref.remove(onComplete);        
        
        return deferred.promise;
    };
    
    // update the questions' category names under its oldName to newName
    this.editQuestionsCategoryName = function(oldName, newName) {
        var deferred = $q.defer();
        
        questionRef.orderByChild("category_name").equalTo(oldName).once("value", function(questionsSnapshot) {
            var updates = {};
            questionsSnapshot.forEach(function(question){
                var questionObj = question.val();
                questionObj.category_name = newName;
                updates[question.key] = questionObj;
            });
            
            questionRef.update(updates, function(error){
               if(error) {
                    console.log(error);
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(updates);        
                }
            });
        }, function(error){
            console.log(error);
            deferred.reject(error);
        });
        
        return deferred.promise;
    };
    
    /* EXAM-RELATED QUERIES */
    
    this.getAllExams = function(){
        var deferred = $q.defer();
        
        examRef.on("value", function(snapshot){
            var exams = [];
            snapshot.forEach(function(childSnapshot){
                exams.push(childSnapshot);
            }) 
            deferred.resolve(exams);
        }, function(error){
            deferred.reject(error);
        });
        
        return deferred.promise;
    }
    
    this.getExam = function (key){
        var ref = firebase.database().ref('exam/'+key);
        var deferred = $q.defer();
        
        ref.on("value", function(snapshot){
            deferred.resolve(snapshot);
        }, function(error){
            deferred.reject(error);
        });
        
        return deferred.promise;
    }
    
    this.addExamSet = function (exam_name, description) {
        var deferred = $q.defer();

        var exam = {
            name: exam_name,
            description: description
        };
        
        var onComplete = function(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve("Success");
            }
        };

        examRef.push(exam, onComplete);
        
        return deferred.promise;   
    }
    
    this.editExam = function(exam_key, exam_name, exam_desc){
        var ref = firebase.database().ref('exam/'+exam_key);
        var deferred = $q.defer();
        
        var exam = {
            name: exam_name,
            description: exam_desc
        };
        
        var onComplete = function(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve("Success");
            }
        };
        
        ref.update(exam, onComplete);
        
        return deferred.promise;        
    }
    
    this.deleteExam = function(exam_key){
        var ref = firebase.database().ref('exam/'+exam_key);
        var deferred = $q.defer();
        
        var onComplete = function(error) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve("Success");
            }
        };
        
        ref.remove(onComplete);        
        
        return deferred.promise;
    }
    
    
    /* APPLICANT-RELATED QUERIES */
    
    this.getListOfApplicants = function() {
		var userRef = firebase.database().ref('applicant/');
        var deferred = $q.defer();
        var applicants = [];

		userRef.on("value", function(snapshot) {
			snapshot.forEach(function(childSnapshot) {
                var applicant = [];
                applicant.key = childSnapshot.key;
				applicant.name = childSnapshot.val().applicant_name;
                applicant.email = childSnapshot.val().email;
                applicant.code = childSnapshot.val().code;
                applicant.exam_date = childSnapshot.val().exam_date;
                applicant.exam_result = childSnapshot.val().exam_result;
                applicant.total_score = childSnapshot.val().total_score;
                applicant.position_applying_for = childSnapshot.val().position_applying_for;
                applicant.finished_exam = childSnapshot.val().finished_exam;
                applicant.date_added = childSnapshot.val().date_added;
                applicants.push(applicant);
			});
            deferred.resolve(applicants);
		}, function (error) {
		  	deferred.reject(error);
		});
        
        return deferred.promise;
	}
    
    this.getApplicant = function(key){
        var ref = firebase.database().ref('applicant/'+key);
        var deferred = $q.defer();
        
        ref.on("value", function(snapshot){
            deferred.resolve(snapshot);
        }, function(error){
            deferred.reject(error);
        });
        
        return deferred.promise;
    };
    
    // ------------/----------------/------------
    
    // Get all data to be put into text file (for backup)
    this.getAllData = function() {
        var ref = firebase.database().ref('/');
        
        var deferred = $q.defer();
        ref.once("value", function(snapshot) {
            var data = {};
            
            snapshot.forEach(function(child) {
                data[child.key] = child.val();
            });
            
            deferred.resolve(data);
        }, function(error) {
            console.log(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    
    // Authenticate
    this.loginUser = function(username, password) {
        var deferred = $q.defer();
        var ref = firebase.database().ref('user/');
        ref.once('value', function(snapshot) {
            var exist = false;

            snapshot.forEach(function(childSnapshot) {
                var userObj = childSnapshot.val();
                if(username == userObj.username && password == userObj.password) {
                    exist = true;
                    
                    if(username == 'test@ideyatech.com' && password == 'test') {
                        deferred.resolve(userObj);
                    }
                    if(!userObj.is_applicant) {
                        deferred.resolve(userObj);
                    }
                    else {
                        deferred.resolve("User is applicant");    
                    }
                }
            });
            if(!exist) {
                deferred.resolve(null);
            }
        }, function(error) {
            console.log(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    
}]);

// Service for queries on user accounts
app.service('AuthService', ['$q', '$location', '$resource', '$rootScope', '$window',function($q, $location, $resource, $rootScope, $window){
    
    var self = this;
    
    // Create user for authentication in firebase database read & write access
    this.createUser = function(username, password, isApplicant){
        var deferred = $q.defer();
        var auth = firebase.auth(); 
        /*
            From docs:
            "On successful creation of the user account, this user will also be signed in to your application.

            User account creation can fail if the account already exists or the password is invalid."
        */
        auth.createUserWithEmailAndPassword(username, password).then(function(result){
            var newUser = {};
            newUser.username = username;
            newUser.password = password;
            newUser.is_applicant = isApplicant;
            
            var ref = firebase.database().ref('user/');
	        ref.once('value', function(snapshot) {
	            var exist = false;
	            
	            snapshot.forEach(function(childSnapshot) {
	            	var userObj = childSnapshot.val();
	                if(username == userObj.username) {
	                    exist = true;
	                }
	            });
	            if(!exist) {
	            	ref.push(newUser);
                    deferred.resolve("Success");
	            }
	        });
            
        }, function(error){
            deferred.reject(error.message);
        });
        return deferred.promise;
    }
    
}]);