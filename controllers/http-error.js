var http = require('http');

Error.HTTP = function(message, status) {
  if (typeof message === 'number') {
    status = message;
    message = null;
  }
  if (!message) {
    message = http.STATUS_CODES[status] || 'Unknown';
  }

  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);
  this.message = message;
  this.status = status;
};

Error.HTTP.prototype.__proto__ = Error.prototype;
