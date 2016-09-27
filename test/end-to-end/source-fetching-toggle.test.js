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
  afterEach(utils.resetBrowser);
  var reqParams = {
  from: '9845098450',
  fulltext: 'loremipsumdolor',
  date: '2016-09-01',
  keyword: 'test'
  };

  var chain = function() {
    var defer = promise.defer();
    defer.fulfill(true);
    return defer.promise;
  };

  var sendRequest = function(done) {
    request('http://localhost:1111')
    .get('/smsghana')
    .query(reqParams)
    .expect(200)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
    });
  };

  it('should listen with fetching:on and source:enabled', function(done) {
    chain()
    .then(function() {
      utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    })
    .then(function() {
      utils.toggleFetching('On');
    })
    .then(function() {
      utils.toggleSource('SMS GH', 'On');
    })
    .then(function() {
      sendRequest(done);
    });
    browser.get(browser.baseUrl + 'reports');
    expect(utils.getReports().count()).to.eventually.equal(1);
    utils.toggleSource('SMS GH', 'Off');
    utils.toggleFetching('Off');
    utils.deleteSource('SMS GH', 'hello');
    done();
  });
  it('should not listen with fetching:on and source:disabled', function(done) {
    chain()
    .then(function() {
      utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    })
    .then(function() {
      utils.toggleFetching('On');
    })
    .then(function() {
      utils.toggleSource('SMS GH', 'Off');
    })
    .then(function() {
      sendRequest(done);
    });
    expect(utils.getReports().count()).to.eventually.equal(0);
    utils.toggleFetching('Off');
    utils.deleteSource('SMS GH', 'hello');
    done();
  });

  it('should not listening wtih fetching:off and source:enabled', function(done) {
    chain()
    .then(function() {
      utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    })
    .then(function() {
      utils.toggleFetching('Off');
    })
    .then(function() {
      utils.toggleSource('SMS GH', 'On');
    })
    .then(function() {
      sendRequest(done);
    });
    expect(utils.getReports().count()).to.eventually.equal(0);
    utils.toggleSource('SMS GH', 'Off');
    utils.deleteSource('SMS GH', 'hello');
    done();
  });

  it('should not listen with fetching:off and source:disabled', function(done) {
    chain()
    .then(function() {
      utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    })
    .then(function() {
      utils.toggleFetching('Off');
    })
    .then(function() {
      utils.toggleSource('SMS GH', 'Off');
    })
    .then(function() {
      sendRequest(done);
    });
    expect(utils.getReports().count()).to.eventually.equal(0);
    utils.deleteSource('SMS GH', 'hello');
    done();
  });

  it('should not listen with fetching toggled from on to off and source:disabled', function(done) {
    chain()
    .then(function() {
      utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    })
    .then(function() {
      utils.toggleFetching('On');
    })
    .then(function() {
      utils.toggleFetching('Off');
    })
    .then(function() {
      utils.toggleSource('SMS GH', 'Off');
    })
    .then(function() {
      sendRequest(done);
    });
    expect(utils.getReports().count()).to.eventually.equal(0);
    utils.deleteSource('SMS GH', 'hello');
    done();
});
});
