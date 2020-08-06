angular.module('Aggie')

.factory('UpdateCTList', function($resource) {
  return $resource('/api/v1/settings/updateCTList/:directory', {directory: '../../config/crowdtangle_list.json'}, {
    'update': { method: 'PUT', isArray: false, ignoreLoadingBar: true, cache : true },
  });
});