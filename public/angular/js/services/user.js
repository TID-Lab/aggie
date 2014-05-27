angular.module('Aggie')

.factory('User', function($resource) {
  return $resource('/api/v1/user/:id', null, {
    'save': { method: 'PUT' }
  });
});
