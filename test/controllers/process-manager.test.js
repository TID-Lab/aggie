var expect = require('chai').expect;
var ProcessManager = require('../../controllers/process-manager').ProcessManager;
var pm = require('../../controllers/process-manager');

describe('Process manager', function() {

  it('should listen to messages', function(done) {
    var emitter = pm.on('test', function(message) {
      expect(message).to.have.property('ok');
      expect(message.ok).to.be.true;
    });
    expect(emitter).to.be.instanceof(ProcessManager);
    done();
  });

  it('should emit messages', function() {
    var received = pm.emit('test', {ok: true});
    expect(received).to.be.true;
  });
});
