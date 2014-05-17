var human = require('interval-to-human'),
  abbreviatedHuman = function(time, unit) {
    return human(time, unit).replace(/(\w)\w+$/, "$1");
  };

angular.module('Aggie')

.filter('interval', function() {
  return function(time) {
    var now = new Date().getTime();
    var then = new Date(time).getTime();
    return abbreviatedHuman(now - then);
  };
});
