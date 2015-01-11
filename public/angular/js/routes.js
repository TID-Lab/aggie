angular.module('Aggie')

.config([
  '$stateProvider',
  function($stateProvider, tz) {
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
      url: '/profile/:userId',
      templateUrl: '/templates/profile.html',
      controller: 'UsersProfileController',
      resolve: {
        users: ['User', function(User) {
          return User.query().$promise;
        }]
      }
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
      url: '/reports?keywords&page&before&after&sourceId&status&sourceType&incidentId',
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
            sourceId: params.sourceId,
            sourceType: params.sourceType,
            incidentId: params.incidentId,
            status: params.status
          }).$promise;
        }],
        sources: ['Source', function(Source) {
          return Source.query().$promise;
        }],
        incidents: ['Incident', function(Incident) {
          return Incident.query().$promise;
        }]
      }
    });

    $stateProvider.state('report', {
      url: '/reports/:id',
      templateUrl: '/templates/reports/show.html',
      controller: 'ReportsShowController'
    });

    $stateProvider.state('incidents', {
      url: '/incidents?page&title&locationName&assignedTo&status&verified',
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

    $stateProvider.state('incident', {
      url: '/incidents/:id?page',
      templateUrl: '/templates/incidents/show.html',
      controller: 'IncidentsShowController',
      resolve: {
        incident: ['Incident', '$stateParams', function(Incident, params) {
          return Incident.get({ id: params.id }).$promise;
        }],
        reports: ['Report', '$stateParams', function(Report, params) {
          var page = params.page || 1;
          return Report.query({
            incidentId: params.id,
            page: page - 1
          }).$promise;
        }],
        sources: ['Source', function(Source) {
          return Source.query().$promise;
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

    $stateProvider.state('analysis.trends', {
      url: '/trends',
      templateUrl: '/templates/trends/index.html',
      controller: 'TrendsIndexController',
      resolve: {
        sources: ['Source', function(Source) {
          return Source.query().$promise;
        }],
        incidents: ['Incident', function(Incident) {
          return Incident.query().$promise;
        }],
        trends: ['Trend', function(Trend) {
          return Trend.query().$promise;
        }]
      }
    });

    $stateProvider.state('analysis.incidentsMap', {
      url: '/incidents-map',
      templateUrl: '/templates/incidents/map.html',
      controller: 'IncidentsMapController',
      resolve: {
        incidents: ['Incident', function(Incident) {
          return Incident.query().$promise;
        }]
      }
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

    $stateProvider.state('choose_password', {
      url: '/choose_password/:token',
      templateUrl: '/templates/choose_password.html',
      controller: 'ChoosePasswordController',
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
