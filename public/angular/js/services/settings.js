angular.module('Aggie')

.factory('Settings', function($resource) {
  var Settings = $resource('/api/v1/settings/:type/:item/', {}, {
    update: { method: 'PUT' },
    test: { method: 'POST' }
  });

  return {
    get: function(item, success, failure) {
      return Settings.get({  item: item }, function(data) {
        success(data);
      }, failure);
    },

    set: function(item, value, success, failure) {
      var body = {};
      body.settings = value;
      return Settings.update({ item: item }, body, success, failure);
    },

    test: function(type, item, value, success, failure) {
      var body = {};
      body.settings = value;
      return Settings.test({ type: type, item: item }, body, success, failure);
    }
  };
})

.factory('MediaSettingsModal', function($modal) {

  return {
    create: function(media, settings) {
      var modalInstance = $modal.open({
        controller: 'MediaSettingsModalInstanceController',
        templateUrl: 'templates/media/settings/' + media + '.html',
        resolve: {
          settingsValues: function() {
           return settings;
         },
        }
      });
    }
  };
});
