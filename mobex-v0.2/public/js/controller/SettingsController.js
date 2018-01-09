app.controller('SettingsController', ['$scope', 'AuthService', function($scope, AuthService){
    
    $scope.alerts = [];
    
    // Add user account
    $scope.addAdministrator = function(){
        AuthService.createUser($scope.email, $scope.password, false).then(function(result){
            $scope.alerts.push({type: 'alert alert-success', msg:'User created successfully.'});
            clear();
        }, function(error){
            $scope.alerts.push({type: 'alert alert-danger', msg:error})
        });
    };
    
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
    
    var clear = function(){
        $scope.email = '';
        $scope.password = '';
    }
}]);