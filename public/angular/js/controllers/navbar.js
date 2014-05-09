angular.module('Aggie')
  .controller('NavbarController', [
    '$scope',
    '$rootScope',
    '$location',
    'AuthService',
    function($scope, $rootScope, $location, AuthService) {
      $scope.logout = function() {
        AuthService.logout(function(err) {
          if (!err) {
            $location.path('/login');
          }
        });
      };
    }
  ]
);
