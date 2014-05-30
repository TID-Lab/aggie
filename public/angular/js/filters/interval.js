var human = require('interval-to-human'),
  abbreviatedHuman = function(time, unit) {
    return human(time, unit).replace(/(\w)\w+$/, "$1");
  };

var timeDiff = function(time) {
  var now = new Date().getTime();
  var then = new Date(time).getTime();
  return now - then;
}

angular.module('Aggie')

.filter('human', function() {
  return function(time) {
    return human(timeDiff(time));
  };
})

.filter('interval', function() {
  return function(time) {
    var diff = timeDiff(time);
    if (diff < 60000) {
      return '0 m';
    }
    return abbreviatedHuman(diff);
  };
});
