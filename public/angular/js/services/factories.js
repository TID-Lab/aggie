angular.module('Aggie')

.factory('Report', function($resource) {
  return $resource("/api/v1/report/:id", { id: '@_id' }, {
    'query': { isArray: false },
    'save': { method: 'PUT' }
  });
})

.factory('Source', function($resource) {
  return $resource("/api/v1/source/:id");
})
