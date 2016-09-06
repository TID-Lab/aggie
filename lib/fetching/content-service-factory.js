// Builds content service instance based on source media.

'use strict';

var _ = require('underscore');
var elmoCS = require('./content-services/elmo-content-service');
var facebookCS = require('./content-services/facebook-content-service');
var rssCS = require('./content-services/rss-content-service');
var twitterCS = require('./content-services/twitter-content-service');

var contentServices = {
  elmo: elmoCS,
  facebook: facebookCS,
  rss: rssCS,
  twitter: twitterCS
};

var ContentServiceFactory = function() {};

// Creates a new content service to match the given source.
ContentServiceFactory.prototype.create = function(source) {
  var Service = contentServices[source.media];

  // Content services use only the lastReportDate, url, and keywords params.
  var basicSource = _.pick(source, 'lastReportDate', 'url', 'keywords');

  if (Service.fetchType === 'subscribe') {
    // There should only be one content service for this media
    return Service;
  }

  return new Service(basicSource);
};

// Export a new instance, ensuring a singleton
module.exports = new ContentServiceFactory();
