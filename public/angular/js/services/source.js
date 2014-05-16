angular.module('Aggie')

.factory('Source', function($resource) {
  return $resource("/api/v1/source/:id");
});
