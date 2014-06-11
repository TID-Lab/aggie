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

    // Source types
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

    .preferredLanguage('en');
  }
]);
