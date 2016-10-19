angular.module('Aggie')

.controller('UserFormModalController', [
  '$rootScope',
  '$scope',
  '$modal',
  'User',
  'FlashService',
  '$translate',
  '$state',
  function($rootScope, $scope, $modal, User, flash, $translate, $state) {
    $scope.create = function() {
      var modalInstance = $modal.open({
        controller: 'UserFormModalInstanceController',
        templateUrl: 'templates/users/modal.html',
        resolve: {
          user: function() {
            return {
              role: 'viewer'
            };
          }
        }
      });

      modalInstance.result.then(function(user) {
        $scope.users.push(user);
        flash.setNoticeNow('user.create.success');
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
        flash.setNoticeNow('user.update.success');
        angular.forEach($scope.users, function(u, i) {
          if (u._id == user._id) {
            $scope.users[i] = user;
          }
        });
      });
    };

    $scope.view = function(user) {
      $state.go('profile', { userName: user.username });
    };
  }
])

.controller('UserFormModalInstanceController', [
  '$scope',
  '$modalInstance',
  'userRoles',
  'user',
  'User',
  '$translate',
  'FlashService',
  'shared',
  function($scope, $modalInstance, userRoles, user, User, $translate, flash, shared) {
    $scope.userRoles = userRoles;
    $scope.user = angular.copy(user);
    $scope.user.oldUserName = user.username;
    $scope.showErrors = false;
    $scope.passwordMinLength = shared.User.PASSWORD_MIN_LENGTH;
    $scope.message = '';
    $scope.model = { showPassword: false };

    var handleSuccess = function(response) {
      $modalInstance.close(response);
    };

    var handleError = function(response) {
      $translate(response.data).then(function(error) {
        $scope.message = error;
      }).catch(function() {
        if ($scope.user._id) {
          $scope.message = 'user.update.error';
        } else {
          $scope.message = 'user.create.error';
        }
      });
    };

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope.showErrors = true;
        return;
      }
      if ($scope.user._id) {
        User.update({ _id: $scope.user._id }, $scope.user, handleSuccess, handleError);
      } else {
        User.create($scope.user, handleSuccess, handleError);
      }
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
