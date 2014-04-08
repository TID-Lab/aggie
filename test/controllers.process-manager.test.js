var expect = require('chai').expect;
var processManager = require('../controllers/process-manager');

describe('Process manager', function() {

  it('should fork a process', function(done) {
    expect(processManager.children).to.be.an.instanceOf(Array);
    expect(processManager.children).to.have.length(0);
    var child = processManager.fork('/controllers/fetching');
    expect(child).to.have.property('pid');
    expect(child.pid).to.be.above(process.pid);
    expect(processManager.children).to.have.length(1);
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
    // Register "Fetching" as a listener of "API" for the "pong" event
    processManager.registerRoute({
      events: ['pong'],
      emitter: '/controllers/api',
      emitterModule: 'api',
      listenerModule: '/controllers/fetching',
      event: 'register'
    }, fetching);
    // "API" module to send
    var api = processManager.fork('/controllers/api');
    api.send('ping');
  });

});
