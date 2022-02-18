'use strict';

var utils = require('./e2e-tools');
var groups = require('./fixtures/groups.json');
var expect = utils.expect;

describe('/groups', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  afterEach(utils.resetBrowser);

  it('should create group', function() {
    utils.createGroup(groups[0]);
    var titles = utils.getGroupTitles();
    return expect(titles).to.eventually.have.members(['hello']);
  });

  it('should edit group', function() {
    utils.createGroup(groups[0]);
    utils.editGroup('hello', groups[2]);
    browser.get(browser.baseUrl + 'groups');
    var titles = utils.getGroupTitles();
    return expect(titles).to.eventually.have.members(['ciao']);
  });
});
