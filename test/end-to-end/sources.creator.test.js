'use strict';

var utils = require('./e2e-tools');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

describe('/sources creator', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  beforeEach(function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
  });
  afterEach(utils.deleteSource.bind({}, 'SMS GH', 'hello'));
  afterEach(utils.resetBrowser);

  it('should include the creator', function() {
    expect(utils.getSources('user')).to.eventually.have.members(['admin']);
  });
});
