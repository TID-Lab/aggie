angular.module('Aggie')

.directive("aggieSparkline", function() {
  return {
    restrict:"E",
    scope:{
      data:"@"
    },
    compile: function(tElement, tAttrs, transclude){
      tElement.replaceWith("<span>" + tAttrs.data + "</span>");
      return function(scope, element, attrs){
        attrs.$observe("data", function(newValue){
          element.html(newValue);
          element.sparkline('html', {
            defaultPixelsPerValue: 5,
            width: '200px',
            height: '100px',
            type: 'line'
          });
        });
      };
    }
  };
});
