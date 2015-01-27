angular.module('Aggie')

.factory('Batch', function($resource) {
  return $resource('/api/v1/report/batch', null, {
    'load': { method: 'GET', isArray: false },
    'checkout': { method: 'PATCH', isArray: false },
    'cancel': { method: 'PUT' }
  });
});
