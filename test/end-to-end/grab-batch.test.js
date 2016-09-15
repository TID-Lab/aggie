'use strict';

var utils = require('./e2e-tools');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;
var promise = protractor.promise;

// Allow chai to wait for promises on the right-hand-side
chaiAsPromised.transformAsserterArgs = function(args) {
  return promise.all(args);
};

describe('grab batch', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.makeReports(20));
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  afterEach(utils.resetBrowser);

  var getReports = function() {
    return element.all(
      by.repeater("r in visibleReports.toArray() | orderBy:'-storedAt'"));
  };

  it('should not have a batch at first', function() {
    this.slow(4000);
    browser.get(browser.baseUrl + 'reports/batch');
    return expect(getReports().count()).to.eventually.equal(0);
  });

  it('should grab a batch', function() {
    element(by.buttonText('Grab Batch')).click();
    return promise.all([
      expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + 'reports/batch'),
      expect(getReports().count()).to.eventually.equal(10)
    ]);
  });
});
