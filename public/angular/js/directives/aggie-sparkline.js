angular.module('Aggie')

.directive("aggieSparkline", function() {
  return {
    restrict:"E",
    scope:{
      data:"@",
      callback: '&'
    },
    compile: function(tElement, tAttrs, transclude){
      tElement.replaceWith("<span>" + tAttrs.data + "</span>");
      return function(scope, element, attrs){
        element.addClass('aggie-sparkline');
        attrs.$observe("data", function(newValue){
          element.html(newValue);
          element.sparkline('html', {
            tooltipContainer: element,
            barWidth: 12,
            barSpacing: 3,
            height: '47px',
            type: 'bar',
            tooltipFormat: '{{value}} reports',
            tooltipClassname: 'aggie-tooltip'
          });
          element.bind('sparklineClick', function(e) {
            scope.callback({ sparkEvent: e });
          });
        });
      };
    }
  };
});
