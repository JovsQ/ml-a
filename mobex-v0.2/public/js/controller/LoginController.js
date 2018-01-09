
app.controller('LoginController', ['$scope', '$location', 'databaseService', 'AuthorizationService', function($scope, $location, databaseService, AuthorizationService){
    
    $scope.alerts = [];
    
    $scope.processLogin = function(){
        
        if($scope.username == 'test' && $scope.password == 'test12') {
            $scope.username = 'test@ideyatech.com';
        }
        
        // Authentication for firebase read & write access (need authentication so that the database is not open to public)
        AuthorizationService.login($scope.username, $scope.password).then(function(result){
            localStorage.setItem("idtfirebaseapp_username", $scope.username)
            localStorage.setItem("idtfirebaseapp_password", $scope.password)
            
            // Our own authentication to gain access to the mobile exam control panel
            databaseService.loginUser($scope.username, $scope.password).then(function(result){
                if(result == "User is applicant") {
                    $scope.alerts.push({type:'alert alert-danger', msg:"That user is an applicant"});
                }
                else if(result == null) {
                    $scope.alerts.push({type:'alert alert-danger', msg:"Invalid username or password"});
                }
                else {
                    $location.path("/home");
                }
            }, function(error) {
                console.log(error);
                $scope.alerts.push({type:'alert alert-danger', msg:error});
            });
            
        }, function(error){
            $scope.alerts.push({type:'alert alert-danger', msg:error});
        });
    }
    
    // function for closing alert messages
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
    
}]);