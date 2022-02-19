// sets up configuration to be used by the server
// uses nconf so that configuration can be overwritten by environment variables

var nconf = require('nconf');
var path = require('path');
var _ = require('underscore');
var mkdirp = require('mkdirp')

// load server config, synchronously, so that its immediately available
var secretsFile = path.resolve(__dirname, 'secrets.json');

nconf.add('secrets', { type: 'file', file: secretsFile });

// load server preferences
var prefsFile = path.resolve(__dirname, 'server-prefs.json');
nconf.add('prefs', { type: 'file', file: prefsFile });

// get all configuration
var _configuration = nconf.get();

// set defaults
_.defaults(_configuration, { api_request_timeout: 60, logger: {} });
_.defaults(_configuration.logger, { SES: {}, file: {}, master: {}, api: {},
                                   fetching: {}, analytics: {} });
_.defaults(_configuration.logger.SES, { level: 'error', silent: false });
_.defaults(_configuration.logger.file, { level: 'debug', silent: false,
                                        colorize: true, timestamp: true,
                                        maxsize: 5242880, maxFiles: 10,
                                        json: false, prettyPrint: true });
_.defaults(_configuration.logger.master, { filename: 'logs/master.log' });
_.defaults(_configuration.logger.api, { filename: 'logs/api.log', log_requests: false,
                                       log_responses: false });
_.defaults(_configuration.logger.fetching, { filename: 'logs/fetching.log' });
_.defaults(_configuration.logger.analytics, { filename: 'logs/analytics.log' });

// ensure directories exist
mkdirp.sync(path.dirname(_configuration.logger.master.filename));
mkdirp.sync(path.dirname(_configuration.logger.api.filename));
mkdirp.sync(path.dirname(_configuration.logger.fetching.filename));
mkdirp.sync(path.dirname(_configuration.logger.analytics.filename));

// return configuration
module.exports.get = function(options) {
  if (options && options.reload) {

    // Load again to get changes done in different processes
    nconf.load();
    _configuration = nconf.get();
  }
  return _configuration;
};

// update fetching flag
module.exports.updateFetching = function(flag, cb) {
  cb = cb || function() {};
  nconf.set('fetching', !!flag);
  nconf.save(function(err) {
    return cb(err);
  });
};

// update settings
module.exports.update = function(type, settings, cb) {
  cb = cb || function() {};

  nconf.set(type, settings);
  nconf.save(function(err) {
    return cb(err);
  });
};

// clear settings
module.exports.clear = function(key, cb) {
  cb = cb || function() {};

  nconf.clear(key);

  nconf.save(function(err) {
    return cb(err);
  });
};
