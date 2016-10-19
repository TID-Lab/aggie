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

      modalInstance.result.then(function(trend) {
        Trend.create(trend, function(response) {
          $rootScope.$state.go($rootScope.$state.current, {}, { reload: true });
        }, function(err) {
          flash.setAlertNow('trend.create.error');
        });
      });
    };
  }
])

.controller('TrendFormModalInstanceController', [
  '$scope',
  '$modalInstance',
  'mediaOptions',
  'sources',
  'incidents',
  'trend',
  function($scope, $modalInstance, mediaOptions, sources, incidents, trend) {
    $scope.sources = sources;
    $scope.mediaOptions = mediaOptions;
    $scope.incidents = incidents.results;
    $scope.trend = angular.copy(trend);
    $scope._showErrors = false;

    $scope.showErrors = function() {
      return $scope._showErrors;
    };

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope._showErrors = true;
        return;
      }
      $modalInstance.close($scope.trend);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
