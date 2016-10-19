angular.module('Aggie')

.factory('TrendFetching', function($resource) {
  var Fetching = $resource('/api/v1/trend/:id/:op', {}, {
    'toggle': { method: 'PUT' }
  });

  return {
    set: function(trendId, enabled, success, failure) {
      return Fetching.toggle({ id: trendId, op: enabled ? 'enable' : 'disable' }, {}, success, failure).$promise;
    }
  };
});
