// Builds content service instance based on source media.

'use strict';

var _ = require('underscore');
var elmoCS = require('./content-services/elmo-content-service');
var facebookCS = require('./content-services/facebook-content-service');
var rssCS = require('./content-services/rss-content-service');
var twitterCS = require('./content-services/twitter-content-service');
var dummyCS = require('./content-services/dummy-content-service');
var dummyPullCS = require('./content-services/dummy-pull-content-service');
// var dummySubscribeCS = require('./content-services/dummy-subscribe-content-service');
var smsghCS = require('./content-services/smsgh-content-service');

var contentServices = {
  elmo: elmoCS,
  facebook: facebookCS,
  rss: rssCS,
  twitter: twitterCS,
  dummy: dummyCS,
  'dummy-pull': dummyPullCS,
  // 'dummy-subscribe': dummySubscribeCS,
  smsgh: smsghCS,
};

var ContentServiceFactory = function() {};

// Creates a new content service to match the given source.
ContentServiceFactory.prototype.create = function(source) {
  var Service = contentServices[source.media];
  /*
  console.log("source");
  console.log(source);
  console.log("Service");
  console.log(Service);
  */
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
