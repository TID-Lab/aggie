var utils = require('./init');
var expect = require('chai').expect;
var processManager = require('../../lib/process-manager');
var request = require('supertest');
var Source = require('../../models/source');
var Report = require('../../models/report');

/**
 * BEWARE, this test suite has side effects. The practical result is that no
 * other test suite should fork the '/lib/api' or '/lib/fetching' modules at
 * this time. In addition, there is inter-dependence between the tests within
 * this suite. Precisely, all tests depend on the first ('should fork a
 * process').
 *
 * Side effects
 * ------------
 * When a process is forked, it registers routes with the process manager to
 * subscribe to interprocess messages. As a reasonable precaution, the process
 * manager does not allow duplicate routes, and when a process is killed its
 * routes are not removed. As a result, if e.g. the /lib/fetching module is
 * forked, killed, and forked again, the routes for the second copy will fail to
 * be registered. The second copy of the /lib/fetching module then cannot
 * receive messages from other processes (e.g. /lib/api).
 *
 * Inter-dependence
 * ----------------
 * All of the tests in this module rely on the /lib/fetching and /lib/api
 * processes. Per the above discussion, each of these processes can only exist
 * once, so they must be shared by the tests here. As the first test creates
 * the /lib/fetching process, it cannot be done without.
 *
 * Resolution
 * ----------
 * Generally, tests with side effects and tests depending on each other should
 * be discouraged where possible. To fix this, I recommend that each test get
 * its own /lib/api and /lib/fetching process. To make this possible, the
 * process manager should remove routes for processes when they are killed.
 */
describe('Process manager', function() {
  before('Let API server start listening', function(done) {
    processManager.fork('/lib/api');
    setTimeout(done, 500);
  });

  it('should fork a process', function() {
    expect(processManager.children).to.be.an.instanceOf(Array);
    var children = processManager.children.length;
    var child = processManager.fork('/lib/fetching');
    expect(child).to.have.property('pid');
    expect(child.pid).to.be.above(process.pid);
    expect(processManager.children).to.have.length(children + 1);
  });

  it('should get a forked process', function() {
    var child = processManager.getChild('fetching');
    expect(child).to.have.property('moduleName');
    expect(child.moduleName).to.equal('fetching');
  });

  it('should echo messages between parent-child process', function(done) {
    var fetching = processManager.getChild('fetching');
    fetching.once('pong', function(message) {
      expect(message).to.have.property('event');
      expect(message.event).to.contain('pong');
      done();
    });
    fetching.send('ping');
  });

  it('should transmit messages between different forked process', function(done) {
    // "Fetching" module to listen
    var fetching = processManager.getChild('fetching');
    fetching.once('pong', function(message) {
      expect(message).to.have.property('event');
      expect(message.event).to.contain('pong');
      done();
    });
    // "API" module to send
    var api = processManager.fork('/lib/api');
    process.nextTick(function() {
      api.send('ping');
    });
    // Register "Fetching" as a listener of "API" for the "pong" event
    processManager.registerRoute({
      events: ['pong'],
      emitter: '/lib/api',
      emitterModule: 'api',
      listenerModule: 'fetching',
      event: 'register'
    }, fetching);
  });

  it('should simulate a full inter-process messaging workflow', function(done) {
    var getReports = function(callback) {
      request('https://localhost:3000')
        .get('/api/v1/report')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          process.nextTick(function() {
            callback(res.body);
          });
        });
    };
    var createSource = function(data, callback) {
      request('https://localhost:3000')
        .post('/api/v1/source')
        .send(data)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          setTimeout(function() {
            callback();
          }, 500);
        });
    };
    var toggleFetching = function(state, callback) {
      request('https://localhost:3000')
        .put('/api/v1/settings/fetching/' + state)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          callback();
        });
    };
    Report.remove(function(err) {
      if (err) return done(err);
      getReports(function(reports) {
        expect(reports).to.contain.property('total');
        expect(reports).to.contain.property('results');
        expect(reports.results).to.be.an.instanceof(Array);
        var length = reports.total;
        createSource({ nickname: 'lorem', media: 'dummy', keywords: 'Lorem ipsum' }, function() {
          toggleFetching('on', function() {
            setTimeout(function() {
              toggleFetching('off', function() {
                getReports(function(reports) {
                  expect(reports).to.contain.property('total');
                  expect(reports).to.contain.property('results');
                  expect(reports.total).to.be.greaterThan(length);
                  expect(reports.results).to.be.an.instanceof(Array);
                  expect(reports.results).to.have.length.greaterThan(length);
                  done();
                });
              });
            }, 500);
          });
        });
      });
    });
  });

  after(function() {
    // Clean-up child processes
    processManager.children.forEach(function(child) {
      child.kill();
    });
  });

  after(utils.wipeModels([Report, Source]));
  after(utils.expectModelsEmpty);
});
