angular.module('Aggie')

.controller('ApplicationController', [
  '$scope',
  'FlashService',
  'Settings',
  function($scope, flash, settings) {
    $scope.flash = flash;

    // Set up Matomo analytics.
    settings.get('matomo', function success(data) {
      if (!data.matamo) {
        console.error("Matomo is not set up in Aggie's configuration");
        return;
      }
      if (!data.matomo.enabled) {
        console.error("Matomo is not correctly set up in Aggie's configuration");
        return;
      }

      var _paq = window._paq = window._paq || [];
      /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
      _paq.push(["setCookieDomain", data.matomo.cookie_domain]);
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u='https://' + data.matomo.dashboard_name + '.matomo.cloud/';
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', data.matomo.site_id]);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.src='//cdn.matomo.cloud/' + data.matomo.dashboard_name + '.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g,s);
      })();
    }, function failure(e) {
      console.error("Couldn't set up Matomo:", e);
    });
  }
]);
