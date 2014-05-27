angular.module('Aggie')

.factory('User', function($resource) {
  return $resource('/api/v1/user/:username', null, {
    'update': { method: 'PUT' }
  });
});
