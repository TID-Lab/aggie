angular.module('Aggie')

.controller('TrendsIndexController', [
  '$scope',
  '$rootScope',
  '$timeout',
  'FlashService',
  'sourceTypes',
  'sources',
  'incidents',
  'trends',
  'Trend',
  'TrendFetching',
  'Socket',
  'aggieDateFilter',
  function($scope, $rootScope, $timeout, flash, sourceTypes, sources, incidents, trends, Trend, TrendFetching, Socket, aggieDateFilter) {
    $scope.trend = {};
    $scope.query = {};
    $scope.trends = trends;
    $scope.sources = sources;
    $scope.sourcesById = {};
    $scope.sourceTypes = sourceTypes;
    $scope.incidents = incidents.results;
    $scope.incidentsById;
    $scope.maxCount = 0;
    $scope.startTime = null;
    $scope.endTime = null;

    var init = function() {
      $scope.sourcesById = $scope.sources.reduce(groupById, {});
      $scope.incidentsById = $scope.incidents.reduce(groupById, {});
      parseQueries();
    };

    var parseQueries = function() {
      $scope.trends.forEach(function(trend) {
        trend.query = angular.fromJson(trend._query);
      });
    };

    var groupById = function(memo, item) {
      memo[item._id] = item;
      return memo;
    };

    var updateTrends = function(updatedTrend) {
      angular.forEach($scope.trends, function(trend) {
        if (trend._id !== updatedTrend._id) { return }
        updateTrendCount(trend, updatedTrend);
      });
    };

    var updateTrendCount = function(trend, updatedTrend) {
      var interval = 1000 * 60 * 5,
        startTime = $scope.startTime,
        endTime = $scope.endTime,
        maxCount = $scope.maxCount,
        counts = updatedTrend.counts.reverse(),
        countsByTimebox,
        displayCounts = [];

      if (counts.length) {
        countsByTimebox = counts.reduce(function(memo, item) {
          memo[item.timebox] = item;
          return memo;
        }, {});

        endTime = Math.max(endTime, parseInt(counts[counts.length - 1].timebox));
        startTime = Math.max(parseInt(counts[0].timebox), endTime - (interval * 48));

        for (var t = startTime; t <= endTime; t += interval) {
          var item = countsByTimebox[t],
            value = null;
          if (item) { value = item.counts }
          maxCount = Math.max(maxCount, value);
          displayCounts.push(value);
        }
      }

      $scope.startTime = startTime;
      $scope.endTime = endTime;
      $scope.maxCount = maxCount;

      trend.counts = counts;
      trend.displayCounts = displayCounts;
    };

    angular.forEach($scope.trends, function(trend) {
      Trend.get({ id: trend._id }, function(updatedTrend) {
        updateTrendCount(trend, updatedTrend);
      });
    });

    Socket.on('trend', updateTrends);

    $scope.parseKeywords = function(trend) {
      return angular.fromJson(trend._query);
    };

    $scope.deleteTrend = function(trend) {
      Trend.delete({id: trend._id}, function(){
        flash.setNotice('Trend was successfully deleted.');
         $rootScope.$state.go('trends', {}, { reload: true });
      }, function() {
        flash.setAlertNow('Trend failed to be deleted.');
      });
    };

    $scope.toggleEnabled = function(trend) {
      TrendFetching.set(trend._id, trend.enabled).then(function() {
        if (trend.enabled) {
          trend.lastEnabledAt = new Date().toISOString();
        }
      });
    };

    $scope.label = function(trend) {
      return typeof trend.enabled;
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
        before: aggieDateFilter(endTime, 'datepicker'),
        after: aggieDateFilter(startTime, 'datepicker')
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

    init();
  }
]);
