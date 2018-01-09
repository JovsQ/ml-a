
app.controller('NavbarController', ['$rootScope', '$scope', '$location', 'databaseService', 'AuthorizationService', function($rootScope, $scope, $location, databaseService, AuthorizationService){
   
    $scope.user = {};
    
    $scope.init = function() {
        //$scope.user = $rootScope.user;
        console.log($scope.user);
    };
    
    $scope.status = {
        isopen: false
    };
    

    $scope.toggled = function(open) {
        $log.log('Dropdown is now: ', open);
    };

    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };
    
    // function for processing user log out operation
    $scope.processLogout = function(){
        AuthorizationService.logout().then(function(result){
            localStorage.setItem("idtfirebaseapp_username", "null")
            localStorage.setItem("idtfirebaseapp_password", "null")
            $location.path("/login");
        }, function(error){
            //console.log(error);
        });
    };
    
}]);