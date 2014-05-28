angular.module('Aggie')

.controller('UserFormModalController', [
  '$rootScope',
  '$scope',
  '$modal',
  'User',
  'FlashService',
  function($rootScope, $scope, $modal, User, flash) {
    $scope.create = function() {
      var modalInstance = $modal.open({
        controller: 'UserFormModalInstanceController',
        templateUrl: 'templates/users/modal.html',
        resolve: {
          user: function() {
            return {};
          }
        }
      });

      modalInstance.result.then(function(user) {
        User.create(user, function(response) {
          flash.setNoticeNow('User was successfully created.');
          $scope.users.push(response);
        }, function(err) {
          flash.setAlertNow('User failed to be created. Please contact support.');
        });
      });
    };

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
    $scope.showErrors = false;
    $scope.showPassword = false;

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope.showErrors = true;
        return;
      }
      $modalInstance.close($scope.user);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
