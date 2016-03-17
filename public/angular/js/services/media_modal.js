angular.module('Aggie')

.factory('MediaSettingsModal', function($modal) {

  return {
    create: function(media, settings) {
      var modalInstance = $modal.open({
        controller: 'MediaSettingsModalInstanceController',
        templateUrl: 'templates/media/settings/modal.html',
        resolve: {
          media: function() {
            return media;
          },
          settingsValues: function() {
            return settings;
          }
        }
      });
    }
  };
});
