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

  var getReports = function(pluckContent) {
    var x = by.repeater("r in visibleReports.toArray() | orderBy:'-storedAt'");
    return element.all(pluckContent ? x.column('r.content') : x);
  };

  var getText = function(elm) {
    return elm.getText();
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

  it('should keep the batch around', function() {
    this.slow(10000);
    element(by.buttonText('Grab Batch')).click();
    var firstSet = getReports(true).map(getText);
    browser.get(browser.baseUrl + 'incidents');
    browser.get(browser.baseUrl + 'reports');
    element(by.buttonText('Grab Batch')).click();
    var secondSet = getReports(true).map(getText);
    return expect(firstSet).to.eventually.eql(secondSet);
  });

  it('should mark all and grab another', function() {
    this.slow(5000);
    element(by.buttonText('Grab Batch')).click();
    var firstSet = getReports(true).map(getText);
    element(by.buttonText('Mark All Read & Grab Another')).click();
    var secondSet = getReports(true).map(getText);
    return expect(firstSet).to.eventually.not.eql(secondSet);
  });

});

describe('grab batch with filter', function() {

  it('by keyword');
  it('by author');
  it('by author twice');
  it('by time');
  it('by time twice');
});
