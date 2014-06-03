angular.module('Aggie')

.controller('TrendsIndexController', [
  '$state',
  '$scope',
  '$rootScope',
  'FlashService',
  'sourceTypes',
  'sources',
  'incidents',
  'trends',
  'Trend',
  'Socket',
  function($state, $scope, $rootScope, flash, sourceTypes, sources, incidents, trends, Trend, Socket) {
    $scope.trend = {};
    $scope.trends = trends;
    $scope.sources = sources;
    $scope.sourceTypes = sourceTypes;
    $scope.incidents = incidents.results;

    var updateTrendCount = function(trend) {
      angular.forEach($scope.trends, function(t) {
        if (t._id == trend._id) {
          if (!t.counts || trend.counts.length > t.counts.length) {
            t.displayCounts = trend.counts.map(function(c) {
              return c.counts;
            }).reverse().join();
          }
        }
      });
    };

    angular.forEach($scope.trends, function(trend) {
      Trend.get({id: trend._id}, function(t) {
        updateTrendCount(t);
      });
    });

    Socket.on('trend', updateTrendCount);

    $scope.createTrend = function(trend) {
      Trend.create(trend, function(t) {
        flash.setNoticeNow('Trend was successfully created.');
        $rootScope.$state.go('trends', {}, { reload: true });
      }, function(err) {
        flash.setAlertNow('Trend failed to be created.');
      });
    };
  }
]);

