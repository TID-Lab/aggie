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
    fetching.once('message', function(message) {
      expect(message).to.contain('echo');
      done();
    });
    fetching.send('echo');
  });

  it('should broadcast messages to all forked process', function(done) {
    var modules = 2;
    // "Streaming" module to listen
    var streaming = processManager.fork('/controllers/streaming');
    streaming.once('message', function(message) {
      expect(message).to.contain('echo');
      if (--modules === 0) done();
      streaming.removeListener('message', function() {});
    });
    // "Fetching" module to listen
    var fetching = processManager.fork('/controllers/fetching');
    fetching.once('message', function(message) {
      expect(message).to.contain('echo');
      if (--modules === 0) done();
      fetching.removeListener('message', function() {});
    });
    // Broadcast message
    processManager.broadcast('echo');
  });

  it('should transmit messages between different forked process', function(done) {
    // "Streaming" module to listen
    var streaming = processManager.fork('/controllers/streaming');
    streaming.once('message', function(message) {
      expect(message).to.contain('echo');
      done();
    });
    // "Fetching" module to send
    var fetching = processManager.getChild('fetching');
    fetching.send('echo');
  });

});
