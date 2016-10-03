angular.module('Aggie')

.factory('Fetching', function($resource) {
  var Fetching = $resource('/api/v1/settings/fetching/:op', {}, {
    toggle: { method: 'PUT' },
  });
  var state = null;

  return {
    get: function(success, failure) {
      return Fetching.get({}, function(data) {
        success(data.fetching);
      }, failure);
    },

    set: function(enabled, success, failure) {
      if (enabled === state) {
        return;
      }
      state = enabled;
      return Fetching.toggle({ op: enabled ? 'on' : 'off' }, {}, success, failure);
    }
  };
});
