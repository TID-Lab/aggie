angular.module('Aggie')
  .factory('AuthService', [
    '$rootScope',
    '$http',
    function AuthService($rootScope, $http) {
      return {
        login: function(credentials, callback) {
          var cb = callback || angular.noop;
          $http.post('/login', credentials)
            .then(function (res) {
              $rootScope.currentUser = res.data;
              return cb();
            }, function(err) {
              return cb(err);
            });
        },

        getCurrentUser: function() {
          $http.get('/session').then(function(res) {
            if (res.data.username) {
              $rootScope.currentUser = res.data;
            }
          });
        },

        logout: function(callback) {
          var cb = callback || angular.noop;
          $http.get('/logout').then(function(res) {
            $rootScope.currentUser = null;
            return cb();
          }, function(err) {
            return cb(err.data);
          });
        }
      };
    }
  ]
);
