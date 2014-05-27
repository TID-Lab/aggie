require('./angular', { expose: 'angular' });
require('./angular-ui-router');
require('./ui-bootstrap');
require('./ui-bootstrap-templates');
require('./angular-resource');

angular.module('Aggie', ['ui.router', 'ui.bootstrap', 'ngResource'])

.config(['$urlRouterProvider', '$locationProvider',
  function($urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');
  }
])

.run(['$rootScope', '$location', 'AuthService', '$state', function ($rootScope, $location, AuthService, $state) {
  $rootScope.$state = $state;

  $rootScope.$watch('currentUser', function(currentUser) {
    if (!currentUser) { AuthService.getCurrentUser() }
  });

  var needsAuth = function () {
    return [].indexOf($location.path()) != -1;
  };

  $rootScope.$on('$stateChangeStart', function (event, next, current) {
    if (needsAuth() && !$rootScope.currentUser) {
      $location.path('/login');
    }
  });
}])

.value('sourceTypes', {
  'twitter': 'Twitter',
  // 'facebook': 'Facebook',
  'rss': 'RSS',
  // 'elmo': 'Elmo'
});

// Services
require('./services/auth');
require('./services/fetching');
require('./services/flash');
require('./services/queue');
require('./services/report');
require('./services/socket');
require('./services/source');

// Controllers
require('./controllers/application');
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

// Routes
require('./routes');

// Filters
require('./filters/interval');
require('./filters/delay');
require('./filters/interval');
require('./filters/aggie-date');

// Directives
require('./directives/aggie-confirm');
require('./directives/aggie-table');
require('./directives/aggie-toggle');
require('./directives/ng-focus');
