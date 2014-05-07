angular.module('Aggie')
  .controller('ApplicationController', ['$scope', '$location', 'Session', 'AuthService', function($scope, $location, Session, AuthService) {
    $scope.currentUser = null;

    $scope.isAuthenticated = AuthService.isAuthenticated;

    $scope.logout = function() {
      Session.destroy();
      $location.path('/');
    }
  }]);
