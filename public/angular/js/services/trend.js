angular.module('Aggie')

.factory('Trend', function($resource) {
  return $resource('/api/v1/trend/:id', null, {
    'create': { method: 'POST' },
    'save': { method: 'PUT' }
  });
});
