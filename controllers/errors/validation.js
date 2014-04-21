Error.Validation = function(message) {
  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);
  this.message = message;
};

Error.Validation.prototype.__proto__ = Error.prototype;
