angular.module('Aggie')

.factory('Report', function($resource) {
  var searchResults = [];

  return $resource('/api/v1/report/:id', null, {
    'query': { isArray: false },
    'save': { method: 'PUT' },
    'update': { method: 'PUT' },
    'toggleRead': { method: 'PATCH', url: '/api/v1/report/_read', isArray: false },
    'toggleFlagged': { method: 'PATCH', url: '/api/v1/report/_flag', isArray: false },
    'addSMTCTag': { method: 'PATCH', url: '/api/v1/report/_tag', isArray: false },
    'removeSMTCTag': { method: 'PATCH', url: '/api/v1/report/_untag', isArray: false },
    'linkToIncident': { method: 'PATCH', url: '/api/v1/report/_link', isArray: false },
    'unlinkFromIncident': { method: 'PATCH', url: '/api/v1/report/_unlink', isArray: false }
  });
});
