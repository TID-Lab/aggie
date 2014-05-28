angular.module('Aggie')

.filter('maxCount', function() {
  return function(count, max) {
    if (count > max) {
      return max + '+';
    } else {
      return count;
    }
  };
})
