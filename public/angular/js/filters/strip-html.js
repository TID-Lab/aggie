angular.module('Aggie')

.filter('stripHtml', [function() {
  return function(text) {
    return String(text).replace(/<[^>]+>/gm, '');
  };
}]);
