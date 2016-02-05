var Twit = require('twit');
var logger = require('../../logger');

var testContentService = function(service, settings, callback) {
  if (service === 'twitter') {
    var t = new Twit(settings);
    t.get('account/verify_credentials', { skip_status: true }, callback);
  }
};

module.exports = { testContentService: testContentService };
