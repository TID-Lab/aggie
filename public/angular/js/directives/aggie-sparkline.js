angular.module('Aggie')

.directive("aggieSparkline", ['aggieDateFilter', function(aggieDateFilter) {
  return {
    restrict: 'E',
    scope: {
      values: '=',
      chartRangeMax: '=',
      callback: '&',
      startTime: '&'
    },

    link: function(scope, el, attrs) {
      el.addClass('aggie-sparkline');

      var renderSparkline = function() {
        el.sparkline(scope.values, {
          tooltipContainer: el,
          barWidth: '12px',
          barSpacing: '3px',
          height: '47px',
          type: 'bar',
          tooltipFormatter: function(sparkline, options, fields) {
            var value = fields[0].value,
              offset = fields[0].offset,
              interval = 1000 * 60 * 5,
              date = new Date(parseInt(scope.startTime()) + offset * interval),
              reportText = value ? value + ' reports' : 'No data';
            return '<div>' + reportText + ' (' + aggieDateFilter(date, 'datetime') + ')</div>';
          },
          chartRangeMin: 0,
          chartRangeMax: scope.chartRangeMax,
          tooltipClassname: 'aggie-tooltip',
          zeroColor: '#eee',
          nullColor: '#fff'
        });
      };

      scope.$watch('values', renderSparkline);
      scope.$watch('chartRangeMax', renderSparkline);

      el.on('sparklineClick', function(e) {
        scope.callback({ sparkEvent: e });
      });
    }
  };
}]);
