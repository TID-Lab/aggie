require('../init');
var request = require('request');
var processManager = require('../../lib/process-manager');
var io = require('../../node_modules/socket.io/node_modules/socket.io-client');
var _ = require('underscore');

////////////////////////////////////////////////////////////////////////////////
// Usage:
// $ `mocha test/manual/fetching.load.test.js [options]`
//
// Use the following command-line arguments:
//
// --sources=n    [number of sources]
// --reports=n    [total number of reports per source]
// --interval=n   [number of milliseconds between reports on each source]
// --buffer=n     [size of buffer for each source]
//
// The test uses a dummy-bot that will output all dropped reports to STDOUT
////////////////////////////////////////////////////////////////////////////////

var args = {
  sources: 1, // number of sources
  reports: 1000, // total number of reports
  interval: 10, // 100 reports per second
  buffer: 50 // buffer size for each Source
};

describe('Fetching load test', function() {
  // Get command line arguments
  before(function(done) {
    _.each(process.argv, function(arg) {
      arg = arg.split('=');
      if (_.contains(['--sources', '--reports', '--interval', '--buffer'], arg[0])) {
        args[arg[0].replace('--', '')] = arg[1];
      }
    });
    done();
  });

  it('should start Aggie', function(done) {
    processManager.fork('/lib/api');
    processManager.fork('/lib/fetching');
    processManager.fork('/lib/analytics');
    setTimeout(done, 1500);
  });

  it('should create sources', function(done) {
    this.timeout(100 * args.sources * 2);
    var options = {
      max: args.reports,
      interval: args.interval,
      queueCapacity: args.buffer
    };
    var remaining = args.sources;
    _.times(args.sources, function(i) {
      request.post('http://localhost:3000/api/v1/source', {form: {type: 'dummy-fast', keywords: JSON.stringify(options)}}, function(err, res, body) {
        if (err) return done(err);
        if (--remaining === 0) setTimeout(done, 100 * args.sources);
      });
    });
  });

  it('should start fetching data', function(done) {
    this.timeout(args.interval * args.reports * 2);
    request.put('http://localhost:3000/api/v1/fetching/on', function() {
      setTimeout(done, args.interval * args.reports);
    });
  });

  it('should stop fetching data', function(done) {
    request.put('http://localhost:3000/api/v1/fetching/off', function() {
      done();
    });
  });
});
