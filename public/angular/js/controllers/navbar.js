angular.module('Aggie')

.controller('NavbarController', [
  '$scope',
  '$rootScope',
  '$location',
  'AuthService',
  'FlashService',
  function($scope, $rootScope, $location, AuthService, flash) {
    $scope.logout = function() {
      AuthService.logout(function(err) {
        if (!err) {
          if ($location.path() == '/login') {
            flash.setNoticeNow('You have been successfully logged out.');
          } else {
            flash.setNotice('You have been successfully logged out.');
            $location.path('/login');
          }
        } else {
          console.log('Error', err);
        }
      });
    };
  }
]);
