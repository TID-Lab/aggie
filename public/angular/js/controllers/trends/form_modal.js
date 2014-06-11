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
        templateUrl: 'templates/trends/modal.html',
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
          flash.setNotice('Trend was successfully created.');
          $rootScope.$state.go('trends', {}, { reload: true });
        }, function(err) {
          flash.setAlertNow('Trend failed to be created. Please contact support.');
        });
      });
    };
  }
])

.controller('TrendFormModalInstanceController', [
  '$scope',
  '$modalInstance',
  'sourceTypes',
  'sources',
  'incidents',
  'trend',
  function($scope, $modalInstance, sourceTypes, sources, incidents, trend) {
    $scope.sources = sources;
    $scope.sourceTypes = sourceTypes;
    $scope.incidents = incidents.results;
    $scope.trend = angular.copy(trend);
    $scope._showErrors = false

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
