'use strict';

var utils = require('./e2e-tools');
var request = require('supertest');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var promise = protractor.promise;

// Allow chai to wait for promises on the right-hand-side
chaiAsPromised.transformAsserterArgs = function(args) {
  return promise.all(args);
};

describe.only('Incident query filter', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  beforeEach(utils.toggleFetching.bind({}, 'Off'));
  beforeEach(utils.addSource.bind({}, 'SMS GH', { nickname: 'foo', keywords: 'test' }));
  beforeEach(utils.toggleFetching.bind({}, 'On'));

  afterEach(utils.deleteSource.bind({}, 'SMS GH', 'foo'));
  afterEach(utils.toggleFetching.bind({}, 'Off'));
  afterEach(utils.resetBrowser);

  var reqParams1 = {
    from: '9845098450',
    fulltext: 'loremipsumdolor',
    date: '2016-09-01',
    keyword: 'test'
  };

  var reqParams2 = {
    from: '12345678',
    fulltext: 'foobarbaz',
    date: '2016-09-01',
    keyword: 'test'
  };

  var reqParams3 = {
    from: '987654321',
    fulltext: 'world',
    date: '2016-09-01',
    keyword: 'test'
  };

  var reqParams4 = {
    from: '0864213579',
    fulltext: 'whatwhat',
    date: '2016-09-01',
    keyword: 'test'
  };

  var incident1 = {
    title: 'hello',
    tags: 'hello, there, how, do, you, do',
    location: 'macau'
  };

  var incident2 = {
    title: 'response',
    tags: 'hello, I, am, good, thank, you',
    location: 'hong kong'
  };

  var sendRequest = function(requestParams) {
    var defer = promise.defer();
    request('http://localhost:1111')
    .get('/smsghana')
    .query(requestParams)
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
    var count2 = utils.getReports().count();
    return expect(count2).to.eventually.be.above(count1);
  };

  it('should filter incidents by single tag', function() {
    // generate some 2 reports
    browser.sleep(500)
      .then(sendRequest(reqParams1))
      .then(sendRequest(reqParams2))
    // generate 2 incidents
    utils.createIncident(incident1);
    utils.createIncident(incident2);
    // add 1 report to each incident
    utils.addReportToIncident(reqParams1, incident1);
    utils.addReportToIncident(reqParams2, incident2);
    // filter by tag
    // var res1 = utils.filterByTag('');
    // expect the right report, and the right count of reports
  });

  it('should filter incidents by multiple tags', function() {
    // generate some 4 reports
    browser.sleep(500)
      .then(sendRequest(reqParams1))
      .then(sendRequest(reqParams2))
      .then(sendRequest(reqParams3))
      .then(sendRequest(reqParams4));
    // generate 2 incidents
    utils.createIncident(incident1);
    utils.createIncident(incident2);
    // add 2 reports to each incident
    utils.addReportToIncident(reqParams1, incident1);
    utils.addReportToIncident(reqParams2, incident2);
    utils.addReportToIncident(reqParams3, incident1);
    utils.addReportToIncident(reqParams4, incident2);
    // filter by tags (such that there are one each from each report)
    // var res1 = utils.filterByTag('');
    // expect the right reports, right incident, and the right count of reports
  });
});
