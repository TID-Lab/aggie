angular.module('Aggie')

.factory('Report', function($resource) {
  var searchResults = [];

  return $resource('/api/v1/report/:id', { id: '@_id' }, {
    'query': { isArray: false },
    'save': { method: 'PUT' }
  });
})

.factory('Source', function($resource) {
  return $resource('/api/v1/source/:id', { id: '@_id' }, {
    'save': { method: 'PUT' },
    'resetUnreadErrorCount': { method: 'PUT', url: '/api/v1/source/_events/:id' },
    'create': { method: 'POST' },
    'update': { method: 'PUT' }
  });
})
