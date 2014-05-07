angular.module('Aggie')
  .controller('PasswordResetController', [
    '$scope',
    '$location',
    '$http',
    'Session', // temporary
    'AuthService',
    function($scope, $location, $http, Session, AuthService) {
      var passwordsMatch = function() {
        return $scope.user.password ==
          $scope.user.password_confirmation;
      };

      $scope.resetPassword = function() {
        if (passwordsMatch()) {
          Session.username = 'admin'; // temporary
          var username = AuthService.currentUser();
          $http.put('/api/v1/user/' + username)
            .success(function(user) {
              console.log(user);
              $scope.message = 'Successfully updated password';
              $location.path('/');
            }).error(function(response, mesg) {
              $scope.message = 'Failed to update password';
            });
        } else {
          $scope.message = 'Passwords do not match';
        }
      };
    }
  ]);
