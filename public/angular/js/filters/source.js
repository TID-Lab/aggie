angular.module('Aggie')

.filter('sourceName', function() {
  return function(source) {
    return source.nickname + ' (' + source.type + ')';
  };
})
