var util = require('util');

Error.Validation = function(message) {
  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);
  this.status = 422;
  this.message = message || 'Validation Error';
};

util.inherits(Error.Validation, Error);
