angular.module('Aggie')
  .factory('AuthService', ['$http', 'Session', function AuthService($http, Session) {
    return {
      login: function(credentials, callback) {
        $http.post('/login', credentials)
          .then(function (res) {
            Session.create(res.data._id, res.data.username);
            return callback();
          }, function(err) {
            return callback(err);
          });
      },

      isAuthenticated: function() {
        return !!Session.id;
      }
    }
  }]);
