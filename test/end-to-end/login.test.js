'use strict';

var utils = require('./e2e-tools');

before(utils.initDb);
after(utils.disconnectDropDb);

describe('login page', function() {
  beforeEach(utils.resetDb);
  it('should set the admin password', function() {
    utils.initAdmin('asdfasdf');
    utils.logOut();
    utils.logIn('admin', 'asdfasdf');
  });
});
