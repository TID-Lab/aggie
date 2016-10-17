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
    browser.sleep(500);
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

  var setAndExpect = function(fetchingOn, sourceOn, numExpect) {
    return function() {
      fetchingOn && utils.toggleFetching('On');
      !sourceOn && utils.toggleSource('SMS GH', 'Off');
      browser.wait(sendRequest());
      expect(utils.getReports().count()).to.eventually.equal(numExpect);
      fetchingOn && utils.toggleFetching('Off');
      sourceOn && utils.toggleSource('SMS GH', 'Off');
    };
  };

  it('should listen with fetching:on and source:enabled',
     setAndExpect(true, true, 1));

  it('should not listen with fetching:on and source:disabled',
     setAndExpect(true, false, 0));

  it('should not listening wtih fetching:off and source:enabled',
     setAndExpect(false, true, 0));

  it('should not listen with fetching:off and source:disabled',
     setAndExpect(false, false, 0));

  it('should not listen with fetching toggled from on to off and source:disabled', function() {
    utils.toggleFetching('On');
    setAndExpect(false, false, 0)();
  });
});
