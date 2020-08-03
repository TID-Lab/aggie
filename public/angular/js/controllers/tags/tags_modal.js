angular.module('Aggie')

  .controller('SMTCTagFormModalController', [
    '$rootScope',
    '$scope',
    '$modal',
    'SMTCTag',
    'FlashService',
    '$translate',
    '$state',
    function($rootScope, $scope, $modal, SMTCTag, flash, $translate, $state) {
      $scope.create = function() {
        var modalInstance = $modal.open({
          controller: 'SMTCTagFormModalInstanceController',
          templateUrl: 'templates/tags/tag-modal.html',
          resolve: {

          }
        });

        modalInstance.result.then(function(smtcTag) {
          $scope.smtcTags.push(smtcTag);
        });
      };
      $scope.edit = function(smtcTag) {
        var modalInstance = $modal.open({
          controller: 'SMTCTagFormModalInstanceController',
          templateUrl: '/templates/tags/tag-modal.html',
          resolve: {
            smtcTags: function() {
              return smtcTag;
            }
          }
        });
        modalInstance.result.then(function(smtcTag) {
          flash.setNoticeNow('smtcTag.update.success');
          angular.forEach($scope.smtcTags, function(u, i) {
            if (u._id == user._id) {
              $scope.smtcTags[i] = smtcTag;
            }
          });
        });
      };
    }
  ])

  .controller('SMTCTagFormModalInstanceController', [
    '$scope',
    '$modalInstance',
    '$translate',
    'FlashService',
    'shared',
    function($scope, $modalInstance, $translate, flash, shared) {
      $scope.showErrors = false;
      $scope.message = '';
      $scope.model = { showPassword: false };

      var handleSuccess = function(response) {
        $modalInstance.close(response);
      };

      var handleError = function(response) {
        if (response.status == 502) {
          $scope.message = 'user.create.emailNotConfigured';
        } else {
          $translate(response.data).then(function(error) {
            $scope.message = error;
          }).catch(function() {
            if ($scope.user._id) {
              $scope.message = 'user.update.error';
            } else {
              $scope.message = 'user.create.error';
            }
          });
        }
      };

      $scope.save = function(form) {
        if (form.$invalid) {
          $scope.showErrors = true;
          return;
        }
        if ($scope.user._id) {

        } else {

        }
      };

      $scope.close = function() {
        $modalInstance.dismiss('cancel');
      };
    }
  ]);
