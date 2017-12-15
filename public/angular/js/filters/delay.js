var human = require('interval-to-human'),
  abbreviatedHuman = function(time, unit) {
    return human(time, unit).replace(/(\w)\w+$/, '$1');
  };

angular.module('Aggie')

  .filter('delay', ['$translate', function($translate) {
  return function(record) {
    var stored = new Date(record.storedAt).getTime();
    var authored = new Date(record.authoredAt).getTime();
    var delay = stored - authored;
    var minute = 60 * 1000;
    if (delay > minute) {
      return $translate.instant('entry.created') + ' + ' + abbreviatedHuman(delay);
    }
    return '';
  };
}]);
