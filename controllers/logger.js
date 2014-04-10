var config = require('../config/secrets');

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
};

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
};

module.exports = {
  warning: function(warning) {
    if (config.log === true) console.error('%s - %s', timestamp(), 'Warning: ' + warning.message);
  },
  error: function(error) {
    if (config.log === true) console.error('%s - %s', timestamp(), 'Error: ' + error.message);
  },
  log: function(message) {
    if (config.log === true) console.log('%s - %s', timestamp(), JSON.stringify(message));
  }
}
