angular.module('Aggie')

.controller('TrendsBarsController', [
  '$scope',
  '$rootScope',
  'FlashService',
  'mediaOptions',
  'sources',
  'incidents',
  'trends',
  'Trend',
  'TrendFetching',
  'Socket',
  'tz',
  function($scope, $rootScope, flash, mediaOptions, sources, incidents, trends, Trend, TrendFetching, Socket, tz) {
    $scope.trend = {};
    $scope.query = {};
    $scope.trends = [];
    $scope.sources = sources;
    $scope.sourcesById = {};
    $scope.mediaOptions = mediaOptions;
    $scope.incidents = incidents.results;
    $scope.incidentsById;
    $scope.startTime = null;
    $scope.endTime = null;

    var config = {
      interval: 1000 * 60 * 5,
      perPage: 48
    };

    var init = function() {
      $scope.sourcesById = $scope.sources.reduce(groupById, {});
      $scope.incidentsById = $scope.incidents.reduce(groupById, {});

      processTrends(trends);

      Socket.on('trend', onTrend);
    };

    var onTrend = function(trends) {
      var trendsCopy = angular.copy(trends);
      processTrends(trendsCopy);
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

    var processTrends = function(trends) {
      var startTime = null, endTime = null;

      // Determine minimum startTime and maximum endTime
      trends.forEach(function(trend) {
        var counts = trend.counts.reverse();
        if (!counts.length) { return; }
        startTime = Math.min(parseInt(counts[0].timebox), startTime || Infinity);
        endTime = Math.max(parseInt(counts[counts.length - 1].timebox), endTime);
      });

      // Adjust startTime so no more than N timeboxes will be shown.
      startTime = Math.max(startTime, endTime - config.interval * config.perPage);

      trends.forEach(function(trend) {
        var counts = [],
          displayCounts = [],
          countsByTimebox = {};

        // Group counts by timebox for efficient lookup
        trend.counts.reduce(function(memo, item) {
          memo[item.timebox] = item;
          return memo;
        }, countsByTimebox);

        // Fill in missing timebox data, and get max count over range.
        trend.max = 0;
        for (var t = startTime; t <= endTime; t += config.interval) {
          if (countsByTimebox[t])
            trend.max = Math.max(trend.max, countsByTimebox[t].counts);
          else
            countsByTimebox[t] = { counts: null, timebox: t };
          counts.push(countsByTimebox[t]);
        }

        trend.counts = counts;
        trend.minmax = Math.min(300, trend.max / 2);
      });

      // Let Angular know our secrets...
      $scope.startTime = startTime;
      $scope.endTime = endTime;
      $scope.trends = trends;

      parseQueries();
    };

    $scope.parseKeywords = function(trend) {
      return angular.fromJson(trend._query);
    };

    $scope.deleteTrend = function(trend) {
      Trend.delete({ id: trend._id }, function() {
        flash.setNotice('trend.delete.success');
        $rootScope.$state.go('analysis.trend-bars', {}, { reload: true });
      }, function() {
        flash.setAlertNow('trend.delete.error');
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
      var endTime = new Date(parseInt(count.timebox) + config.interval);
      $rootScope.$state.go('reports', {
        keywords: trend.query.keywords,
        before: tz(endTime, '%FT%T'),
        after: tz(startTime, '%FT%T'),
        incidentId: trend.query.incidentId,
        media: trend.query.media,
        sourceId: trend.query.sourceId,
        status: trend.query.status
      });
    };

    $scope.trendClass = function(trend) {
      var enabled;
      if (typeof (trend.enabled) == 'boolean') {
        enabled = trend.enabled;
      } else {
        enabled = trend.enabled == 'true';
      }
      return enabled ? 'trend' : 'trend-disabled';
    };

    $scope.$on('$destroy', function() {
      Socket.removeAllListeners('trend');
    });

    init();
  }
]);
