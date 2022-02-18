'use strict';

var utils = require('./e2e-tools');
var reports = require('./fixtures/smsgh_reports.json');
var groups = require('./fixtures/groups.json');
var expect = utils.expect;

describe('Group query filter', function() {
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

  it('should filter groups by single tag', function() {
    // generate 2 reports
    browser.wait(utils.sendSmsghRequest(reports[0]));
    browser.wait(utils.sendSmsghRequest(reports[1]));
    // generate 2 groups
    utils.createGroup(groups[0]);
    utils.createGroup(groups[1]);
    // add 1 report to each group
    utils.addFirstReportToGroup(groups[0]);
    utils.addFirstReportToGroup(groups[1]);
    // filter by tag (from the first group)
    var res1 = utils.filterGroupsByTag(['doo']);
    // expect the results to be of group `hello`
    return expect(res1).to.eventually.have.length(1);
  });

  it('should filter groups by multiple tags', function() {
    // generate 4 reports
    browser.wait(utils.sendSmsghRequest(reports[0]));
    browser.wait(utils.sendSmsghRequest(reports[1]));
    browser.wait(utils.sendSmsghRequest(reports[2]));
    browser.wait(utils.sendSmsghRequest(reports[3]));

    // generate 2 groups
    utils.createGroup(groups[0]);
    utils.createGroup(groups[1]);
    // add 2 reports to each group
    utils.addFirstReportToGroup(groups[0]);
    utils.addFirstReportToGroup(groups[1]);
    utils.addFirstReportToGroup(groups[0]);
    utils.addFirstReportToGroup(groups[1]);
    // filter by tags (such that they are from the second group)
    var res2 = utils.filterGroupsByTag(['thank', 'you']);
    // expect the results to be details of group `response`
    return expect(res2).to.eventually.have.length(1);
  });
});
