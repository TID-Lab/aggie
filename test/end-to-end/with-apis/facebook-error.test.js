'use strict';

var utils = require('../e2e-tools');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;
var promise = protractor.promise;

// Allow chai to wait for promises on the right-hand-side
chaiAsPromised.transformAsserterArgs = function(args) {
  return promise.all(args);
};

describe('Facebook source error', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  beforeEach(utils.toggleFetching.bind({}, 'Off'));
  beforeEach(utils.addSource.bind({}, 'Facebook', { nickname: 'test', url: 'jkfajklwertwerja' }));
  beforeEach(utils.toggleFetching.bind({}, 'On'));

  afterEach(utils.deleteSource.bind({}, 'Facebook', 'test'));
  afterEach(utils.toggleFetching.bind({}, 'Off'));
  afterEach(utils.resetBrowser);

  it('source should show "Off" when a source errors', function() {
    var e1 = expect(utils.getWarningCount('Facebook')).to.eventually.equal(1);
    var s1 = expect(utils.checkSourceState('Facebook')).to.eventually.equal('OFF');
    utils.toggleSource('Facebook', 'On');
    var e2 = expect(utils.getWarningCount('Facebook')).to.eventually.equal(2);
    var s2 = expect(utils.checkSourceState('Facebook')).to.eventually.equal('OFF');
    return promise.all([e1, e2, s1, s2]);
  });
});
