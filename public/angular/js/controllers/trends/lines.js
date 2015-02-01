angular.module('Aggie')

.controller('TrendsLinesController', [
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
  'tz',
  function($scope, $rootScope, flash, sourceTypes, sources, incidents, trends, Trend, TrendFetching, Socket, tz) {
    $scope.trend = {};
    $scope.query = {};
    $scope.trends = [];
    $scope.sources = sources;
    $scope.sourcesById = {};
    $scope.sourceTypes = sourceTypes;
    $scope.incidents = incidents.results;
    $scope.incidentsById;
    $scope.startTime = null;
    $scope.endTime = null;

    var FONTS = '"Lato","Helvetica Neue",Helvetica,Arial,sans-serif';
    var COLORS = ['#4661EE','#EC5657','#1BCDD1','#8FAABB','#B08BEB','#3EA0DD','#F5A52A','#23BFAA','#FAA586','#EB8CC6'];

    var config = {
      interval: 1000 * 60 * 5,
      perPage: 48
    };

    var init = function() {
      $scope.sourcesById = $scope.sources.reduce(groupById, {});
      $scope.incidentsById = $scope.incidents.reduce(groupById, {});

      processTrends(trends);
      renderChart();

      Socket.on('trend', onTrend);
    };

    var onTrend = function(trends) {
      var trendsCopy = angular.copy(trends);
      processTrends(trendsCopy);
      renderChart();
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
      var startTime = null,
        endTime = null;

      // Determine minimum startTime and maximum endTime
      trends.forEach(function(trend) {
        var counts = trend.counts.reverse();
        if (!counts.length) { return; }
        startTime = Math.min(parseInt(counts[0].timebox), startTime || Infinity);
        endTime = Math.max(parseInt(counts[counts.length - 1].timebox), endTime);
      });

      // Adjust startTime so no more than N timeboxes will be shown.
      startTime = Math.max(startTime, endTime - config.interval * config.perPage);

      trends.forEach(function(trend, i) {
        var counts = [],
          displayCounts = [],
          countsByTimebox = {};

        // Group counts by timebox for efficient lookup
        trend.counts.reduce(function(memo, item) {
          memo[item.timebox] = item;
          return memo;
        }, countsByTimebox);

        // Fill in missing timebox data
        for (var t = startTime; t <= endTime; t += config.interval) {
          var item = countsByTimebox[t];
          if (!item) {
            item = { counts: 0, timebox: t };
            countsByTimebox[t] = item;
          }
          counts.push(item);
        }

        trend.color = COLORS[i++ % COLORS.length];
        trend.counts = counts;
      });

      // Let Angular know our secrets...
      $scope.startTime = startTime;
      $scope.endTime = endTime;
      $scope.trends = trends;

      parseQueries();
    };

    var renderChart = function () {
      var chart = new CanvasJS.Chart('chartContainer', {
        data: buildDataSeries(),
        axisX: {
          labelFontSize: 11,
          labelFontFamily: FONTS,
          lineThickness: 1,
          tickThickness: 1
        },
        axisY: {
          labelFontSize: 11,
          labelFontFamily: FONTS,
          gridThickness: 1,
          lineThickness: 1,
          tickThickness: 1
        }
      });
      chart.render();
    };

    // Build the data series (plural) to be used in the chart.
    var buildDataSeries = function() {
      var series = [];

      // We reverse the trends array because the lines are built from bottom up
      // but the legend is built from top down.
      $scope.trends.slice(0).reverse().forEach(function(t) {
        if (!t.enabled) return;
        series.push({
          color: t.color,
          type: 'stackedArea',
          cursor: 'pointer',
          dataPoints: getDataPoints(t),
          lineThickness: 0,
          fillOpacity: 1
        });
      });

      return series;
    };

    // Get the data points for the chart for a given trend.
    var getDataPoints = function(trend) {
      return trend.counts.map(function(c) {
        var q = trend.query;
        return {
          x: new Date(parseInt(c.timebox)),
          y: c.counts,
          color: trend.color,
          click: function() { gotoReports(q, c); },
          toolTipContent: "<p>{y} Reports</p><p>{x}</p>{keywords}{media}{source}{incident}",
          keywords: q.keywords ? '<p>Keywords: ' + q.keywords + '</p>' : '',
          media: q.sourceType ? '<p>Media: ' + q.sourceType + '</p>' : '',
          source: q.sourceId ? '<p>Source: ' + $scope.sourcesById[q.sourceId].nickname + '</p>' : '',
          incident: q.incidentId ? '<p>Incident: ' + $scope.incidentsById[q.incidentId].title + '</p>' : ''
        };
      });
    };

    // Loads the report page with query params matching the passed query object and count.
    var gotoReports = function(query, count) {
      var startTime = new Date(parseInt(count.timebox));
      var endTime = new Date(parseInt(count.timebox) + config.interval);
      $rootScope.$state.go('reports', {
        keywords: query.keywords,
        before: tz(endTime, '%FT%T'),
        after: tz(startTime, '%FT%T'),
        incidentId: query.incidentId,
        media: query.sourceType,
        sourceId: query.sourceId
      });
    };

    $scope.parseKeywords = function(trend) {
      return angular.fromJson(trend._query);
    };

    $scope.deleteTrend = function(trend) {
      Trend.delete({id: trend._id}, function(){
        flash.setNotice('Trend was successfully deleted.');
         $rootScope.$state.go('analysis.trend-lines', {}, { reload: true });
      }, function() {
        flash.setAlertNow('Trend failed to be deleted.');
      });
    };

    $scope.toggleEnabled = function(trend) {
      TrendFetching.set(trend._id, trend.enabled).then(function() {
        if (trend.enabled) {
          trend.lastEnabledAt = new Date().toISOString();
        }
        renderChart();
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
        sourceType: trend.query.sourceType,
        sourceId: trend.query.sourceId,
        status: trend.query.status
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

    $scope.$on('$destroy', function(){
      Socket.removeAllListeners('trend');
    });

    init();
  }
]);
