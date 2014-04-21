var http = require('http');
require('./errors/validation');

function httpStatus(err) {
  var status = 500;
  if (err instanceof Error.Validation) {
    status = 422;
  }
  return status;
};

function send(res, err) {
  if (typeof err === 'number') {
    res.send(err, http.STATUS_CODES[err]);
  } else {
    res.send(httpStatus(err) || 500, err.message || err);
  }
};

module.exports = {
  httpStatus: httpStatus,
  send: send
};
