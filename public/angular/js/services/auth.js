angular.module('Aggie')
  .factory('AuthService', [
    '$rootScope',
    '$http',
    'shared',
    function AuthService($rootScope, $http, shared) {
      return {
        login: function(credentials, callback) {
          var cb = callback || angular.noop;
          $http.post('/login', credentials)
            .then(function(res) {
              $rootScope.currentUser = new shared.User(res.data);
              return cb();
            }, function(err) {
              return cb(err);
            });
        },

        getCurrentUser: function() {
          var promise = $http.get('/session');
          promise.then(function(res) {
            if (res.data.username) {
              $rootScope.currentUser = new shared.User(res.data);
            }
          });
          return promise;
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
