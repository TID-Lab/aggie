angular.module('Aggie')

.factory('Settings', function($resource) {
  var Settings = $resource('/api/v1/settings/:type/:item/:action', {}, {
    update: { method: 'PUT' },
    test: { method: 'POST', ignoreLoadingBar: true }
  });

  var SettingsPublic = $resource('/api/v1/public/settings/:type/:item/:action', {}, {});

  return {
    get: function(item, success, failure) {
      var resource;
      if (item === 'gplaces') {
        resource = SettingsPublic;
      } else {
        resource = Settings;
      }
      return resource.get({ item: item }, function(data) {
        success(data);
      }, failure);
    },

    set: function(item, value, success, failure) {
      var body = {};
      body.settings = value;
      return Settings.update({ item: item }, body, success, failure);
    },

    test: function(type, item, settings, success, failure) {
      var body = { settings: settings };
      return Settings.test({ type: type, item: item, action: 'test' }, body, success, failure);
    },

    clear: function(item, success, failure) {
      return Settings.delete({ item: item }, {}, success, failure);
    }
  };
});
