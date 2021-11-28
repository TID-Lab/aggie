'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var TwitterContentService = require('../../lib/fetching/content-services/twitter-content-service');

describe('Twitter content service', function() {

  it('should handle incoming tweets properly', function(done) {
    var service = TwitterContentService;

    // Stub getStream method to return fake stream we control.
    var fakeStream = new EventEmitter();
    fakeStream.start = _.noop;
    fakeStream.stop = _.noop;
    service._getStream = function() { return fakeStream; };
    var eventName = service.subscribe('bot_id123', { keywords: 'baz foo' });

    // Setup handler.
    service.once(eventName, function(reportData) {

      // Ensure proper fields are returned from emitted raw data below.
      expect(reportData.authoredAt.getFullYear()).to.equal(2012);
      expect(reportData.fetchedAt.getFullYear()).to.equal((new Date()).getFullYear());
      expect(reportData.content).to.equal('foo bar baz');
      expect(reportData.author).to.equal('bozo');
      expect(reportData.url).to.equal('https://twitter.com/bozo/status/123');

      service.unsubscribe('bot_id123');
      done();
    });

    fakeStream.emit('tweet', {
      created_at: new Date(2012, 3, 4, 12, 0, 0),
      text: 'foo bar baz',
      user: { screen_name: 'bozo' },
      id_str: '123'
    });
  });

  after(utils.expectModelsEmpty);
});
