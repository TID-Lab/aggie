angular.module('Aggie')
  .controller('LoginController', [
    '$scope',
    '$rootScope',
    'AuthService',
    '$location',
    function($scope, $rootScope, AuthService, $location) {
      $scope.alerts = [];
      $scope.user = {};

      $scope.login = function(form) {
        AuthService.login({
            'username': $scope.user.username,
            'password': $scope.user.password
          },
          function(err) {
            if (!err) {
              $location.path('/');
            } else {
              $scope.alerts.push(err.data);
            }
        });
      };

      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.closeNotice = function(index) {
        $scope.notices.splice(index, 1);
      };
    }
  ]);
