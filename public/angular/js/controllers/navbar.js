angular.module('Aggie')

.controller('NavbarController', [
  '$scope',
  '$rootScope',
  '$location',
  'AuthService',
  'FlashService',
  'Socket',
  '$state',
  function($scope, $rootScope, $location, AuthService, flash, Socket, $state) {
    $scope.unreadErrorCount = '0';
    var init = function() {
      if ($rootScope.currentUser) {

        var adminNeedsToChangePwd = $rootScope.currentUser.username === 'admin' &&
              $rootScope.currentUser.hasDefaultPassword;

        if (adminNeedsToChangePwd && $state.current.name != 'reset_admin_password') {
          $state.go('reset_admin_password');
        }
        Socket.on('sourceErrorCountUpdated', sourceErrorCountUpdated);
      } else {
        Socket.off('sourceErrorCountUpdated');
      }
    };

    var sourceErrorCountUpdated = function(response) {
      $scope.unreadErrorCount = response.unreadErrorCount;
    };

    $scope.logout = function() {
      AuthService.logout(function(err) {
        if (!err) {
          if ($location.path() == '/login') {
            flash.setNoticeNow('You have been successfully logged out.');
          } else {
            flash.setNotice('You have been successfully logged out.');
            $location.url('/login');
          }
        } else {
          console.log('Error', err);
        }
      });
    };

    $scope.viewProfile = function(user) {
      $state.go('profile', { userName: user.username });
    };

    $rootScope.$watch('currentUser', init);

    $scope.$on('$destroy', function() {
      Socket.removeAllListeners('sourceErrorCountUpdated');
    });
    init();
  }
]);
