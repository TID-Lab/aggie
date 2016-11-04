angular.module('Aggie')

.directive('aggieSparkline', ['aggieDateFilter', function(aggieDateFilter) {
  return {
    restrict: 'E',
    scope: {
      values: '=',
      height: '=',
      callback: '&',
      startTime: '&'
    },

    link: function(scope, el, attrs) {
      el.addClass('aggie-sparkline');

      var renderSparkline = function() {
        var values = scope.values.map(function(item) {
          return item.counts;
        });

        el.sparkline(values, {
          tooltipContainer: el,
          barWidth: '12px',
          barSpacing: '3px',
          height: scope.height + 'px',
          type: 'bar',
          tooltipFormatter: function(sparkline, options, fields) {
            var value = fields[0].value,
              offset = fields[0].offset,
              interval = 1000 * 60 * 5,
              date = new Date(parseInt(scope.startTime()) + offset * interval),
              reportText = value ? value + ' reports' : 'No data';
            return '<div>' + reportText + ' (' + aggieDateFilter(date, 'short_time') + ')</div>';
          },
          chartRangeMin: 0,
          tooltipClassname: 'aggie-tooltip',
          zeroColor: 'rgba(#000, 0.1)',
          nullColor: 'transparent'
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
