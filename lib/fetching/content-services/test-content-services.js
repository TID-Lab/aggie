var Twit = require('twit');
var graph = require('fbgraph');
var logger = require('../../logger');

var testContentService = function(service, settings, callback) {
  switch (service) {
  case 'twitter':
    var t = new Twit(settings);
    t.get('account/verify_credentials', { skip_status: true }, callback);
    break;
  case 'facebook':
    graph.setAccessToken(settings.accessToken);
    var graphObject = graph.get('4', callback); // We ask for Mark's userId
    break;
  default:
    var err = { message: 'There is not test available for this setting' };
    callback(err, {}, {});
  }
};

module.exports = { testContentService: testContentService };
