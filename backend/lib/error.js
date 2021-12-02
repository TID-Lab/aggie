// Generic error class.

var _ = require('underscore');

// Add a default status code to all error instances
Error.prototype.status = 500;

// Decode errors from MongoDB
Error.decode = function(err) {
  if (!err) {
    return err;
  } else if (err.code) {
    switch (err.code) {
      // Duplicate key error
    case 11000:
    case 11001:
      return new Error.Validation(err.err.replace(/(.*)\$(.*)\_(.*)/, '$2') + '_not_unique');
    default:
      return new Error(err.err);
    }
  } else if (err.name === 'ValidationError') {
    var validationError = new Error.Validation();
    validationError.message = _.map(err.errors, function(error) {
      return error.path + '_' + error.type;
    });
    return validationError;
  } else {
    return err;
  }
};

// Add extra error sub-classes
require('./errors/http');
require('./errors/access-denied');
require('./errors/not-found');
require('./errors/validation');
