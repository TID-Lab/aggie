'use strict';

var utils = require('./e2e-tools');
var request = require('supertest');
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
  beforeEach(function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
  });
  afterEach(utils.deleteSource.bind({}, 'SMS GH', 'hello'));
  afterEach(utils.resetBrowser);

  var reqParams = {
    from: '9845098450',
    fulltext: 'loremipsumdolor',
    date: '2016-09-01',
    keyword: 'test'
  };

  var sendRequest = function() {
    var defer = promise.defer();
    browser.call(function() {
      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams)
        .end(function(err, res) {
          if (err) defer.fulfill(err);
          defer.fulfill(res);
        });
    });
    return defer.promise;
  };

  it('should listen with fetching:on and source:enabled', function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    utils.toggleFetching('On');
    utils.toggleSource('SMS GH', 'On');
    browser.sleep(500);
    browser.wait(sendRequest());
    browser.get(browser.baseUrl + 'reports');
    expect(utils.getReports().count()).to.eventually.equal(1);
    utils.toggleSource('SMS GH', 'Off');
    utils.toggleFetching('Off');
    utils.deleteSource('SMS GH', 'hello');
  });

  it('should not listen with fetching:on and source:disabled', function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    utils.toggleFetching('On');
    utils.toggleSource('SMS GH', 'Off');
    browser.sleep(500);
    browser.wait(sendRequest());
    expect(utils.getReports().count()).to.eventually.equal(0);
    utils.toggleFetching('Off');
    utils.deleteSource('SMS GH', 'hello');
  });

  it('should not listening wtih fetching:off and source:enabled', function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    utils.toggleFetching('Off');
    utils.toggleSource('SMS GH', 'On');
    browser.sleep(500);
    browser.wait(sendRequest());
    expect(utils.getReports().count()).to.eventually.equal(0);
    utils.toggleSource('SMS GH', 'Off');
    utils.deleteSource('SMS GH', 'hello');
  });

  it('should not listen with fetching:off and source:disabled', function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    utils.toggleFetching('Off');
    utils.toggleSource('SMS GH', 'Off');
    browser.sleep(500);
    browser.wait(sendRequest());
    expect(utils.getReports().count()).to.eventually.equal(0);
    utils.deleteSource('SMS GH', 'hello');
  });

  it('should not listen with fetching toggled from on to off and source:disabled', function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    utils.toggleFetching('On');
    utils.toggleFetching('Off');
    utils.toggleSource('SMS GH', 'Off');
    browser.sleep(500);
    browser.wait(sendRequest());
    expect(utils.getReports().count()).to.eventually.equal(0);
    utils.deleteSource('SMS GH', 'hello');
  });
});
