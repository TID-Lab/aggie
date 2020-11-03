angular.module('Aggie')

.controller('ApplicationController', [
  '$scope',
  'FlashService',
  'Settings',
  function($scope, flash, settings) {
    $scope.flash = flash;

    settings.get('matomo', function(data) {
      data.$promise.then(function(e) {
        if (e.matomo.send_data) {
          var _paq = window._paq = window._paq || [];
          /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
          _paq.push(["setCookieDomain", e.matomo.cookie_domain]);
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);
          (function() {
            var u=e.matomo.dashboard_url;
            _paq.push(['setTrackerUrl', u+'matomo.php']);
            _paq.push(['setSiteId', e.matomo.id_site]);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.type='text/javascript'; g.async=true; g.src='//cdn.matomo.cloud/cartercenter.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g,s);
          })();
        }
      });
    });    
  }
]);
