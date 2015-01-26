angular.module('Aggie')

.factory('Report', function($resource) {
  var searchResults = [];

  return $resource('/api/v1/report/:id', null, {
    'query': { isArray: false },
    'save': { method: 'PUT' },
    'update': { method: 'PUT' },
    'markAsRead': { method: 'POST', url: '/api/v1/report/_read', isArray: false },
    'flag': { method: 'POST', url: '/api/v1/report/_flag', isArray: false },
    'grabBatch': { method: 'GET', url: '/api/v1/report/batch/:id' },
    'cancelBatch': { method: 'PUT', url: '/api/v1/report/batch/cancel' }
  });
});
