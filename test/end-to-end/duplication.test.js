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
  fulltext: 'lorem ipsum dolor',
  date: '2016-09-01',
  keyword: 'test'
  };

  it('should add SMS Ghana source with keyword: test', function(done) {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    done();
  });
  it('should listen with fetching:on and source:enabled', function(done) {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
    utils.toggleFetching('On');
    utils.toggleSource('SMS GH', 'On');
    request('http://localhost:1111')
      .get('/smsghana')
      .query(reqParams)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
      });
    browser.get(browser.baseUrl + 'reports');
    done();
  });
/*
  it('should not listen with fetching:on and source:disabled', function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
  });
  it('should not listen with fetching:off and source:disabled', function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
  });
  it('should not listening wtih fetching:off and source:enabled', function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
  });
*/
});
