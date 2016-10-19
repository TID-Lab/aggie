angular.module('Aggie')

.factory('Fetching', function($resource) {
  var Fetching = $resource('/api/v1/settings/fetching/:op', {}, {
    toggle: { method: 'PUT' }
  });

  return {
    get: function(success, failure) {
      return Fetching.get({}, function(data) {
        success(data.fetching);
      }, failure);
    },

    set: function(enabled, success, failure) {
      return Fetching.toggle({ op: enabled ? 'on' : 'off' }, {}, success, failure);
    }
  };
});
