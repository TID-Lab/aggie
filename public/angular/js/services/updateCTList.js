angular.module('Aggie')

.factory('UpdateCTList', function($resource) {
  return $resource('/api/v1/settings/updateCTList', null, {
    'update': { method: 'PUT' },
  });
});