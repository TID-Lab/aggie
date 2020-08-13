angular.module('Aggie')

.factory('SMTCTag', function($resource) {
  return $resource('/api/v1/tag/:_id', null, {
    'query': { method: 'GET', isArray: true },
    'save': { method: 'POST' },
    'update': { method: 'PUT' },
    'delete': { method: 'DELETE'}
  })
});