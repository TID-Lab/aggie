'use strict';

angular.module('Aggie')

.factory('Credentials', function($resource) {
  return $resource('/api/v1/credentials/:_id', null, {});
});
