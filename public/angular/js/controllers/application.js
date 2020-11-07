angular.module('Aggie')

.controller('ApplicationController', [
  '$scope',
  'FlashService',
  'Settings',
  'matomoConfig',
  '$rootScope',
  function($scope, flash, settings, matomo, $rootScope) {
    $scope.flash = flash;

    // Set up Matomo analytics.
    if (!matomo.enabled) {
      console.log("Matomo is disabled.");
      return;
    }

    // Pageview Tracking
    var _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(["setCookieDomain", matomo.cookie_domain]);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u='https://' + matomo.dashboard_name + '.matomo.cloud/';
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', matomo.site_id]);
      var d=document,
        g=d.createElement('script'),
        s=d.getElementsByTagName('script')[0];
      g.type='text/javascript';
      g.async=true;
      g.src='//cdn.matomo.cloud/' + matomo.dashboard_name + '.matomo.cloud/matomo.js';
      s.parentNode.insertBefore(g,s);
    })();

    // Tag Management
    var _mtm = window._mtm = window._mtm || [];
    _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
    var d=document,
      g=d.createElement('script'),
      s=d.getElementsByTagName('script')[0];
    g.type='text/javascript';
    g.async=true;
    g.src='https://cdn.matomo.cloud/' + matomo.dashboard_name +'.matomo.cloud/container_' + matomo.container_id  + '.js';
    s.parentNode.insertBefore(g,s);

    // Sending Username Data
    $rootScope.$watch('currentUser', function() {
      var user = $rootScope.currentUser;
      var _paq = window._paq = window._paq || [];
      if (user) {
        _paq.push(["setUserId", user.username]);
      } 
      else {
        // https://developer.matomo.org/guides/tracking-javascript-guide#user-id
        // This doesn't seem to work fully, but it's good enough.
        _paq.push(['resetUserId']);
      }
    });
  }
]);
