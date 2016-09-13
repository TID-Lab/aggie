'use strict';

var utils = require('./e2e-tools');

describe('login page', function() {
  it('should set the admin password', function() {
    utils.initAdmin('asdfasdf');
    utils.logOut();
    utils.logIn('admin', 'asdfasdf');
  });
});
