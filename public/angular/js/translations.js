'use strict';
angular.module('Aggie').config([
  '$translateProvider',
  function($translateProvider) {
    $translateProvider
    .useStaticFilesLoader({
      prefix: '/translations/locale-',
      suffix: '.json'
    })
    .preferredLanguage('en')
    .fallbackLanguage(['en', 'debug'])
    .useSanitizeValueStrategy('sanitizeParameters')
    .useMissingTranslationHandlerLog();
  }
]);
