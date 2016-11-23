'use strict';

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
  element(by.model('source.nickname')).sendKeys(params.nickname ? params.nickname : 'blank');
  if (sourceName === 'SMS GH' || sourceName === 'Twitter') {
    element(by.model('source.keywords')).sendKeys(params.keywords);
  } else {
    element(by.model('source.url')).sendKeys(params.url);
  }
  if (params.tags) {
    element(by.model('source.tags')).sendKeys(params.tags);
  }
  return element(by.buttonText('Submit')).click();
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
