angular.module('Aggie').factory('FlashService', [
  '$rootScope',
  '$translate',
  function($rootScope, $translate) {
    var flash = {}, currentFlash = {};

    $rootScope.$on('$stateChangeSuccess', function() {
      currentFlash = flash;
      flash = {};
    });

    return {
      getAlert: function() {
        return $translate.instant(currentFlash.alert);
      },

      getNotice: function() {
        return $translate.instant(currentFlash.notice);
      },

      setAlert: function(message) {
        flash = { alert: message };
      },

      setNotice: function(message) {
        flash = { notice: message };
     },

      setAlertNow: function(message) {
        currentFlash = { alert: message };
      },

      setNoticeNow: function(message) {
        currentFlash = { notice: message };
      }
    };
  }
]);
