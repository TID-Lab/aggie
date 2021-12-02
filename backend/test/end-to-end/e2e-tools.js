'use strict';

var dbTools = require('../database-tools');
var incidentTools = require('./lib/incidents');
var sourceTools = require('./lib/sources');
var reportTools = require('./lib/reports');
var _ = require('lodash');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var request = require('supertest');

module.exports = _.assign(_.clone(dbTools),
                          incidentTools,
                          sourceTools,
                          reportTools);

var promise = protractor.promise;
// Allow chai to wait for promises on the right-hand-side
chaiAsPromised.transformAsserterArgs = function(args) {
  return promise.all(args);
};
chai.use(chaiAsPromised);
var expect = chai.expect;
module.exports.expect = expect;

module.exports.resetBrowser = function() {
  browser.manage().deleteAllCookies();
};

module.exports.init = function() {
  browser.get(browser.baseUrl);
};

module.exports.initAdmin = function(password) {
  module.exports.init();
  var e1 = expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + 'login');

  element(by.model('user.username')).sendKeys('admin');
  element(by.model('user.password')).sendKeys('letmein1');
  element(by.css('[type="submit"]')).click();
  var e2 = expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + 'reset_admin_password');

  element(by.model('user.password')).sendKeys(password);
  element(by.model('user.passwordConfirmation')).sendKeys(password);
  element(by.css('[type="submit"]')).click();
  var e3 = expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + 'login');

  element(by.model('user.username')).sendKeys('admin');
  element(by.model('user.password')).sendKeys(password);
  element(by.css('[type="submit"]')).click();
  var e4 = expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + 'reports');

  return promise.all([e1, e2, e3, e4]);
};

module.exports.logOut = function() {
  // Note: it would be nice if there were a more reliable way to get the logout
  // button.
  element.all(by.cssContainingText('li a', 'Log out')).first().click();
  return expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + 'login');
};

module.exports.logIn = function(username, password) {
  element(by.model('user.username')).sendKeys(username);
  element(by.model('user.password')).sendKeys(password);
  element(by.css('[type="submit"]')).click();
  return expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + 'reports');
};

module.exports.toggleFetching = function(state) {
  var stateMapping = {
    On: true,
    Off: false
  };
  browser.get(browser.baseUrl + 'settings');
  return element(by.css('[ng-click="toggle(' + stateMapping[state] + ')"]')).click();
};

module.exports.sendSmsghRequest = function(requestParams) {
  var defer = promise.defer();
  browser.call(function() {
    request('http://localhost:1111')
      .get('/smsghana')
      .query(requestParams)
      .end(function(err, res) {
        if (err) defer.fulfill(err);
        defer.fulfill(res);
      });
  });
  return defer.promise;
};
