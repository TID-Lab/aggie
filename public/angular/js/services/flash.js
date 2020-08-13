angular.module('Aggie').factory('FlashService', [
  '$rootScope',
  '$translate',
  function($rootScope, $translate) {
    var flash = {}, currentFlash = {};

    $rootScope.$on('$stateChangeSuccess', function() {
      if (currentFlash.params) {
        if (!currentFlash.params.persist) {
          currentFlash = flash;
        }
      } else {
        currentFlash = flash;
      }
      flash = {};
    });

    return {
      getAlert: function() {
        return $translate.instant(currentFlash.alert);
      },

      getNotice: function() {
        return $translate.instant(currentFlash.notice);
      },

      setAlert: function(message, params) {
        flash = { alert: message,
                  params: params
                };
      },

      setNotice: function(message, params) {
        flash = { notice: message,
                  params: params
                };
      },

      setAlertNow: function(message, params) {
        currentFlash = { alert: message,
                         params: params
                       };
      },

      setNoticeNow: function(message, params) {
        currentFlash = { notice: message,
                         params: params
                       };
      }
    };
  }
]);
