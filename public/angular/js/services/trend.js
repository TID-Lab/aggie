angular.module('Aggie')

.factory('Trend', function($resource) {
  return $resource('/api/v1/trend/:id', null, {
    'save': { method: 'PUT' }
  });
});
