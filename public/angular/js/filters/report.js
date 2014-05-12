var human = require('interval-to-human');
angular.module('Aggie')

.filter('delay', function() {
  return function(record) {
    var stored = new Date(record.storedAt).getTime();
    var authored = new Date(record.authoredAt).getTime();
    var delay = stored - authored
    var minute = 60000;
    if (delay > minute) {
      return 'Created +' + human(delay);
    }
    return '';
  };
})

.filter('interval', function() {
  return function(time) {
    var now = new Date().getTime();
    var then = new Date(time).getTime();
    return human(now - then);
  };
});
