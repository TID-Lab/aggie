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
          templateUrl: 'templates/tags/modal.html',
          resolve: {
            smtcTag: ['SMTCTag', function(SMTCTag) {
              return SMTCTag.query().$promise;
            }],
          }
        });
        modalInstance.result.then(function(smtcTag) {
          $scope.smtcTags.push(smtcTag);
          flash.setNoticeNow('smtcTag.create.success');
        });
      };
      $scope.edit = function(smtcTag) {
        var modalInstance = $modal.open({
          controller: 'SMTCTagFormModalInstanceController',
          templateUrl: '/templates/tags/modal.html',
          resolve: {
            smtcTag: function() {
              return {_id: smtcTag._id, name: smtcTag.name, color: smtcTag.color, description: smtcTag.description };
            }
          }
        });
        modalInstance.result.then(function(smtcTag) {
          flash.setNoticeNow('smtcTag.update.success');
          angular.forEach($scope.smtcTags, function(s, i) {
            if (s._id === smtcTag._id) {
              $scope.smtcTags[i] = smtcTag;
            }
          });
        });
      };
    }
  ])

  .controller('SMTCTagFormModalInstanceController', [
    '$scope',
    '$rootScope',
    '$modalInstance',
    '$translate',
    'smtcTag',
    'SMTCTag',
    'FlashService',
    'shared',
    function($scope, $rootScope, $modalInstance, $translate, smtcTag, SMTCTag) {
      $scope.smtcTag = angular.copy(smtcTag);
      $scope.showErrors = false;
      $scope.message = '';
      $scope.model = { showPassword: false };

      var init = function() {
        if ($rootScope.currentUser) {
          $scope.currentUser = $rootScope.currentUser;
        }
      }

      var handleSuccess = function(response) {
        $scope.smtcTag.user = $scope.currentUser;
        if (response._id) $scope.smtcTag._id = response._id;
        $modalInstance.close($scope.smtcTag);
      };

      var handleError = function(response) {
        if (response.status === 422) {
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

      $scope.spectrumify = function() {
        angular.element("#tagColor").spectrum({
          color: $scope.smtcTag.color,
          preferredFormat: "hex",
          allowEmpty: true,
          showInput: true,
          showPaletteOnly: true,
          togglePaletteOnly: true,
          togglePaletteMoreText: 'more',
          togglePaletteLessText: 'less',
          palette: [
            ["#0079BF", "#61BD4f", "#FFAB4A", "#EB5A46", "#51E898"],
            ["#C4c9CC", "#F2D600", "#C377E0", "#FF80CE", "#00C2E0"]
          ]
        });
      }

      $scope.save = function(form) {
        if (form.$invalid) {
          $scope.showErrors = true;
          return;
        }
        if ($scope.smtcTag._id) {
          SMTCTag.update({_id: $scope.smtcTag._id}, $scope.smtcTag, handleSuccess, handleError);
        } else {
          SMTCTag.save({name: $scope.smtcTag.name, color: $scope.smtcTag.color, description: $scope.smtcTag.description}, handleSuccess, handleError);
        }
      };

      $scope.close = function() {
        $modalInstance.dismiss('cancel');
      };
      init();
    }
  ]);
