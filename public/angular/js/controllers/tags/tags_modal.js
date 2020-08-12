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
            smtcTag: ['SMTCTag', function(SMTCTag) {
              return SMTCTag.query().$promise;
            }],
          }
        });
        modalInstance.result.then(function(smtcTag) {
          console.log(smtcTag);
          $scope.smtcTags.push(smtcTag);
          flash.setNoticeNow('smtcTag.create.success');
        });
      };
      $scope.edit = function(smtcTag) {
        var modalInstance = $modal.open({
          controller: 'SMTCTagFormModalInstanceController',
          templateUrl: '/templates/tags/tag-modal.html',
          resolve: {
            smtcTag: function() {
              return smtcTag;
            }
          }
        });
        modalInstance.result.then(function(smtcTag) {
          flash.setNoticeNow('smtcTag.update.success');
          angular.forEach($scope.smtcTags, function(s, i) {
            if (s._id == smtc._id) {
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
    'smtcTag',
    'SMTCTag',
    'FlashService',
    'shared',
    function($scope, $modalInstance, $translate, smtcTag, SMTCTag, flash, shared) {
      $scope.smtcTag = angular.copy(smtcTag);
      $scope.newSMTCTag = {
        name: '',
        color: 'rgb(0,0,0)',
        description: ''
      }
      $scope.showErrors = false;
      $scope.message = '';
      $scope.model = { showPassword: false };

      var handleSuccess = function(response) {
        $modalInstance.close(response);
      };

      var handleError = function(response) {
        if (response.status == 422) {
          $scope.message = 'smtcTag.create.tagAlreadyExists';
        } else {
          $translate(response.data).then(function(error) {
            $scope.message = error;
          }).catch(function() {
            if ($scope.smtcTag._id) {
              $scope.message = 'smtcTag.update.error';
            } else {
              $scope.message = 'smtcTag.create.error';
            }
          });
        }
      };

      $scope.save = function(form) {
        console.log("Hello");
        if (form.$invalid) {
          $scope.showErrors = true;
          return;
        }
        if ($scope.smtcTag._id) {
          console.log("EDIT");
          SMTCTag.save({name: $scope.smtcTag.name}, $scope.smtcTag, handleSuccess, handleError);
        } else {
          console.log("Add" , $scope.newSMTCTag);
          SMTCTag.save($scope.newSMTCTag, handleSuccess, handleError);
        }
      };

      $scope.close = function() {
        $modalInstance.dismiss('cancel');
      };
    }
  ]);
