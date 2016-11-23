'use strict';

var utils = require('./e2e-tools');
var request = require('supertest');
var expect = utils.expect;
var promise = protractor.promise;

describe('SMS GH', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  beforeEach(utils.toggleFetching.bind({}, 'Off'));
  beforeEach(utils.addSource.bind({}, 'SMS GH', { nickname: 'foo', keywords: 'test' }));

  afterEach(utils.deleteSource.bind({}, 'SMS GH', 'foo'));
  afterEach(utils.toggleFetching.bind({}, 'Off'));
  afterEach(utils.resetBrowser);

  var reqParams = {
    from: '9845098450',
    fulltext: 'loremipsumdolor',
    date: '2016-09-01',
    keyword: 'test'
  };

  var sendRequest = function() {
    var defer = promise.defer();
    request('http://localhost:1111')
    .get('/smsghana')
    .query(reqParams)
    .expect(200)
    .end(function(err, res) {
      if (err) return defer.fulfill(err);
      defer.fulfill(res);
    });
    return defer;
  };

  var makeReport = function() {
    var count1 = utils.getReports().count();
    utils.toggleFetching('On');
    browser.sleep(500)
      .then(sendRequest);
    browser.sleep(500);
    utils.toggleSource('SMS GH', 'Off');
    utils.toggleFetching('Off');
    browser.get(browser.baseUrl + 'reports');
    var count2 = utils.getReports().count();
    return expect(count2).to.eventually.be.above(count1);
  };

  it('should turn off and back on', function() {
    this.timeout(50000);
    this.slow(50000);
    var e1 = makeReport();
    utils.deleteSource('SMS GH', 'foo');
    utils.addSource('SMS GH', { nickname: 'foo', keywords: 'test' });
    var e2 = makeReport();
    return promise.all([e1, e2]);
  });
});
