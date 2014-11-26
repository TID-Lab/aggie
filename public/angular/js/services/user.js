angular.module('Aggie')

.factory('User', function($resource) {
  return $resource('/api/v1/user/:_id', null, {
    'create': { method: 'POST' },
    'update': { method: 'PUT' }
  });
});
