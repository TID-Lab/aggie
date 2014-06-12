angular.module('Aggie')

.filter('withLineBreaks', function() {
  return function(string) {
    return string.replace('\n', '<br/>');
  };
})
