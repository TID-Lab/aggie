angular.module('Aggie')
  .controller('LoginController', ['$scope', '$rootScope', 'AuthService', '$location', function($scope, $rootScope, AuthService, $location) {
    $scope.error = {};
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
            $rootScope.$broadcast('auth-login-failed');
            console.log('Failed');
          }
      });
    };
  }]);
