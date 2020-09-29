angular.module('Aggie')

.factory('CTLists', function($resource) {
  return $resource('/api/v1/ctlists', null, {
    'get': { method: 'GET' },
  });
});
