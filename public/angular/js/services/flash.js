angular.module('Aggie').factory('FlashService', [
  '$rootScope',
  '$translate',
  '$transitions',
  function($rootScope, $translate, $transitions) {
    var flash = {}, currentFlash = {};

    $transitions.onSuccess({}, function() {
      if (currentFlash.params && currentFlash.params.persist) {
        // Do nothing (I'm not sure why, just simplifying existing logic here).
      } else {
        currentFlash = flash;
      }
      flash = {};
    });

    return {
      getAlert: function() {
        return $translate.instant(currentFlash.alert, currentFlash.params);
      },

      getNotice: function() {
        return $translate.instant(currentFlash.notice, currentFlash.params);
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
