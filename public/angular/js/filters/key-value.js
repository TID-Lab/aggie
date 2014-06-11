var capitalize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

angular.module('Aggie')

.filter('queryKeyValue', [
  '$sce',
  function($sce) {
    return function(string) {
      var json = angular.fromJson(string);
      var output = '';
      angular.forEach(json, function(v, k) {
        output += capitalize(k) + ":&nbsp;&nbsp;" + v +
          '<br/>';
      });
      return $sce.trustAsHtml(output);
    };
  }
])
