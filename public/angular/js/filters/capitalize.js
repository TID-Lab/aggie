angular.module('Aggie')

.filter('capitalize', function() {
  return function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
})
