angular.module('Aggie')

.factory('Source', function($resource) {
  return $resource('/api/v1/source/:id', null, {
    'save': { method: 'PUT' },
    'resetUnreadErrorCount': { method: 'PUT', url: '/api/v1/source/_events/:id' },
    'create': { method: 'POST' },
    'update': { method: 'PUT' }
  });
});
