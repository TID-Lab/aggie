angular.module('Aggie')

.controller('TrendsIndexController', [
  '$scope',
  '$rootScope',
  'FlashService',
  'sourceTypes',
  'sources',
  'incidents',
  'trends',
  'Trend',
  'TrendFetching',
  'Socket',
  function($scope, $rootScope, flash, sourceTypes, sources, incidents, trends, Trend, TrendFetching, Socket) {
    $scope.trend = {};
    $scope.trends = trends;
    $scope.sources = sources;
    $scope.sourceTypes = sourceTypes;
    $scope.incidents = incidents.results;

    var updateTrends = function(trend) {
      angular.forEach($scope.trends, function(t) {
        updateTrendCount(t, trend);
      });
    };

    var needsCountUpdate = function(oldTrend, newTrend) {
      return !oldTrend.counts ||
        newTrend.counts.length > oldTrend.counts.length;
    };

    var updateTrendCount = function(oldTrend, newTrend) {
        if (oldTrend._id == newTrend._id) {
          if (needsCountUpdate(oldTrend, newTrend)) {
            oldTrend.counts = newTrend.counts.reverse();
            oldTrend.displayCounts = newTrend.counts.map(function(c) {
              return c.counts;
            }).join();
          }
        }
    };

    angular.forEach($scope.trends, function(trend) {
      Trend.get({id: trend._id}, function(t) {
        updateTrendCount(trend, t);
      });
    });

    Socket.on('trend', updateTrends);

    $scope.deleteTrend = function(trend) {
      Trend.delete({id: trend._id}, function(){
        flash.setNotice('Trend was successfully deleted.');
         $rootScope.$state.go('trends', {}, { reload: true });
      }, function() {
        flash.setAlertNow('Trend failed to be deleted.');
      });
    };

    $scope.toggleEnabled = function(trend) {
      var enabled = trend.enabled == "true";
      TrendFetching.set(trend._id, enabled);
    };

    $scope.showReport = function(sparkEvent, trend) {
      var bar = sparkEvent.sparklines[0].getCurrentRegionFields()[0];
      var count = trend.counts[bar.offset];
      var startTime = new Date(parseInt(count.timebox));
      var endTime = angular.copy(startTime);
      endTime.setMinutes(endTime.getMinutes() + 5);
      var query = angular.fromJson(trend._query);
      $rootScope.$state.go('reports', {
        keywords: query.keywords,
        before: endTime.toISOString(),
        after: startTime.toISOString(),
      });
    };

    $scope.trendClass = function(trend) {
      var enabled;
      if (typeof(trend.enabled) == 'boolean') {
        enabled = trend.enabled;
      } else {
        enabled = trend.enabled == 'true';
      }
      return enabled ? 'trend' : 'trend-disabled';
    };
  }
]);
