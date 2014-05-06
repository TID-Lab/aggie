angular.module('Aggie').service('AuthService', ['$http', 'Session', function($http, Session) {
  this.login = function(credentials) {
    return $http.post('/login', credentials).
      then(function (res) {
        Session.create(res.id, res.userid);
      });
  }

  this.isLoggedIn = function(name) {
    return !!Session.userId
  };

  return this;
}]);
