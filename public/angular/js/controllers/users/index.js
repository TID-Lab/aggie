angular.module('Aggie')

.controller('UsersIndexController', [
  '$scope',
  '$rootScope',
  'FlashService',
  'users',
  'User',
  function($scope, $rootScope, flash, users, User) {
    $scope.users = users;

    $scope.delete = function(user) {
      User.delete({username: user.username}, function(){
        flash.setNoticeNow('User was successfully deleted.');
        for (var i in $scope.users) {
          if (user._id == $scope.users[i]._id) {
            $scope.users.splice(i, 1);
          }
        }
      }, function() {
        flash.setAlertNow('User failed to be deleted.');
      });
    };
  }
]);
