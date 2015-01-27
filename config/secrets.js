// sets up configuration to be used by the server
// uses nconf so that configuration can be overwritten by environment variables

var nconf = require('nconf');
var path = require('path');
var fs = require('fs');
var S = require('string');
var jsmin = require('jsmin').jsmin;

// load server config, synchronously, so that its immediately available
var secretsFile = path.resolve(__dirname, 'secrets.json');
var data = fs.readFileSync(secretsFile, 'utf8');
  
// remove comments from secrets file
var secrets = JSON.parse(jsmin(data));
nconf.add('secrets', {type: 'literal', store: secrets});

// load server preferences
var prefsFile = path.resolve(__dirname, 'server-prefs.json');
nconf.add('prefs', {type: 'file', file: prefsFile});

// get all configuration
module.exports.get = function() {
  return nconf.get();
};

// update fetching flag
module.exports.updateFetching = function(flag, cb) {
  cb = cb || function() {};
  nconf.set('fetching', S(flag).toBoolean());
  nconf.save(function(err){
    return cb(err);
  });
};
