angular.module('Aggie')

.factory('Source', function($resource) {
  return $resource('/api/v1/source/:id', null, {
    'get': {method: 'GET',  isArray: false},
    'getAll': {method: 'GET', url: '/api/v1/source/', isArray: true},
    'save': { method: 'PUT' },
    'resetUnreadErrorCount': { method: 'PUT', url: '/api/v1/source/_events/:id' },
    'create': { method: 'POST' },
    'update': { method: 'PUT' }
  });
});
