require('./init');
var expect = require('chai').expect;
var SubscribeBot = require('../lib/fetching/bots/subscribe-bot');
var Bot = require('../lib/fetching/bot');
var contentServiceFactory = require('../lib/fetching/content-service-factory');
var Source = require('../models/source');
var request = require('supertest');

describe('Subscribe bot', function() {
  before(function(done) {
    var source = new Source({nickname: 't', media: 'smsgh', keywords: 'bozo'});
    var contentService = contentServiceFactory.create(source);
    subscribeBot = new SubscribeBot({source: source, contentService: contentService});
    // console.log(subscribeBot);
    done();
  });

  it('should instantiate a subscribe-type content service', function() {
    expect(subscribeBot.type).to.equal('subscribe');
    expect(subscribeBot).to.be.instanceOf(Bot);
  });

/*
  it('should tell content service to start streaming reports', function(done) {
    subscribeBot.start();
    console.log("started");
    subscribeBot.once('test:bozo', function(report_data) {
      console.log("Listening to the right thing");
      // expect(report_data).to.have.property('content');
      // expect(report_data.content).to.contain('t');
      // Stop stream to ensure a single fetch

      console.log("Reached here blah blah");
      subscribeBot.stop();
      done();
    });

    var req_params = {
      'from': '9876543210',
      'fulltext': 'lorem ipsum dolor',
      'date': '2016-09-01',
      'keyword': 'bozo'
    };

    request('http://localhost:1111')
        .get('/dummy')
        .query(req_params)
        .expect(200)
        .end(function (err,res) {
          if (err) {
            return done(err);
          }
        });
  });
*/
});
