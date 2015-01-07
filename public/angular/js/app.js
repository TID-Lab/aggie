require('./angular', { expose: 'angular' });
require('./angular-ui-router');
require('./angular-sanitize');
require('./ui-bootstrap');
require('./ui-bootstrap-templates');
require('./angular-resource');
require('./angular-translate');
require('./jquery.sparkline');
require('../vendor/select2/select2');
require('../vendor/select2/ui-select2');
require('./loading-bar');

angular.module('Aggie', ['ui.router', 'ui.bootstrap', 'ngResource', 'pascalprecht.translate', 'ui.select2', 'ngSanitize', 'ngAutocomplete', 'angular-loading-bar'])

.config(['$urlRouterProvider', '$locationProvider',
  function($urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/404');
  }
])

.factory('shared', function() {
  var shared = {};
  shared.User = require('../../../shared/user');
  return shared;
})

.factory('tz', function() {
  return require('timezone');
})

.run(['$rootScope', '$urlRouter', '$location', 'AuthService', '$state', 'FlashService', function ($rootScope, $urlRouter, $location, AuthService, $state, flash) {
  $rootScope.$state = $state;

  var publicRoute = function(state) {
    return !!(state.data && state.data.public === true)
  };

  $rootScope.$on('$stateChangeSuccess', function(e, toState) {
    if (!publicRoute(toState) && !$rootScope.currentUser) {
      e.preventDefault();
      res = AuthService.getCurrentUser().then(function() {
        if ($rootScope.currentUser) {
          $urlRouter.sync();
        } else {
          flash.setAlert('You must be logged in before accessing that page.');
          $state.go('login');
        }
      }).catch(function(error) {
        flash.setAlert('Sorry, we had some trouble finding your user account. Please log in again.');
        $state.go('login');
      });
    }
  });
}]);

// Configuration
require('./config');
require('./routes');
require('./translations');

// Services
require('./services/auth');
require('./services/fetching');
require('./services/flash');
require('./services/queue');
require('./services/report');
require('./services/socket');
require('./services/source');
require('./services/user');
require('./services/incident');
require('./services/trend');
require('./services/trend_fetching');
require('./services/map');

// Controllers
require('./controllers/application');
require('./controllers/choose_password');
require('./controllers/fetching');
require('./controllers/login');
require('./controllers/navbar');
require('./controllers/password_reset');
require('./controllers/password_reset_modal');
require('./controllers/reports/index');
require('./controllers/reports/show');
require('./controllers/sources/form_modal');
require('./controllers/sources/index');
require('./controllers/sources/show');
require('./controllers/users/form_modal');
require('./controllers/users/index');
require('./controllers/incidents/index');
require('./controllers/incidents/show');
require('./controllers/incidents/map');
require('./controllers/incidents/form_modal');
require('./controllers/incidents/report_incident_modal');
require('./controllers/trends/index');
require('./controllers/analysis');
require('./controllers/trends/form_modal');
require('./controllers/datetime_modal');

// Routes
require('./routes');

// Filters
require('./filters/aggie-date');
require('./filters/capitalize');
require('./filters/delay');
require('./filters/interval');
require('./filters/max-count');
require('./filters/with-line-breaks');

// Directives
require('./directives/aggie-confirm');
require('./directives/aggie-datepicker');
require('./directives/aggie-table');
require('./directives/aggie-toggle');
require('./directives/aggie-sparkline');
require('./directives/ng-focus');
require('./directives/ng-password-match');
require('./directives/ng-autocomplete');
require('./directives/ng-minmax');
