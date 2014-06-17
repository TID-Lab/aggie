angular.module('Aggie')

.factory('Report', function($resource) {
  var searchResults = [];

  return $resource('/api/v1/report/:id', null, {
    'query': { isArray: false },
    'save': { method: 'PUT' },
    'update': { method: 'PUT' }
  });
});
