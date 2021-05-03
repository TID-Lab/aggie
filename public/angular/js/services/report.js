angular.module('Aggie')

.factory('Report', function($resource) {
  var searchResults = [];

  return $resource('/api/v1/report/:id', null, {
    'query': { isArray: false },
    'queryComments': { url: '/api/v1/comments/:id', isArray: false },
    'save': { method: 'PUT' },
    'update': { method: 'PUT' },
    'toggleRead': { method: 'PATCH', url: '/api/v1/report/_read', isArray: false },
    'toggleEscalated': { method: 'PATCH', url: '/api/v1/report/_escalated', isArray: false },
    'addSMTCTag': { method: 'PATCH', url: '/api/v1/report/_tag', isArray: false },
    'removeSMTCTag': { method: 'PATCH', url: '/api/v1/report/_untag', isArray: false },
    'clearSMTCTags': { method: 'PATCH', url: '/api/v1/report/_clearTags', isArray: false},
    'linkToIncident': { method: 'PATCH', url: '/api/v1/report/_link', isArray: false },
    'unlinkFromIncident': { method: 'PATCH', url: '/api/v1/report/_unlink', isArray: false },
    'updateNotes': { method: 'PATCH', url: '/api/v1/report/_updateNotes', isArray: false },
    'updateEscalated': { method: 'PATCH', url: '/api/v1/report/_updateEscalated', isArray: false },
    'updateVeracity': { method: 'PATCH', url: '/api/v1/report/_updateVeracity', isArray: false },
  });
});
