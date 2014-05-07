var util = require('util');

Error.NotFound = function(message) {
  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);
  this.status = 404;
  this.message = message || 'Not Found';
};

util.inherits(Error.NotFound, Error);
