angular.module('Aggie')

.filter('maxCount', [
  'numberFilter',
  function(numberFilter) {
    return function(count, max) {
      if (count > max) {
        return numberFilter(max) + '+';
      } else {
        return numberFilter(count);
      }
    };
  }
]);
