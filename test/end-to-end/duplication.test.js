'use strict';

var utils = require('./e2e-tools');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var promise = protractor.promise;


describe('test duplication of reports with different settings', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  afterEach(utils.resetBrowser);

  it('should add SMS Ghana source with keyword: test', function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
  });
  it('should listen with fetching:on and source:enabled', function() {

  });
  it('should not listen with fetching:on and source:disabled', function() {

  });
  it('should not listen with fetching:off and source:disabled', function() {

  });
  it('should not listening wtih fetching:off and source:enabled', function() {

  });
});
