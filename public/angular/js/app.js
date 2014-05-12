angular.module('Aggie', ['ui.router', 'ui.bootstrap', 'ngResource']).
  config(['$urlRouterProvider', '$locationProvider',
    function($urlRouterProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise('/');
    }
  ]).run(['$rootScope', '$location', 'AuthService', function ($rootScope, $location, AuthService) {

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
  }]);
