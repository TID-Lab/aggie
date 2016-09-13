'use strict';

var url = 'https://localhost:3000';

exports.init = function() {
  browser.get(url);
};

exports.initAdmin = function(password) {
  exports.init();
  expect(browser.getCurrentUrl()).toEqual(url + '/login');

  element(by.model('user.username')).sendKeys('admin');
  element(by.model('user.password')).sendKeys('letmein1');
  element(by.css('[type="submit"]')).click();
  expect(browser.getCurrentUrl()).toEqual(url + '/reset_admin_password');

  element(by.model('user.password')).sendKeys(password);
  element(by.model('user.passwordConfirmation')).sendKeys(password);
  element(by.css('[type="submit"]')).click();
  expect(browser.getCurrentUrl()).toEqual(url + '/reports');
};

exports.logOut = function() {
  // Note: it would be nice if there were a more reliable way to get the logout
  // button.
  element(by.cssContainingText('li a', 'Log out')).click();
  expect(browser.getCurrentUrl()).toEqual(url + '/login');
};

exports.logIn = function(username, password) {
  element(by.model('user.username')).sendKeys(username);
  element(by.model('user.password')).sendKeys(password);
  element(by.css('[type="submit"]')).click();
  expect(browser.getCurrentUrl()).toEqual(url + '/reports');
};
