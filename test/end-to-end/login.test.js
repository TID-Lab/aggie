'use strict';

var utils = require('./e2e-tools');

describe('login page', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  afterEach(utils.resetBrowser);

  it('should set the admin password', function() {
    this.slow(12000);
    utils.initAdmin('asdfasdf');
    utils.logOut();
    utils.logIn('admin', 'asdfasdf');
  });
});
