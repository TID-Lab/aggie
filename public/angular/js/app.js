angular.module('Aggie', ['routes', 'ui.bootstrap']).
  config(['$urlRouterProvider', '$locationProvider',
    function($urlRouterProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise('/home');
    }
  ]).run(['$rootScope', '$location', 'AuthService', function ($rootScope, $location, AuthService) {
    var needsAuth = function () {
      ['/login'].indexOf($location.path()) == -1;
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (needsAuth() && !AuthService.isAuthenticated()) {
        $location.path('/login');
      }
    });
  }]);
