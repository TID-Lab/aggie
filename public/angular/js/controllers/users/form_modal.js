angular.module('Aggie')

.controller('UserFormModalController', [
  '$rootScope',
  '$scope',
  '$modal',
  'User',
  'FlashService',
  '$translate',
  function($rootScope, $scope, $modal, User, flash, $translate) {
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
          flash.setNoticeNow('User was successfully created and an email has been sent to them with password instructions.');
          $scope.users.push(response);
        }, function(response) {
          $translate(response.data).then(function(error) {
            flash.setAlertNow(error);
          }).catch(function() {
            flash.setAlertNow('User failed to be created. Please contact support.');
          });
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
          flash.setNoticeNow('User was successfully updated.');
          angular.forEach($scope.users, function(u, i) {
            if (u._id == user._id) {
              $scope.users[i] = user;
            }
          });
        }, function(response) {
          $translate(response.data).then(function(error) {
            flash.setAlertNow(error);
          }).catch(function() {
            flash.setAlertNow('Could not update user. Please contact support.');
          });
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
