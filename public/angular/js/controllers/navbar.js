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

    // needs special behavior, because state /profile/ is satisfied with
    // /profile/:userId of any user
    $scope.ownProfile = function () {
      $state.go('profile', {userId: $rootScope.currentUser._id});
    };

    $rootScope.$watch('currentUser', init);

    init();
  }
]);
