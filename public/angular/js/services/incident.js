angular.module('Aggie')

.factory('Incident', function($resource) {
  return $resource('/api/v1/incident/:id', null, {
    'query': { isArray: false },
    'create': { method: 'POST' },
    'update': { method: 'PUT' },
    'removeSelected': { method: 'POST', url: '/api/v1/incident/_selected', isArray: false },
    'addSMTCTag': { method: 'PATCH', url: '/api/v1/incident/_tag', isArray: false },
    'removeSMTCTag': { method: 'PATCH', url: '/api/v1/incident/_untag', isArray: false },
    'clearSMTCTags': { method: 'PATCH', url: '/api/v1/incident/_clearTags', isArray: false},
  });
});
