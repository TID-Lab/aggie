'use strict';

var utils = require('./e2e-tools');
var incidents = require('./fixtures/incidents.json');
var expect = utils.expect;

describe('/incidents', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  afterEach(utils.resetBrowser);

  it('should create incident', function() {
    utils.createIncident(incidents[0]);
    var titles = utils.getIncidentTitles();
    return expect(titles).to.eventually.have.members(['hello']);
  });

  it('should edit incident', function() {
    utils.createIncident(incidents[0]);
    utils.editIncident('hello', incidents[2]);
    browser.get(browser.baseUrl + 'incidents');
    var titles = utils.getIncidentTitles();
    return expect(titles).to.eventually.have.members(['ciao']);
  });
});
