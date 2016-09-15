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

  describe('with filter', function() {
    beforeEach(utils.makeReports(9, 'philip', 'june 2016', 'foo'));
    beforeEach(utils.makeReports(5, 'philip', 'sept 2016', 'bar'));
    beforeEach(utils.makeReports(3, 'andres', 'june 2016', 'bar baz'));

    var clickAndExpectFrom = function(clickBy, howMany, fromWhere) {
      element(clickBy).click();
      var reports = getReports(true).map(getText);
      var e1 = expect(reports).to.eventually.have.length(howMany);
      var e2 = reports.then(function(arr) {
        expect(fromWhere).to.include.members(arr);
      });
      return promise.all([e1, e2]);
    };

    var authorPhilip = [
      '1 foo', '2 foo', '3 foo', '4 foo', '5 foo', '6 foo', '7 foo', '8 foo', '9 foo',
      '1 bar', '2 bar', '3 bar', '4 bar', '5 bar'
    ];

    var keywordBar = [
      '1 bar', '2 bar', '3 bar', '4 bar', '5 bar',
      '1 bar baz', '2 bar baz', '3 bar baz'
    ];

    var timeJune = [
      '1 foo', '2 foo', '3 foo', '4 foo', '5 foo', '6 foo', '7 foo', '8 foo', '9 foo',
      '1 bar baz', '2 bar baz', '3 bar baz'
    ];

    it('by author', function() {
      var e1 = utils.setFilter({ author: 'philip' });
      var e2 = clickAndExpectFrom(
        by.buttonText('Grab Batch'), 10, authorPhilip);
      return promise.all([e1, e2]);
    });

    it('by author twice', function() {
      var e1 = utils.setFilter({ author: 'philip' });
      var e2 = clickAndExpectFrom(
        by.buttonText('Grab Batch'), 10, authorPhilip);
      var e3 = clickAndExpectFrom(
        by.buttonText('Mark All Read & Grab Another'), 4, authorPhilip);
      return promise.all([e1, e2, e3]);
    });

    it('by time', function() {
      var e1 = utils.setFilter({ time: { after: '05/30/2016 12:00:00',
                                         before: '06/3/2016 12:00:00' } });
      var e2 = clickAndExpectFrom(by.buttonText('Grab Batch'), 10, timeJune);
      return promise.all([e1, e2]);
    });

    it('by time twice', function() {
      var e1 = utils.setFilter({ time: { after: '05/30/2016 12:00:00',
                                         before: '06/3/2016 12:00:00' } });
      var e2 = clickAndExpectFrom(by.buttonText('Grab Batch'), 10, timeJune);
      var e3 = clickAndExpectFrom(
        by.buttonText('Mark All Read & Grab Another'), 2, timeJune);
      return promise.all([e1, e2, e3]);
    });

    it('by keyword', function() {
      var e1 = utils.setFilter({ keywords: 'bar' });
      var e2 = clickAndExpectFrom(by.buttonText('Grab Batch'), 8, keywordBar);
      return promise.all([e1, e2]);
    });
  });
});
