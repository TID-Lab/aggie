'use strict';

var utils = require('./e2e-tools');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('grab batch', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.makeReports.bind({}, 20));
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  afterEach(utils.resetBrowser);

  var getReports = function() {
    return element.all(
      by.repeater("r in visibleReports.toArray() | orderBy:'-storedAt'"));
  };

  it('should not have a batch at first', function() {
    this.slow(4000);
    browser.get(browser.baseUrl + 'reports/batch');
    expect(getReports().count()).to.eventually.equal(0);
  });

  it('should grab a batch', function() {
    element(by.buttonText('Grab Batch')).click();
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + 'reports/batch');
    expect(getReports().count()).to.eventually.equal(10);
  });
});
