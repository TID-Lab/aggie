var request = require('request');
var _ = require('underscore');
var chance = new require('chance')();

// //////////////////////////////////////////////////////////////////////////////
// Notes:
// * Aggie needs to be running for these tests to work.
// * The test uses a dummy-bot that will output all dropped reports to STDOUT.
//
// Usage:
// $ `mocha test/manual/fetching.load.test.js [options]`
//
// Use the following command-line arguments:
//
// --sources=n                  [number of sources]
// --reports=n                  [total number of reports per source]
// --interval=n                 [number of milliseconds between reports on each source]
// --buffer=n                   [size of buffer for each source]
// --baseurl=http://server:port [base url where server is running]
// //////////////////////////////////////////////////////////////////////////////

var args = {
  sources: 1, // number of sources
  reports: 1000, // total number of reports
  interval: 10, // 100 reports per second
  buffer: 50, // buffer size for each Source
  baseurl: 'https://localhost:3000'
};

describe('Fetching load test', function() {
  // Get command line arguments
  before(function() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    _.each(process.argv, function(arg) {
      arg = arg.split('=');
      if (_.contains(['--sources', '--reports', '--interval', '--buffer', '--baseurl'], arg[0])) {
        args[arg[0].replace('--', '')] = arg[1];
      }
    });
  });

  it('should create new sources', function(done) {
    var options = {
      max: args.reports,
      interval: args.interval,
      queueCapacity: args.buffer
    };
    var remaining = args.sources;
    _.times(args.sources, function(i) {
      request.post(args.baseurl + '/api/v1/source', { form: { nickname: chance.word(), media: 'dummy-fast', keywords: JSON.stringify(options) } }, function(err, res, body) {
        if (err) return done(err);
        if (--remaining === 0) done();
      });
    });
  });

  it('should start fetching data', function(done) {
    request.put(args.baseurl + '/api/v1/settings/fetching/on', function() {
      done();
    });
  });
});
