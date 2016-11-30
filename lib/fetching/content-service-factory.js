// Builds content service instance based on source media.

'use strict';

var _ = require('underscore');

var contentServices = {};
contentServices.elmo = require('./content-services/elmo-content-service');
contentServices.facebook = require('./content-services/facebook-content-service');
contentServices.rss = require('./content-services/rss-content-service');
contentServices.twitter = require('./content-services/twitter-content-service');
contentServices.dummy = require('./content-services/dummy-content-service');
contentServices['dummy-pull'] = require('./content-services/dummy-pull-content-service');
contentServices['dummy-fast'] = require('./content-services/dummy-fast-content-service');
contentServices.smsgh = require('./content-services/smsgh-content-service');
contentServices.whatsapp = require('./content-services/whatsapp-content-service');
contentServices.replay = require('./content-services/replay-content-service');

function ContentServiceFactory() { /* empty constructor */ }

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
