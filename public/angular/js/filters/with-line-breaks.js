angular.module('Aggie')

.filter('withLineBreaks', function() {
  return function(string) {
    if (string) {
      string.replace('\n', '<br/>');
    }
  };
});
