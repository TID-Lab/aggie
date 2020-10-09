angular.module('Aggie')

.factory('Visualization', function($resource) {
  return $resource('/api/v1/viz', null, {
    'get': { method: 'GET' },
  });
});
