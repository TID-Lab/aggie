angular.module('Aggie')

.controller('TrendFormModalController', [
  '$rootScope',
  '$scope',
  '$location',
  '$modal',
  'Trend',
  'FlashService',
  function($rootScope, $scope, $location, $modal, Trend, flash) {

    $scope.create = function() {
      var modalInstance = $modal.open({
        controller: 'TrendFormModalInstanceController',
        templateUrl: '/templates/trends/modal.html',
        resolve: {
          sources: ['Source', function(Source) {
            return Source.query().$promise;
          }],
          incidents: ['Incident', function(Incident) {
            return Incident.query().$promise;
          }],
          trend: function() {
            return {};
          }
        }
      });

      var onModalClose = function (wasSuccessful) {
        if (wasSuccessful) {
          flash.setNotice('Trend was successfully created.');
          $rootScope.$state.go('analysis.trends', {}, { reload: true });
        } else {
          flash.setAlertNow('Trend failed to be created. Please contact support.');
        }
      };

      modalInstance.result.then(onModalClose);

    };
  }
])

.controller('TrendFormModalInstanceController', [
  '$scope',
  '$modalInstance',
  'sourceTypes',
  'sources',
  'incidents',
  'Trend',
  'trend',
  function($scope, $modalInstance, sourceTypes, sources, incidents, Trend, trend) {

    $scope.sources = sources;
    $scope.sourceTypes = sourceTypes;
    $scope.incidents = incidents.results;
    $scope.trend = angular.copy(trend);
    $scope._showErrors = false;
    $scope.isSaving = false;

    $scope.showErrors = function() {
      return $scope._showErrors;
    };

    $scope.save = function (form) {
      if (form.$invalid) {
        $scope._showErrors = true;
      } else {
        $scope.isSaving = true;
        window.setTimeout(function () {
        Trend.create($scope.trend, function (res) {
          $modalInstance.close(true);
        }, function (err) {
          $modalInstance.close(false);
        });
      }, 3000);
      }
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

  }
]);
