angular.module('Aggie')
  .controller('LoginController', ['$scope', '$rootScope', 'AuthService', '$location', function($scope, $rootScope, AuthService, $location) {
    $scope.alerts = [];
    $scope.user = {};

    $scope.login = function(form) {
      AuthService.login({
          'username': $scope.user.username,
          'password': $scope.user.password
        },
        function(err) {
          if (!err) {
            $rootScope.$broadcast('auth-login-success');
            $location.path('/');
          } else {
            $scope.alerts.push(err.data);
            $rootScope.$broadcast('auth-login-failed');
          }
      });
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };
  }]);
