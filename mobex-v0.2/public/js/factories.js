/* FACTORIES */

//  Factory for user authentication
app.factory('AuthorizationService', function ($resource, $q, $rootScope, $location){
    return {
        
        // stores user details and permissions
        user: {
            currentUser: "",
            isAuthenticated: false
        },

        // process user login
        login: function(username, password){

            var parent = this;

            var ref = firebase.auth();
            var deferred = $q.defer();

            // validate user's credentials
            ref.signInWithEmailAndPassword(username, password).then(function(result){
                parent.user.currentUser = result.email;
                parent.user.isAuthenticated = true;
                
                $rootScope.user = parent.user;
                deferred.resolve("Logged in.");
            }, function(error){
                deferred.reject(error.message);
            });
            
            
            return deferred.promise;
        },

        // process user logout
        logout: function(){
            var parent =  this;
            var ref = firebase.auth();
            var deferred = $q.defer();

            ref.signOut().then(function() {
                parent.user.currentUser = null;
                parent.user.isAuthenticated = false;
                deferred.resolve("Logged out.");
            }, function(error) {
              deferred.reject(error);
            });

            return deferred.promise;

        },

        // checks if current user is logged in
        checkIfAuth: function(){
            var parent = this;
            var deferred = $q.defer();
            var ref = firebase.auth();
            console.log("check if auth");
            ref.onAuthStateChanged(function(user) {
                // user is signed in
                if(user) {
                    parent.user.currentUser = user.email;
                    parent.user.isAuthenticated = true;
                    
                    //$rootScope.user = parent.user;
                    deferred.resolve();
                }
                else {
                    $location.path('/login');
                    $rootScope.$on('$locationChangeSuccess', function (next, current) {                        
                        deferred.resolve();
                    });
                }
            });
            /*
            if(parent.user.isAuthenticated)
                deferred.resolve();
            else{
                $location.path('/');
                $rootScope.$on('$locationChangeSuccess', function (next, current) {
                   deferred.resolve();
                });
            }
            */
            return deferred.promise;
        }
    }
});