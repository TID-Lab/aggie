angular.module('Aggie').config([
  '$translateProvider',
  function($translateProvider) {
    $translateProvider

    // Error messages
    .translations('en', {
      'username_not_unique': 'That username is already in our database. Please choose another.',
      'email_not_unique': 'That email is already in our database. Please choose another.',
      'email_invalid': 'That email is not valid. Please correct it and try again.',
      'password_too_short': 'That password was too short. Please use a longer one.',
    })

    // Notices
    .translations('en', {
      notice: {
        report: {
          unlinked: 'Report has been successfully unlinked'
        }
      }
    })

    // Status options
    .translations('en', {
      'relevant': 'Relevant',
      'irrelevant': 'Irrelevant',
      'assigned': 'Assigned',
      'unassigned': 'Unassigned',
    })

    // User roles
    .translations('en', {
      'viewer': 'Viewer',
      'monitor': 'Monitor',
      'manager': 'Manager',
      'admin': 'Admin',
    })

    // Source media
    .translations('en', {
      'twitter': 'Twitter',
      'rss': 'RSS',
      'elmo': 'Elmo',
      'facebook': 'Facebook'
    })

    // Incident status options
    .translations('en', {
      'new': 'New',
      'working': 'Working',
      'alert': 'Alert',
      'closed': 'Closed'
    })

    // Veracity options
    .translations('en', {
      veracity: {
        'true': 'Verified',
        'false': 'Unverified'
      }
    })

    // Trend query options
    .translations('en', {
      'keywords': 'Keywords',
      'media': 'Media',
      'sourceId': 'Source'
    })

    // Linked to report options
    .translations('en', {
      '* Any Incident': '* Any Incident',
      '* Without Incident': '* Without Incident'
    })

    // User roles
    .translations('es', {
      'viewer': 'Espectador',
      'monitor': 'Escucha',
      'manager': 'Jefe',
      'admin': 'Administración',
    })

    // Incident status options
    .translations('es', {
      'new': 'Nuevo',
      'working': 'Trabajando',
      'alert': 'Aviso',
      'closed': 'Cerrado'
    })

    .preferredLanguage('en');
  }
]);
