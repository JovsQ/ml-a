
app.controller('AddQuestionController', ['$scope', '$q', '$routeParams', '$timeout','databaseService', 'FileUploader', function($scope, $q, $routeParams, $timeout, databaseService, FileUploader){

    $scope.choices = [];
    $scope.categories = [];
    $scope.exams = [];
    $scope.question = [];
    $scope.id = 0;
    $scope.alerts = [];
    $scope.blankAnswerAlerts = [];
    $scope.noAnswerAlerts = [];
    $scope.uploaders = [];
    $scope.choiceFiles = [];
    $scope.questionContent = '';
    $scope.fillAnswers = [];
    $scope.fillWrongAnswers = [];
    $scope.loadedQuestion = false;
    $scope.edit = false;
    $scope.currentlySaving = false;
    $scope.hasBlankFillAnswer = false;
    
    // for question with image
    $scope.typeOfChoices = ''; // image or text
    
    $scope.init = function(){
        $scope.loadSubcategories();
        $scope.loadExams();
    }
    
    var clearOneAlert = function() {
        if($scope.alerts.length > 0) {
            $scope.alerts.splice(0, 1);
        }  
    };
    
    var clearOneBlankAnswerAlert = function() {
        if($scope.blankAnswerAlerts.length > 0) {
            $scope.blankAnswerAlerts.splice(0, 1);
        }
    };
    
    var clearOneNoAnswerAlert = function() {
        if($scope.noAnswerAlerts.length > 0) {
            $scope.noAnswerAlerts.splice(0, 1);
        }
    };
    
    $scope.$watch('typeOfChoices', function(newval, oldval){
        if(!$scope.edit) {
            clearChoices();
        }
    });
    
    var timeoutLength = 4000;
    
    $scope.$watch('alerts.length', function(newval, oldval){
        if(newval != 0) {
            $timeout(clearOneAlert, timeoutLength);
        }
    });
    
    $scope.$watch('blankAnswerAlerts.length', function(newval, oldval){
        if(newval != 0) {
            $timeout(clearOneBlankAnswerAlert, timeoutLength);
        }
    });
    
    $scope.$watch('noAnswerAlerts.length', function(newval, oldval){
        if(newval != 0) {
            $timeout(clearOneNoAnswerAlert, timeoutLength);
        }
    });
    
    $scope.$watch('questionType', function(newval, oldval) {
        clearAllExceptQuestionType();
    });
    
    // Called when edit question is clicked
    $scope.getQuestionInfo = function(){
        $scope.loadedQuestion = false;
        $scope.edit = true;
        databaseService.getQuestion($routeParams.id).then(function(result){
            $scope.question = result;
            $scope.questionLevel = $scope.question.questionLevel;
            $scope.questionContent = $scope.question.questionContent;
            
            
            $scope.choices = [];
            if($scope.question.choices) {
                $scope.choices = $scope.question.choices.slice();
            }
            
            $scope.correctAnswer = {};
            if($scope.question.question_image) {
                $scope.questionImage = $scope.question.question_image.slice();
            }
            if($scope.question.questionType != 'fill') {
                // not working, the correct answer is not automatically selected in the drop down, dont know why
                $scope.correctAnswer.name = $scope.question.choices[$scope.question.correctAnswer].name;
            }
            if($scope.question.questionType == 'fill') {
                $scope.fillAnswers = $scope.question.answers;
                if(typeof $scope.question.wrong_answers != 'undefined' && $scope.question.wrong_answers.length > 0) {
                    $scope.fillWrongAnswers = [];    
                    for(var i = 0; i < $scope.question.wrong_answers.length; i++) {
                        $scope.fillWrongAnswers.push({
                           name: $scope.question.wrong_answers[i] 
                        });
                    }
                    
                }
                console.info("$scope.fillanswers", $scope.fillAnswers);
                console.info("fillwronganswers", $scope.fillWrongAnswers);
            }
            
            if($scope.question.questionType == 'image') {
                $scope.typeOfChoices = '';
                if($scope.question.typeOfChoices == 'text') {
                    $scope.typeOfChoices = 'Text Choices';
                }
                else if($scope.question.typeOfChoices == 'image') {
                    $scope.typeOfChoices = 'Image Choices';
                }
            }
            
            $scope.loadedQuestion = true;
        }, function(error){
            console.log(error);
        });
    }
    
    $scope.addChoice = function(name){
        $scope.choices.push({
            name: name
        });
    }
    
    // Delete choice, also deletes the file to be uploaded
    $scope.deleteChoice = function(id){
        $scope.choices.splice(id, 1);
        $scope.uploaders[1].queue.splice(id, 1)
    }
    
    // Delete choice when editing question
    $scope.deleteQuestionChoice = function(id){
        var removedChoice = [];
        removedChoice = $scope.choices.splice(id, 1);
        $scope.question.choices.splice(id, 1);
        if(removedChoice.length == 1) {
            for(var i = $scope.uploaders[1].queue.length-1; i >= 0; i--) {
                if($scope.uploaders[1].queue[i].file.name == removedChoice[0].name) {
                    $scope.uploaders[1].queue.splice(i, 1);
                }
            }
        }
    }
    
    // Delete question image
    $scope.deleteQuestionImage = function(id){
        var removedQuestionImage = [];
        removedQuestionImage = $scope.questionImage.splice(id, 1);
        if($scope.question.question_image) {
            $scope.question.question_image.splice(id, 1);
        }
        if(removedQuestionImage.length == 1) {
            for(var i = $scope.uploaders[0].queue.length-1; i >= 0; i--) {
                if($scope.uploaders[0].queue[i].file.name == removedQuestionImage[0].name) {
                    $scope.uploaders[0].queue.splice(i, 1);
                }
            }
        }
    }

    // Used in Fill in the blank question
    $scope.addWrongAnswerFill = function() {
        $scope.fillWrongAnswers.push({
            name: name
        });
    };
    
    // Used in Fill in the blank question
    $scope.deleteWrongAnswer = function(index){
        $scope.fillWrongAnswers.splice(index, 1);
    }
    
    $scope.loadSubcategories = function(){
        $scope.categories = []; 
        databaseService.getAllCategories().then(function(result){
            //$scope.categories = result;
            var subcategories = [];
            for(var i = 0; i < result.length; i++) {
                for(var j = 0; j < result[i].subcategories.length; j++) {
                    subcategories.push(result[i].subcategories[j]);
                }
            }
            $scope.categories = subcategories;
        }, function(error){
            console.log(error);
        });
    }
    
    $scope.loadExams = function(){
        $scope.exams = [];
        databaseService.getAllExams().then(function(result){
            $scope.exams = result;
        }, function(error){
            console.log(error);
        });
    }
    
    // eg. Ideyatech is a (2) company. '2' will be matched
    $scope.checkIfFillQuestionHasAnswer = function(edit) {
        var pattern = /\(([0-9]+)\)/g;
        var match, numberMatches = [];
        var theQuestion = '';
        
        if(edit) {
            theQuestion = $scope.question.questionContent;
        }
        else {
            theQuestion = $scope.questionContent;
        }
        while ((match = pattern.exec(theQuestion)) != null)
        {
            numberMatches.push(parseInt(match[1], 10));
        }
        addFillAnswers(numberMatches);
        removeFillAnswerNotInArray(numberMatches);
    };
    
    // For each number match, add the answer (used in fill in the blank)
    var addFillAnswers = function(arrayNumberMatches) {
        
        for(var i = 0; i < arrayNumberMatches.length; i++) {
            if(!checkIfFillAnswerisAlreadyInArray(arrayNumberMatches[i])) {
                var answerFill = {
                    number: arrayNumberMatches[i],
                    theAnswer: ''
                };
                $scope.fillAnswers.push(answerFill);
            }
        }
        
    };
    
    // Remove the answer that has no match in the question
    var removeFillAnswerNotInArray = function(arrayNumberMatches) {
        for(i = $scope.fillAnswers.length-1; i >= 0; i--) {
            var match = false;
            for(j = 0; j < arrayNumberMatches.length; j++) {
                if($scope.fillAnswers[i].number == arrayNumberMatches[j]) {
                    match = true;
                }
            }
            if(!match) {
                $scope.fillAnswers.splice(i, 1);
            }
        }
    };
    
    // If there is a duplicate number (used in fill in the blank)
    var checkIfFillAnswerisAlreadyInArray = function(number) {
        for(var i = 0; i < $scope.fillAnswers.length; i++) {
            if($scope.fillAnswers[i].number == number) {
                return true;
            }
        }
        return false;
    };
    
    var isValid = function() {
        // Dont proceed
        if($scope.questionLevel == "") {
            return false;
        }
        if ( $.trim($scope.questionContent) == '' ) {
            return false;
        }
        
        if($scope.questionType != 'fill' && $scope.correctAnswer == '') {
            return false;
        }
        
        if($scope.categoryName == '') {
            return false;
        }
        
        if($scope.questionType == 'fill') {
            console.log("isvalid question fil");
            if($scope.fillAnswers.length == 0) {
                $scope.noFillAnswers = true;
                $scope.noAnswerAlerts.push({type: 'alert alert-danger', msg:'The question has no answers.'});
                return false;
            }
            if(answerHasBlank()) {
                return false;
            }
        }
        
        return true;
    };
    
    $scope.saveQuestion = function(){
        if($scope.currentlySaving) {
            return;
        }
        $scope.hasBlankFillAnswer = false;
        
        var choices = [];
        var questionImage = [];
        var answer;
        
        var fillAnswers = [];
        var fillWrongAnswers = [];
        
        removeBlankChoices();
        for(var i=0; i < $scope.choices.length; i++){
            choices.push($scope.choices[i].name);
            if($scope.choices[i].name === $scope.correctAnswer.name) {
                answer = i;
            }
        }
        
        if(!isValid()) {
            return;
        }
        
        $scope.currentlySaving = true;
        
        if($scope.questionType == 'image') {
            console.log("save questionimage");
            if(typeof $scope.questionImage != 'undefined') {
                for(var i=0; i < $scope.questionImage.length; i++){
                    questionImage.push($scope.questionImage[i].name);
                }
            }
            var choiceType = '';
            if($scope.typeOfChoices == 'Text Choices') {
                choiceType = 'text';
            }
            else if($scope.typeOfChoices == 'Image Choices') {
                choiceType = 'image';
            }

            $scope.uploadAll().then(function(result) {
                databaseService.addQuestion($scope.questionContent, $scope.questionType, $scope.questionLevel, choices, answer, $scope.categoryName.category_name, $scope.examSet.val().name, questionImage, choiceType).then(function(result){
                    $scope.alerts.push({type: 'alert alert-success', msg:'Question and images successfully added.'});
                    clearAll();
                    $scope.currentlySaving = false;
                });
            }, function(error) {
                console.log(error);
                $scope.alerts.push({type: 'alert alert-danger', msg:'Error uploading images. Question was not added.'});
            });    
        }
        else if($scope.questionType == 'fill') {
            
            for(var i = 0; i < $scope.fillWrongAnswers.length; i++) {
                fillWrongAnswers.push($scope.fillWrongAnswers[i].name);
            }
            
            databaseService.addFillQuestion($scope.questionContent, $scope.questionType, $scope.questionLevel, $scope.fillAnswers, fillWrongAnswers, $scope.categoryName.category_name, $scope.examSet.val().name).then(function(result){
                $scope.alerts.push({type: 'alert alert-success', msg:'Question successfully added.'});
                clearAll(); 
                $scope.currentlySaving = false;
            });
            
        }
        else {
            databaseService.addQuestion($scope.questionContent, $scope.questionType, $scope.questionLevel, choices, answer, $scope.categoryName.category_name, $scope.examSet.val().name).then(function(result){
                $scope.alerts.push({type: 'alert alert-success', msg:'Question successfully added.'});
                clearAll();
                $scope.currentlySaving = false;
            });
        }
    }
    
    var answerHasBlank = function() {
        console.info("fillanswers", $scope.fillAnswers);
        for(var i = 0; i < $scope.fillAnswers.length; i++) {
            if($.trim( $scope.fillAnswers[i].theAnswer ) == '') {
                $scope.hasBlankFillAnswer = true;
            }
        }
        console.info("wronganswers", $scope.fillWrongAnswers);
        for(var i = 0; i < $scope.fillWrongAnswers.length; i++) {
            if($.trim( $scope.fillWrongAnswers[i].name ) == '') {
                $scope.hasBlankFillAnswer = true;
            }
        }
        if($scope.hasBlankFillAnswer) {
            $scope.blankAnswerAlerts.push({type: 'alert alert-danger', msg:'Some answers are blank.'});
        }
        
        return $scope.hasBlankFillAnswer;
    };
    
    // When saving with some blank choices, remove it
    var removeBlankChoices = function() {
        for(var i = $scope.choices.length-1; i >= 0; i--) {
            if(typeof $scope.choices[i].name == 'undefined' || $scope.choices[i].name == '' ||
                $.trim( $scope.choices[i].name ) == '') {
                $scope.choices.splice(i, 1);
            }
        }
    };
    
    $scope.editQuestion = function(){
        if($scope.currentlySaving) {
            return;
        }
        
        if(!$scope.question.categoryName.category_name) {
            return;
        }
        
        
        if ( $.trim($scope.questionContent) == '' ) {
            $scope.currentlySaving = false;
            return;
        }
        
        if($scope.question.questionType == 'fill') {
            editFillQuestion();
            return;
        }
        if($scope.question.questionType == 'image') {
            editImageQuestion();
            return;
        }
        
        $scope.currentlySaving = true;
        
        var choices = [];
        var answer;
        removeBlankChoices();
        for(var i=0; i < $scope.choices.length; i++){
            choices.push($scope.choices[i].name);
            if($scope.choices[i].name === $scope.question.correctAnswer.name)
                answer = i;
        }
        
        if(typeof answer == 'undefined') {
            $scope.currentlySaving = false;
            return;
        }
        
//        if(!$scope.question.categoryName.category_name) {
//            $scope.currentlySaving = false;
//            return;
//        }
       
        databaseService.editQuestion($scope.question.key, $scope.question.questionContent, $scope.question.questionType, $scope.question.questionLevel, choices, answer, $scope.question.categoryName.category_name).then(function(result){
            $scope.alerts.push({type: 'alert alert-success', msg:'Question successfully edited.'});
            $scope.currentlySaving = false;
        }, function(error){
            console.info("error edit question", error);
        })
    }
    
    var editFillQuestion = function() {
        $scope.hasBlankFillAnswer = false;
        if($scope.fillAnswers.length == 0) {
            $scope.noFillAnswers = true;
            $scope.noAnswerAlerts.push({type: 'alert alert-danger', msg:'The question has no answers.'});
            return;
        }
        
        if(answerHasBlank()) {
            return;
        }
        
        $scope.currentlySaving = true;
        
        var fillWrongAnswers = [];
        for(var i = 0; i < $scope.fillWrongAnswers.length; i++) {
            fillWrongAnswers.push($scope.fillWrongAnswers[i].name);
        }
        databaseService.editFillQuestion($scope.question.key, $scope.question.questionContent, $scope.question.questionType, $scope.question.questionLevel, $scope.fillAnswers, fillWrongAnswers, $scope.question.categoryName.category_name).then(function(result){
            $scope.alerts.push({type: 'alert alert-success', msg:'Question successfully edited.'});
            $scope.currentlySaving = false;
        }, function(error) {
            console.info("error edit fill question", error);
        });
        
    };
    
    var editImageQuestion = function() {
        $scope.currentlySaving = true;
        
        var choices = [];
        var answer;
        for(var i=0; i < $scope.choices.length; i++){
            choices.push($scope.choices[i].name);
            if($scope.choices[i].name === $scope.question.correctAnswer.name)
                answer = i;
        }
        
        var questionImages = [];
        if($scope.questionImage.length) {
            for(var i=0; i < $scope.questionImage.length; i++) {
                if($scope.questionImage[i].name) {
                    // when a new image is added, $scope.questionImage[i].name
                    // note: we use object.name just for the angular view (ngrepeat)
                    questionImages.push($scope.questionImage[i].name);
                }
                else {
                    // when we retrieve the question from the database, we get $scope.questionImage[i]
                    questionImages.push($scope.questionImage[i]);
                }
            }
        }
        
        $scope.uploadAll().then(function(result) {
            databaseService.editImageQuestion($scope.question.key, $scope.question.questionContent, $scope.question.questionType, $scope.question.questionLevel, choices, answer, $scope.question.categoryName.category_name, questionImages).then(function(result){
                $scope.alerts.push({type: 'alert alert-success', msg:'Question and images successfully updated/added.'});
                $scope.currentlySaving = false;
            });
            }, function(error) {
                console.log(error);
                $scope.alerts.push({type: 'alert alert-danger', msg:'Error uploading images. Question was not updated.'});
            });
    };
    
    
    var clearAll = function(){
        $scope.questionContent = '';
        $scope.questionType = '';
        $scope.questionLevel = '';
        $scope.choices = [];
        $scope.fillAnswers = [];
        $scope.fillWrongAnswers = [];
        $scope.noFillAnswers = false;
        $scope.correctAnswer = '';
        $scope.categoryName = '';
        uploaders[0].queue = [];
        uploaders[1].queue = [];
    }
    
    var clearAllExceptQuestionType = function() {
        $scope.questionContent = '';
        $scope.questionLevel = '';
        $scope.choices = [];
        $scope.fillAnswers = [];
        $scope.fillWrongAnswers = [];
        $scope.noFillAnswers = false;
        $scope.correctAnswer = '';
        $scope.categoryName = '';
        uploaders[0].queue = [];
        uploaders[1].queue = [];
    };
    
    var clearChoices = function() {
        uploaders[1].queue = [];
        $scope.choices = [];
    };
    
    // Define upload URL for question and choice
    var urls = ['uploadQuestion.php', 'uploadChoices.php'];
    
    // Upload a single choice or question image file
    $scope.uploadFile = function(file, filename) {
        var deferred = $q.defer();
        var storageRef = firebase.storage().ref();
        var imageRef = storageRef.child('images/' + filename);
        imageRef.put(file).then(function(snapshot) {
            deferred.resolve(snapshot);
        });
        return deferred.promise;
    }
    
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
    
    $scope.closeBlankAnswerAlert = function(index) {
        $scope.blankAnswerAlerts.splice(index, 1);
    }
    
    $scope.closeNoAnswerAlert = function(index) {
        $scope.noAnswerAlerts.splice(index, 1);
    }
    
    // Upload each choice image file in a promise
    $scope.uploadAll = function() {
        var uploadPromises = [];
        var queueQuestion = uploaders[0].queue;
        var queueChoices = uploaders[1].queue;
        var deferred = $q.defer();
        for(i = 0; i < queueQuestion.length; i++) {
            uploadPromises.push($scope.uploadFile(queueQuestion[i]._file, queueQuestion[i]._file.name));
        }
        for(i = 0; i < queueChoices.length; i++) {
            uploadPromises.push($scope.uploadFile(queueChoices[i]._file, queueChoices[i]._file.name));
        }
        $q.all(uploadPromises).then(function(result){
            deferred.resolve(result);
        }, function(err) {
           console.log(err); 
        });
        return deferred.promise;
    };
    
    var uploaders = $scope.uploaders = urls.map(function(url) {
        var uploader = new FileUploader({url: url});
        
        // FILTERS
        uploader.filters.push({
            name: 'customFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 6;
            }
        });
        uploader.filters.push({
            name: 'imageFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });
         
        return uploader;
    });
    
    // CALLBACKS

    uploaders[0].onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    
    uploaders[1].onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    
    // Callback after uploading question image
    uploaders[0].onAfterAddingFile = function(fileItem) {
        $scope.questionImage = [];
        if($scope.question.question_image && $scope.question.question_image.length) {
            for(var i = 0; i < $scope.question.question_image.length; i++) {
                $scope.questionImage.push({
                    name: $scope.question.question_image[i].name
                });
            }
        }
        
        for(var i = 0; i < uploaders[0].queue.length; i++) {
            $scope.questionImage.push({name: uploaders[0].queue[i]._file.name});
        }
    };
    
    // Callback after uploading choices
    uploaders[1].onAfterAddingFile = function(fileItem) {
        $scope.choices = [];
        
        // if edit question, then $scope.question.questionType is not null
        if($scope.question.questionType) {
            for(var i = 0; i < $scope.question.choices.length; i++) {
                $scope.choices.push({
                    name: $scope.question.choices[i].name
                });
            }
        }
        for(var i = 0; i < uploaders[1].queue.length; i++) {
            $scope.choices.push({name: uploaders[1].queue[i]._file.name});
        }
        console.info("choices", $scope.choices);
        console.info("uploaders[1]", uploaders[1].queue);
    };
    
}]);