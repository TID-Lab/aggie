'use strict';

var dbTools = require('../database-tools');
var _ = require('lodash');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var Report = require('../../models/report');

chai.use(chaiAsPromised);
var expect = chai.expect;
var promise = protractor.promise;

module.exports = _.clone(dbTools);

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
  var e3 = expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + 'reports');

  return promise.all([e1, e2, e3]);
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

module.exports.makeReports = function(n, author, time, content) {
  return function(done) {
    Report.create(_.map(_.range(n), function(i) {
      return {
        author: author,
        storedAt: time ? new Date(time) : new Date(),
        content: content ? i + ' ' + content : i
      };
    }), done);
  };
};

function clickClearSend(clickBy, keys) {
  element(clickBy).click();
  element(clickBy).clear();
  element(clickBy).sendKeys(keys);
}

module.exports.setFilter = function(filter) {
  var e = expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + 'reports');
  if (filter.keywords) {
    element(by.model('searchParams.keywords')).sendKeys(filter.keywords);
  }
  if (filter.author) {
    element(by.model('searchParams.author')).sendKeys(filter.author);
  }
  if (filter.time) {
    // This will only work once: if you want to then change the filter the
    // button will have different text and you'll have to select it some other
    // way.
    element(by.buttonText('Date/Time')).click();
    // Also, it's important to do the 'before' time which is on the right of
    // the modal, before the 'after' time, so that when we click Submit there
    // isn't a dropdown covering the button.
    clickClearSend(by.model('times.before'), filter.time.before);
    clickClearSend(by.model('times.after'), filter.time.after);
    element(by.buttonText('Submit')).click();
  }
  element.all(by.buttonText('Go')).first().click();
  return e;
};

module.exports.addSource = function(sourceName, params) {
  var sourceList = {
    Twitter: 0,
    Facebook: 1,
    RSS: 2,
    Elmo: 3,
    'SMS GH': 4
  };
  browser.get(browser.baseUrl + 'sources');
  element(by.buttonText('Create Source')).click();
  element.all(by.model('source.media')).first().$('[value="' + sourceList[sourceName] + '"]').click();
  if (sourceName !== 'Twitter') {
    element(by.model('source.nickname')).sendKeys(params.nickname ? params.nickname : 'blank');
  }
  if (sourceName === 'SMS GH' || sourceName === 'Twitter') {
    element(by.model('source.keywords')).sendKeys(params.keywords);
  } else {
    element(by.model('source.url')).sendKeys(params.url);
  }
  return element(by.buttonText('Submit')).click();
};

module.exports.toggleFetching = function(state) {
  var stateMapping = {
    On: true,
    Off: false
  };
  browser.get(browser.baseUrl + 'settings');
  return element(by.css('[ng-click="toggle(' + stateMapping[state] + ')"]')).click();
};

var sourceIconMapping = {
  Twitter: 'twitter-source',
  Facebook: 'facebook-source',
  RSS: 'rss-source',
  Elmo: 'elmo-source',
  'SMS GH': 'smsgh-source'
};
module.exports.sourceIconMapping = sourceIconMapping;

module.exports.toggleSource = function(sourceName, state) {
  browser.get(browser.baseUrl + 'sources');
  return element(by.css('[class="compact source ' + sourceIconMapping[sourceName] + '"]'))
    .element(by.xpath('..'))
    .element(by.xpath('.//*[.="' + state + '"]')).click();
};

// Returns an array for the first page of reports. If `pluckColumn` is set,
// the elements of the array are just the text from that column. Otherwise, they
// are the WebDriver elements for each row.
module.exports.getReports = function(pluckColumn) {
  browser.get(browser.baseUrl + 'reports');
  var x = by.repeater("r in visibleReports.toArray() | orderBy:'-storedAt'");
  if (!pluckColumn) {
    return element.all(x);
  }
  return element.all(x.column(pluckColumn)).map(function(elem) {
    return elem.getText();
  });
};

// Get the text from first span of the yellow stats bar
module.exports.countAllReports = function() {
  return element.all(by.css('.navbar-text > span')).first()
           .getText()
           .then(function(text) {
             return Number(text);
           });
};

module.exports.deleteSource = function(sourceName, nickname) {
  browser.get(browser.baseUrl + 'sources');
  element(by.linkText(nickname)).click();
  element(by.buttonText('Delete')).click();
  return element(by.buttonText('Confirm')).click();
};

module.exports.getWarningCount = function(sourceName) {
  browser.get(browser.baseUrl + 'sources');
  return element(by.css('[class="compact source ' + sourceIconMapping[sourceName] + '"]'))
           .element(by.xpath('..'))
           .element(by.css('[ng-class="{ \'multiple-errors\': s.unreadErrorCount > 0 }"]'))
           .getText()
           .then(function(text) {
             return Number(text);
           });
};

module.exports.checkSourceState = function(sourceName) {
  browser.get(browser.baseUrl + 'sources');
  return element(by.css('[class="compact source ' + sourceIconMapping[sourceName] + '"]'))
           .element(by.xpath('..'))
           .element(by.css('[class="toggle-item ng-scope ng-binding selected"]'))
           .getText();
};

module.exports.setIncidentFilter = function(filter) {
  browser.get(browser.baseUrl + 'incidents');
  if (filter.tags) {
    var text = filter.tags.join(', ');
    element(by.model('searchParams.tags')).sendKeys(text);
  }
  element.all(by.buttonText('Go')).first().click();
};
