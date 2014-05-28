angular.module('Aggie')

.factory('User', function($resource) {
  return $resource('/api/v1/user/:username', null, {
    'create': { method: 'POST' },
    'update': { method: 'PUT' }
  });
});
