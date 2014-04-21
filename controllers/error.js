// Add a default status code to all error instances
Error.prototype.status = 500;

// Add extra error sub-classes
require('./errors/not-found');
require('./errors/validation');
