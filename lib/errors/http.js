var util = require('util');
var http = require('http');

Error.HTTP = function(status, message) {
  status = status || 500;
  message = message || http.STATUS_CODES[status] || 'Unknown';
  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);
  this.status = status;
  this.message = message;
};

util.inherits(Error.HTTP, Error);
