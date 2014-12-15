var util = require('util');
var config = require('../config/secrets');

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

var logger = function(message) {
  if (config.log === 'debug') console.log('%s - %s', timestamp(), message);
};

logger.warning = function(warning) {
  this('Warning: ' + warning.message);
};

logger.error = function(error) {
  this('Error: ' + error.message);
};

logger.debug = function(object) {
  this(typeof object === 'string' ? json : util.inspect(object));
};

module.exports = logger;
