angular.module('Aggie')

.controller('UserFormModalController', [
  '$rootScope',
  '$scope',
  '$modal',
  'User',
  'FlashService',
  function($rootScope, $scope, $modal, User, flash) {
    $scope.edit = function(user) {
      var modalInstance = $modal.open({
        controller: 'UserFormModalInstanceController',
        templateUrl: '/templates/users/modal.html',
        resolve: {
          user: function() {
            return user;
          }
        }
      });

      modalInstance.result.then(function(user) {
        User.update({ username: user.oldUserName }, user, function(response) {
          flash.setNoticeNow('User was successfully updated. If you updated your password an email has been sent with instructions for confirming this change.');
          angular.forEach($scope.users, function(u, i) {
            if (u._id == user._id) {
              $scope.users[i] = user;
            }
          });
        }, function(response) {
            if (response.data == "password_too_short") {
              flash.setAlertNow('User failed to be updated. Password is too short.');
            } else if (response.data == 'email_not_unique') {
              flash.setAlertNow('User failed to be updated. Email is not unique.');
            } else {
              flash.setAlertNow('User failed to be updated.');
            }
        });
      });
    };
  }
])

.controller('UserFormModalInstanceController', [
  '$scope',
  '$modalInstance',
  'userRoles',
  'user',
  function($scope, $modalInstance, userRoles, user) {
    $scope.userRoles = userRoles;
    $scope.user = angular.copy(user);
    $scope.user.oldUserName = user.username;
    $scope._showErrors = false;
    $scope.showPassword = false;

    $scope.showErrors = function() {
      return $scope._showErrors;
    };

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope._showErrors = true;
        return;
      }
      $modalInstance.close($scope.user);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
