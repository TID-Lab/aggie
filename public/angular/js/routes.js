angular.module('Aggie').config([
  '$stateProvider',
  function($stateProvider) {
    $stateProvider.state('home', {
      url: '/',
      templateUrl: '/templates/home.html'
    });

    $stateProvider.state('profile', {
      url: '/profile',
      templateUrl: '/templates/profile.html'
    });

    $stateProvider.state('login', {
      url: '/login',
      templateUrl: '/templates/login.html',
      controller: 'LoginController'
    });

    $stateProvider.state('reports', {
      url: '/reports',
      templateUrl: '/templates/reports.html',
      controller: 'ReportsController'
    });

    $stateProvider.state('report', {
      url: '/reports/:id',
      templateUrl: '/templates/show_report.html',
      controller: 'ShowReportController'
    });

    $stateProvider.state('incidents', {
      url: '/incidents',
      templateUrl: '/templates/incidents.html',
      controller: function($scope) {
        $scope.items = ['A', 'List', 'Of', 'Incidents'];
      }
    });

    $stateProvider.state('sources', {
      url: '/sources',
      templateUrl: '/templates/sources.html',
      controller: function($scope) {
        $scope.items = ['A', 'List', 'Of', 'Sources'];
      }
    });

    $stateProvider.state('analysis', {
      url: '/analysis',
      templateUrl: '/templates/analysis.html'
    })

    $stateProvider.state('settings', {
      url: '/settings',
      templateUrl: '/templates/settings.html'
    });

    $stateProvider.state('password_reset', {
      url: '/password_reset/:token',
      templateUrl: '/templates/password_reset.html',
      controller: 'PasswordResetController'
    });
  }
]);
