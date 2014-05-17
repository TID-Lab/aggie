angular.module('Aggie')

.config([
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
      url: '/reports?keywords&page',
      templateUrl: '/templates/reports/index.html',
      controller: 'ReportsController',
      resolve: {
        reports: ['Report', '$stateParams', function(Report, params) {
          var page = params.page || 1;
          return Report.query({ page: page - 1, keywords: params.keywords }).$promise;
        }],
        sources: ['Source', function(Source) {
          return Source.query().$promise;
        }]
      }
    });

    $stateProvider.state('report', {
      url: '/reports/:id',
      templateUrl: '/templates/reports/show.html',
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
    });

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
