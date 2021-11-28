'use strict';

var utils = require('./e2e-tools');
var reports = require('./fixtures/smsgh_reports.json');
var incidents = require('./fixtures/incidents.json');
var expect = utils.expect;

describe('Incident query filter', function() {
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

  it('should filter incidents by single tag', function() {
    // generate 2 reports
    browser.wait(utils.sendSmsghRequest(reports[0]));
    browser.wait(utils.sendSmsghRequest(reports[1]));
    // generate 2 incidents
    utils.createIncident(incidents[0]);
    utils.createIncident(incidents[1]);
    // add 1 report to each incident
    utils.addFirstReportToIncident(incidents[0]);
    utils.addFirstReportToIncident(incidents[1]);
    // filter by tag (from the first incident)
    var res1 = utils.filterIncidentsByTag(['doo']);
    // expect the results to be of incident `hello`
    return expect(res1).to.eventually.have.length(1);
  });

  it('should filter incidents by multiple tags', function() {
    // generate 4 reports
    browser.wait(utils.sendSmsghRequest(reports[0]));
    browser.wait(utils.sendSmsghRequest(reports[1]));
    browser.wait(utils.sendSmsghRequest(reports[2]));
    browser.wait(utils.sendSmsghRequest(reports[3]));

    // generate 2 incidents
    utils.createIncident(incidents[0]);
    utils.createIncident(incidents[1]);
    // add 2 reports to each incident
    utils.addFirstReportToIncident(incidents[0]);
    utils.addFirstReportToIncident(incidents[1]);
    utils.addFirstReportToIncident(incidents[0]);
    utils.addFirstReportToIncident(incidents[1]);
    // filter by tags (such that they are from the second incident)
    var res2 = utils.filterIncidentsByTag(['thank', 'you']);
    // expect the results to be details of incident `response`
    return expect(res2).to.eventually.have.length(1);
  });
});
