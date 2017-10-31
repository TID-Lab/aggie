angular.module('Aggie')
.factory('WidgetsSettingsModal', function($modal) {

  return {
    create: function(widget, settings) {
      var modalInstance = $modal.open({
        controller: 'WidgetsSettingsModalInstanceController',
        templateUrl: 'templates/widget-settings-modal.html',
        resolve: {
          widget: function() {
            return widget;
          },
          settingsValues: function() {
            return settings;
          }
        }
      });
    }
  };
});
