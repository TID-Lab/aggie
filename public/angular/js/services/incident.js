angular.module('Aggie')

.factory('Incident', function($resource) {
  return $resource('/api/v1/incident/:id', null, {
    'query': { isArray: false },
    'create': { method: 'POST' },
    'update': { method: 'PUT' }
  });
});
