// This filter is used to filter the list of settings got from the server, so that only
// the user-editable settings for source types are edited by the user

angular.module('Aggie')

.filter('cleanSettings', [function() {
  return function(items) {
    var filtered = {};
    angular.forEach(items, function(value, key) {
      if (key != 'on' && key != 'configured') {
        filtered[key] = value;
      }
    });
    return filtered;
  };
}]);
