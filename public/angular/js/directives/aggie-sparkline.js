angular.module('Aggie')

.directive("aggieSparkline", function() {
  return {
    restrict: 'E',
    scope: {
      data: '=data',
      callback: '&',
      chartRangeMax: '@'
    },

    link: function(scope, el, attrs) {
      el.addClass('aggie-sparkline');

      scope.$watch('data', function(data) {
        data = data || [];
        data.forEach(function(item, index) {
          data[index][0] = parseInt(item[0]);
        });
        el.sparkline(data, {
          tooltipContainer: el,
          defaultPixelsPerValue: 20,
          barWidth: '12px',
          barSpacing: '3px',
          height: '47px',
          type: 'bar',
          tooltipFormatter: function(sparkline, options, fields) {
            var value = fields[0].value,
              offset = fields[0].offset,
              date = new Date(new Date() + (offset * 1000 * 60 * 5));
            return '<div>' + value + ' reports (' + date.toISOString() + ')</div>';
          },
          chartRangeMin: 0,
          chartRangeMax: scope.chartRangeMax,
          tooltipClassname: 'aggie-tooltip',
          zeroColor: '#eee',
          nullColor: '#fff'
        });

        el.bind('sparklineClick', function(e) {
          scope.callback({ sparkEvent: e });
        });
      });
    }
  };
});
