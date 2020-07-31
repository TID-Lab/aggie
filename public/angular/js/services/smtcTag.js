angular.module('Aggie')

.factory('SMTCTag', function($resource) {
  return $resource('/api/v1/tag/:id', null, {
    'query': { method: 'GET', isArray: true },
    'save': { method: 'POST' },
    'delete': { method: 'DELETE'}
  })
});