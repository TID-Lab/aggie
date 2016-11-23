'use strict';

module.exports.setIncidentFilter = function(filter) {
  browser.get(browser.baseUrl + 'incidents');
  if (filter.tags) {
    var text = filter.tags.join(', ');
    element(by.model('searchParams.tags')).sendKeys(text);
  }
  element.all(by.buttonText('Go')).first().click();
};

function sendToIncidentModal(params) {
  element(by.model('incident.title')).sendKeys(params.title ? params.title : 'blank');
  element(by.model('incident.tags')).sendKeys(params.tags ? params.tags : '');
  element(by.model('incident.locationName')).sendKeys(params.location ? params.location : '');
}

function clearIncidentModal(params) {
  if (params.title) element(by.model('incident.title')).clear();
  if (params.tags) element(by.model('incident.tags')).clear();
  if (params.location) element(by.model('incident.locationName')).clear();
}

module.exports.createIncident = function(params) {
  browser.get(browser.baseUrl + 'incidents');
  element(by.buttonText('Create Incident')).click();
  sendToIncidentModal(params);
  return element(by.buttonText('Submit')).click();
};

module.exports.addFirstReportToIncident = function(incidentParams) {
  browser.get(browser.baseUrl + 'reports');
  element.all(by.css('.addIdentifier')).first().click();
  return element(by.cssContainingText('tr td', incidentParams.location)).click();
};

module.exports.getIncidentTitles = function() {
  var x = by.repeater("i in incidents | orderBy:['closed','idnum']");
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

module.exports.filterIncidentsByTag = function(tags) {
  this.setIncidentFilter({ tags: tags });
  return this.getIncidentTitles();
};

module.exports.editIncident = function(name, params) {
  browser.get(browser.baseUrl + 'incidents');
  element(by.cssContainingText('strong', name)).click();
  element(by.buttonText('Edit')).click();
  clearIncidentModal(params);
  sendToIncidentModal(params);
  return element(by.buttonText('Submit')).click();
};
