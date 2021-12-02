var util = require('util');

Error.AccessDenied = function(message) {
  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);
  this.status = 403;
  this.message = message || 'Access Denied';
};

util.inherits(Error.AccessDenied, Error);
