angular.module('Aggie')

.factory('Report', function($resource) {
  return $resource("/api/v1/report/:id");
})

.factory('Source', function($resource) {
  return $resource("/api/v1/source/:id");
})
