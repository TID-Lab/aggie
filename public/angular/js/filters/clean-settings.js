angular.module('Aggie')

.filter('cleanSettings', [function() {
  return function(items) {
    var filtered = {};
    angular.forEach(items, function(value, key) {
      if (key != 'on' && key != 'configured') {
        filtered[key] = value;
      }
    });
    console.log(filtered);
    return filtered;
  };
}]);
