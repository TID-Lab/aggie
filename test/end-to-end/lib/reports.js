'use strict';

var Report = require('../../../models/report');
var _ = require('lodash');

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
  var e = this.expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + 'reports');
  if (filter.keywords) {
    element(by.model('searchParams.keywords')).sendKeys(filter.keywords);
  }
  if (filter.author) {
    element(by.model('searchParams.author')).sendKeys(filter.author);
  }
  if (filter.tags) {
    var text = filter.tags.join(', ');
    element(by.model('searchParams.tags')).sendKeys(text);
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

module.exports.filterReportsByTag = function(tags) {
  browser.get(browser.baseUrl + 'reports');
  this.setFilter({ tags: tags });
  return this.getReports();
};
// Returns an array for the first page of reports. If `pluckColumn` is set,
// the elements of the array are just the text from that column. Otherwise, they
// are the WebDriver elements for each row.
module.exports.getReports = function(pluckColumn) {
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
