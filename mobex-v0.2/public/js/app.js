var app = angular.module('mobex', ['ngRoute', 'ngResource', 'angularFileUpload', 'ui.bootstrap', 'ui.bootstrap.tpls']);

app.config(function ($routeProvider, $locationProvider, $compileProvider) {
    
    // need to add this so angular does not add 'unsafe' to the download url for the backup
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|tel|blob):/);
    
	$routeProvider
    
    .when('/login', {
		templateUrl: 'views/login.html',
		controller: 'LoginController'
	})
    
    .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })

    .when('/categories', {
        templateUrl: 'views/categories.html',
        controller: 'CategoriesController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/categories/:id', {
        templateUrl: 'views/category.html',
        controller: 'CategoryController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/questions', {
        templateUrl: 'views/questions.html',
        controller: 'QuestionsController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/questions/add', {
        templateUrl: 'views/addQuestion.html',
        controller: 'AddQuestionController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/questions/:id', {
        templateUrl: 'views/question.html',
        controller: 'AddQuestionController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/administrators/add', {
        templateUrl: 'views/addAdmin.html',
        controller: 'SettingsController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/applicants', {
        templateUrl: 'views/applicants.html',
        controller: 'ApplicantsController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/applicants/:id', {
        templateUrl: 'views/applicant.html',
        controller: 'ApplicantController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/exams', {
        templateUrl: 'views/exams.html',
        controller: 'ExamsController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/exams/add', {
        templateUrl: 'views/addExam.html',
        controller: 'ExamsController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/exams/:id', {
        templateUrl: 'views/exam.html',
        controller: 'ExamController',
        resolve: {
            permission: function(AuthorizationService, $route){
                return AuthorizationService.checkIfAuth();
            }
        }
    })
    
    .when('/', {
		templateUrl: 'views/login.html',
		controller: 'LoginController',
	})
    
});