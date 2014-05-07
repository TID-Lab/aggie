angular.module('Aggie')
  .controller('PasswordResetController', [
    '$scope',
    '$location',
    '$http',
    'AuthService',
    function($scope, $location, $http, AuthService) {
      $scope.alerts = [];

      var passwordsMatch = function() {
        return $scope.user.password ==
          $scope.user.password_confirmation;
      };

      $scope.resetPassword = function() {
        if (passwordsMatch()) {
          var username = $rootScope.currentUser.username;
          var params = {  password: $scope.user.password }
          $http.put('/api/v1/user/' + username, params)
            .success(function(user) {
              $location.path('/');
            }).error(function(message, respStatus) {
              $scope.alerts.push(message);
            });
        } else {
          $scope.alerts.push('Passwords do not match');
        }
      };
    }
  ]);
