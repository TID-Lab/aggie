'use strict';

angular.module('Aggie')

.factory('Credentials', function($resource) {
  return $resource('/api/v1/credentials/:id', null, {
    get: { method: 'GET', isArray: false }
  });
});
