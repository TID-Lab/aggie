'use strict';

var utils = require('./e2e-tools');
var reports = require('./fixtures/smsgh_reports2.json');
var expect = utils.expect;

describe(' query report filter', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  beforeEach(utils.toggleFetching.bind({}, 'Off'));
  beforeEach(utils.addSource.bind({}, 'SMS GH', { nickname: 'public', keywords: 'test', tags: 'sms, public' }));
  beforeEach(utils.addSource.bind({}, 'SMS GH', { nickname: 'monitor', keywords: 'ppb', tags: 'sms, monitor' }));
  beforeEach(utils.toggleFetching.bind({}, 'On'));

  afterEach(utils.deleteSource.bind({}, 'SMS GH', 'public'));
  afterEach(utils.deleteSource.bind({}, 'SMS GH', 'monitor'));
  afterEach(utils.toggleFetching.bind({}, 'Off'));
  afterEach(utils.resetBrowser);

  it('should filter reports by single tag', function() {
    // generate 2 reports
    browser.wait(utils.sendSmsghRequest(reports[0]));
    browser.wait(utils.sendSmsghRequest(reports[1]));
    browser.wait(utils.sendSmsghRequest(reports[2]));
    browser.wait(utils.sendSmsghRequest(reports[3]));

    browser.get(browser.baseUrl + 'reports');
    // filter by tag (from the first
    var res1 = utils.filterReportsByTag(['sms']);
    return expect(res1).to.eventually.have.length(4);
  });

  it('should filter reports by multiple tags', function() {
    // generate 4 reports
    browser.wait(utils.sendSmsghRequest(reports[0]));
    browser.wait(utils.sendSmsghRequest(reports[1]));
    browser.wait(utils.sendSmsghRequest(reports[2]));
    browser.wait(utils.sendSmsghRequest(reports[3]));

    browser.get(browser.baseUrl + 'reports');
    // filter by tags (such that they are from the second incident)
    var res2 = utils.filterReportsByTag(['sms', 'monitor']);
    // expect the results to be details of incident `response`
    return expect(res2).to.eventually.have.length(1);
  });
});
