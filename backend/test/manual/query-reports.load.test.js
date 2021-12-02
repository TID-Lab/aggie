var request = require('request');
var _ = require('underscore');
var moment = require('moment');
var log = require('single-line-log').stdout;

////////////////////////////////////////////////////////////////////////////////
// Notes:
// * Aggie needs to be running for these tests to work.
// * The test fetches reports in a random manner
//
// Usage:
// $ `mocha test/manual/query-reports.load.test.js [options]`
//
// Use the following command-line arguments:
//
// --maxpages=n                   [maximum number of pages possible]
// --ramuptime=n                  [time in milliseconds between launching 2 clients]
// --maxclients=n                 [maximum number of clients to be launched]
// --waitbetweenrequests=n        [wait time in milliseconds between successive request by each client]
// --totalrequests=n              [total requests by each client]
// --baseurl=http://server:port   [base url where server is running]
////////////////////////////////////////////////////////////////////////////////

var args = {
  maxpages: 10000,
  ramuptime: 200,
  maxclients: 30,
  waitbetweenrequests: 1000,
  totalrequests: 10,
  baseurl: 'https://localhost:3000'
};

var errors = 0; // error count
var totalResponseTime = 0; // collective response time of all requests
var requestCount = 0; // number of requests so far
var finished = false;

// fire request to the server
function fireRequest(cb) {
  var page = _.random(0, args.maxpages);
  request.get(args.baseurl + '/api/v1/report?page=' + page, function(err, res, body) {
    return cb(err, res, body);
  });
}

// simulate a client by firing requests at frequent intervals
function simulateClient(cb) {
  (function loop(n) {
    setTimeout(function() {
      var start = moment();
      fireRequest(function(err, res, body) {
        if (err || res.statusCode !== 200) {
          errors++;
        }
        else {
          totalResponseTime += moment().diff(start);
          requestCount++;
        }
        if (--n) return loop(n);
        else return cb();
      });
    }, args.waitbetweenrequests);
  })(args.totalrequests);
}

// log progress
function logProgress() {
  (function repeat() {
    setTimeout(function() {
      if (finished) return;

      var averageResponseTime = totalResponseTime / requestCount;
      log('Errors:', errors,
          'Total Requests:', requestCount,
          'Average response time (sec):', moment.duration(averageResponseTime).asSeconds());

      logProgress();
    }, 100);
  })();
}

describe('Fetching load test', function() {
  // Get command line arguments
  before(function() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    _.each(process.argv, function(arg) {
      arg = arg.split('=');
      if (_.contains(['--maxpages', '--ramuptime', '--maxclients', '--waitbetweenrequests', '--totalrequests', '--baseurl'], arg[0])) {
        args[arg[0].replace('--', '')] = arg[1];
      }
    });
  });

  it('should fire continuous queries for reports', function(done) {
    this.timeout(0);
    logProgress();

    (function loop(n) {
      setTimeout(function() {
        simulateClient(function() {
          if (--n) return loop(n);


          finished = true;
          var averageResponseTime = totalResponseTime / requestCount;
          console.log('\nTotal clients:', args.maxclients,
                      'Errors:', errors,
                      'Total Requests:', requestCount,
                      'Average response time (sec):', moment.duration(averageResponseTime).asSeconds());

          return done();
        });
      }, args.ramuptime);
    })(args.maxclients);
  });
});
