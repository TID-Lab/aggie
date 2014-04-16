var expect = require('chai').expect;
var processManager = require('../controllers/process-manager');
var Source = require('../models/source');
var botMaster = require('../controllers/fetching/bot-master');
var request = require('supertest');

describe('Process manager', function() {
  before(function(done) {
    processManager.fork('/controllers/api');
    // Let API server start listening
    setTimeout(function() {
      done();
    }, 500);
  });

  it('should fork a process', function(done) {
    expect(processManager.children).to.be.an.instanceOf(Array);
    var children = processManager.children.length;
    var child = processManager.fork('/controllers/fetching');
    expect(child).to.have.property('pid');
    expect(child.pid).to.be.above(process.pid);
    expect(processManager.children).to.have.length(children + 1);
    done();
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
    var api = processManager.fork('/controllers/api');
    process.nextTick(function() {
      api.send('ping');
    });
    // Register "Fetching" as a listener of "API" for the "pong" event
    processManager.registerRoute({
      events: ['pong'],
      emitter: '/controllers/api',
      emitterModule: 'api',
      listenerModule: 'fetching',
      event: 'register'
    }, fetching);
  });

  it('should simulate a full inter-process messaging workflow', function(done) {
    processManager.fork('/controllers/api');
    processManager.fork('/controllers/fetching');
    var loginUser = function(callback) {
      request('http://localhost:3000')
        .post('/login')
        .send({username: 'admin', password: 'letmein'})
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          callback();
        });
    };
    var getReports = function(callback) {
      request('http://localhost:3000')
        .get('/api/report')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          process.nextTick(function() {
            callback(res.body)
          });
        });
    };
    var createSource = function(data, callback) {
      request('http://localhost:3000')
        .post('/api/source')
        .send(data)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          setTimeout(function() {
            callback()
          }, 500);
        });
    };
    var toggleFetching = function(state, callback) {
      request('http://localhost:3000')
        .put('/api/fetching/' + state)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          callback();
        });
    };
    loginUser(function() {
      getReports(function(reports) {
        expect(reports).to.be.an.instanceof(Array);
        var length = reports.length;
        createSource({type: 'dummy', keywords: 'Lorem ipsum'}, function() {
          toggleFetching('on', function() {
            setTimeout(function() {
              toggleFetching('off', function() {
                getReports(function(reports) {
                  expect(reports).to.be.an.instanceof(Array);
                  expect(reports).to.have.length.greaterThan(length);
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

});
