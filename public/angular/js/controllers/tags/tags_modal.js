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
              return smtcTag;
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
    '$modalInstance',
    '$translate',
    'smtcTag',
    'SMTCTag',
    'FlashService',
    'shared',
    function($scope, $modalInstance, $translate, smtcTag, SMTCTag) {
      $scope.smtcTag = angular.copy(smtcTag);
      $scope.showErrors = false;
      $scope.message = '';
      $scope.model = { showPassword: false };

      var handleSuccess = function(response) {
        $modalInstance.close(response);
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
          showPaletteOnly: true,
          togglePaletteOnly: true,
          togglePaletteMoreText: 'more',
          togglePaletteLessText: 'less',
          palette: [
            ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
            ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
            ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
            ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
            ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
            ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
            ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
            ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
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
    }
  ]);
