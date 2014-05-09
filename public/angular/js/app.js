var aggie = angular.module('Aggie', ['ui.router']);

aggie.config(["$stateProvider", "$urlRouterProvider", "$locationProvider",
  function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');

    $stateProvider.state('home', {
      url: '/',
      templateUrl: '/templates/home.html',
    }).state('reports', {
      url: '/reports',
      templateUrl: '/templates/reports.html',
      controller: function($scope) {
        $scope.items = ['A', 'List', 'Of', 'Reports'];
      }
    }).state('incidents', {
      url: '/incidents',
      templateUrl: '/templates/incidents.html',
      controller: function($scope){
        $scope.things = ['A', 'List', 'Of', 'Incidents'];
      }
    }).state('sources', {
      url: '/sources',
      templateUrl: '/templates/sources.html',
      controller: function($scope){
        $scope.things = ['A', 'List', 'Of', 'Sources'];
      }
    }).state('analysis', {
      url: '/analysis',
      templateUrl: '/templates/analysis.html'
    }).state('settings', {
      url: '/settings',
      templateUrl: '/templates/settings.html'
    }).state('user', {
      url: '/user',
      templateUrl: '/templates/user.html'
    });
  }
]);
