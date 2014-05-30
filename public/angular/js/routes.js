angular.module('Aggie')

.config([
  '$stateProvider',
  function($stateProvider) {
    $stateProvider.state('home', {
      url: '/',
      onEnter: function($state) {
        $state.go('reports');
      },
      data: {
        public: true
      }
    });

    $stateProvider.state('profile', {
      url: '/profile',
      templateUrl: '/templates/profile.html'
    });

    $stateProvider.state('login', {
      url: '/login',
      templateUrl: '/templates/login.html',
      controller: 'LoginController',
      data: {
        public: true
      }
    });

    $stateProvider.state('reports', {
      url: '/reports?keywords&page&before&after&sourceType&status',
      templateUrl: '/templates/reports/index.html',
      controller: 'ReportsIndexController',
      resolve: {
        reports: ['Report', '$stateParams', function(Report, params) {
          var page = params.page || 1;
          return Report.query({
            page: page - 1,
            keywords: params.keywords,
            after: params.after,
            before: params.before,
            sourceType: params.sourceType,
            status: params.status
          }).$promise;
        }],
        sources: ['Source', function(Source) {
          return Source.query().$promise;
        }]
      }
    });

    $stateProvider.state('report', {
      url: '/reports/:id',
      templateUrl: '/templates/reports/show.html',
      controller: 'ReportsShowController'
    });

    $stateProvider.state('incidents', {
      url: '/incidents?title&locationName&assignedTo&status&verified',
      templateUrl: '/templates/incidents/index.html',
      controller: 'IncidentsIndexController',
      resolve: {
        incidents: ['Incident', '$stateParams', function(Incident, params) {
          var page = params.page || 1;
          return Incident.query({
            page: page - 1,
            title: params.title,
            locationName: params.locationName,
            assignedTo: params.assignedTo,
            status: params.status,
            verified: params.verified
          }).$promise;
        }],
        users: ['User', function(User) {
          return User.query().$promise;
        }]
      }
    });

    $stateProvider.state('sources', {
      url: '/sources',
      templateUrl: '/templates/sources/index.html',
      controller: 'SourcesIndexController',
      resolve: {
        sources: ['Source', function(Source) {
          return Source.query().$promise;
        }]
      }
    });

    $stateProvider.state('source', {
      url: '/sources/:id',
      templateUrl: '/templates/sources/show.html',
      controller: 'SourcesShowController',
      resolve: {
        source: ['Source', '$stateParams', function(Source, params) {
          return Source.get({ id: params.id }).$promise;
        }]
      }
    });

    $stateProvider.state('users', {
      url: '/users',
      templateUrl: '/templates/users/index.html',
      controller: 'UsersIndexController',
      resolve: {
        users: ['User', function(User) {
          return User.query().$promise;
        }]
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
      controller: 'PasswordResetController',
      data: {
        public: true
      }
    });

    $stateProvider.state('404', {
      url: '/404',
      templateUrl: '/templates/404.html',
      data: {
        public: true
      }
    });
  }
]);
