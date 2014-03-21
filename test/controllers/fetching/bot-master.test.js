var expect = require('chai').expect;
var botMaster = require('../../../controllers/fetching/bot-master');
var botFactory = require('../../../controllers/fetching/bot-factory');

describe('Bot master', function() {
  before(function(done) {
    botMaster.kill();
    done();
  });

  it('should track all instantiated bots', function(done) {
    expect(botMaster.bots).to.be.empty;
    one = botFactory.create({source: 'dummy'});
    two = botFactory.create({source: 'dummy'});
    three = botFactory.create({source: 'dummy'});
    expect(botMaster.bots).to.have.length(3);
    done();
  });

  it('should start all bots', function(done) {
    expect(one.enabled).to.be.false;
    expect(two.enabled).to.be.false;
    expect(three.enabled).to.be.false;
    botMaster.start();
    expect(one.enabled).to.be.true;
    expect(two.enabled).to.be.true;
    expect(three.enabled).to.be.true;
    done();
  });

  it('should stop all bots', function(done) {
    botMaster.stop();
    expect(one.enabled).to.be.false;
    expect(two.enabled).to.be.false;
    expect(three.enabled).to.be.false;
    done();
  });

});
