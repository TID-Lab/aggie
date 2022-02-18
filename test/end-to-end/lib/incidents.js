'use strict';

module.exports.setGroupFilter = function(filter) {
  browser.get(browser.baseUrl + 'groups');
  if (filter.tags) {
    var text = filter.tags.join(', ');
    element(by.model('searchParams.tags')).sendKeys(text);
  }
  element.all(by.buttonText('Go')).first().click();
};

function sendToGroupModal(params) {
  element(by.model('group.title')).sendKeys(params.title ? params.title : 'blank');
  element(by.model('group.tags')).sendKeys(params.tags ? params.tags : '');
  element(by.model('group.locationName')).sendKeys(params.location ? params.location : '');
}

function clearGroupModal(params) {
  if (params.title) element(by.model('group.title')).clear();
  if (params.tags) element(by.model('group.tags')).clear();
  if (params.location) element(by.model('group.locationName')).clear();
}

module.exports.createGroup = function(params) {
  browser.get(browser.baseUrl + 'groups');
  element(by.buttonText('Create Group')).click();
  sendToGroupModal(params);
  return element(by.buttonText('Submit')).click();
};

module.exports.addFirstReportToGroup = function(groupParams) {
  browser.get(browser.baseUrl + 'reports');
  element.all(by.css('.addIdentifier')).first().click();
  return element(by.cssContainingText('tr td', groupParams.location)).click();
};

module.exports.getGroupTitles = function() {
  var x = by.repeater("i in groups | orderBy:['closed','idnum']");
  return element.all(x.column('title'))
          .map(function(elem) {
            return elem.getText();
          })
          .then(function(titles) {
            return titles.filter(function(text) {
              return text !== '';
            });
          });
};

module.exports.filterGroupsByTag = function(tags) {
  this.setGroupFilter({ tags: tags });
  return this.getGroupTitles();
};

module.exports.editGroup = function(name, params) {
  browser.get(browser.baseUrl + 'groups');
  element(by.cssContainingText('strong', name)).click();
  element(by.buttonText('Edit')).click();
  clearGroupModal(params);
  sendToGroupModal(params);
  return element(by.buttonText('Submit')).click();
};
