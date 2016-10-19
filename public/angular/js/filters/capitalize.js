angular.module('Aggie')

.filter('capitalize', function() {
  return function(string) {
    if (!string) return;
    if (string === 'elmo') {
      return 'ELMO';
    } else {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  };
});
