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

describe('Fetching toggle', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  beforeEach(utils.toggleFetching.bind({}, 'Off'));
  beforeEach(utils.addSource.bind({}, 'Twitter', {
    keywords: 'twitter',
    nickname: 'twit toot'
  }));

  afterEach(utils.deleteSource.bind({}, 'Twitter', 'twit toot'));
  afterEach(utils.toggleFetching.bind({}, 'Off'));
  afterEach(utils.resetBrowser);

  it('should not collect reports when fetching is off', function() {
    this.slow(2500);
    browser.sleep(1000);
    return expect(utils.countAllReports()).to.eventually.equal(0);
  });

  it('should collect reports when fetching is on', function() {
    this.slow(7000);
    utils.toggleFetching('On');
    browser.sleep(1000);
    return expect(utils.countAllReports()).to.eventually.be.at.least(1);
  });

  it('should not collect reports when fetching is on and sources are off', function() {
    this.slow(8000);
    utils.toggleSource('Twitter', 'Off');
    utils.toggleFetching('On');
    browser.sleep(1000);
    return expect(utils.countAllReports()).to.eventually.equal(0);
  });

  it('should not collect reports when sources are off and fetching is flipped', function() {
    this.slow(17000);
    utils.toggleFetching('On');
    browser.sleep(1000);
    utils.toggleSource('Twitter', 'Off');
    utils.toggleFetching('Off');
    browser.sleep(500);
    var count1 = utils.countAllReports();
    utils.toggleFetching('On');
    browser.sleep(2000);
    var count2 = utils.countAllReports();
    var e1 = expect(count1).to.eventually.be.at.least(1);
    var e2 = expect(count1).to.eventually.equal(count2);
    return promise.all([e1, e2]);
  });
});
