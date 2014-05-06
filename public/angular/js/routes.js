angular.module('routes', ['ui.router']).
  config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'templates/home.html'
    }).state('login', {
      url: '/login',
      templateUrl: 'templates/login.html'
    }).state('logout', {
      url: '/logout',
      templateUrl: 'templates/logout.html'
    }).state('reports', {
      url: '/reports',
      templateUrl: 'templates/reports.html',
      controller: function($scope) {
        $scope.items = ['A', 'List', 'Of', 'Reports'];
      }
    }).state('incidents', {
      url: '/incidents',
      templateUrl: 'templates/incidents.html',
      controller: function($scope) {
        $scope.items = ['A', 'List', 'Of', 'Incidents'];
      }
    }).state('sources', {
      url: '/sources',
      templateUrl: 'templates/sources.html',
      controller: function($scope) {
        $scope.items = ['A', 'List', 'Of', 'Sources'];
      }
    }).state('analysis', {
      url: '/analysis',
      templateUrl: 'templates/analysis.html',
    }).state('settings', {
      url: '/settings',
      templateUrl: 'templates/settings.html',
    })
  }
]);
