var request = require('supertest');
var expect = require('chai').expect;
var _ = require('underscore');
var reportController = require(root_path + '/controllers/api/report-controller');
var botMaster = require(root_path + '/controllers/fetching/bot-master');
var Source = require(root_path + '/models/source');

describe('Report controller', function() {
  // Create a source for streaming data
  before(function(done) {
    Source.create({type: 'twitter', keywords: 'http'});
    process.nextTick(function() {
      botMaster.start();
      done();
    });
  });

  // Stream data for ~1.5 seconds
  before(function(done) {
    setTimeout(function() {
      botMaster.stop();
      done();
    }, 1500);
  });

  describe('GET /api/report', function() {
    it('should get a list of all reports', function(done) {
      request(reportController)
        .get('/api/report')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an.instanceof(Array);
          done();
        });
    });
  });

});

var compare = function(a, b) {
  for (var attr in a) {
    if (b[attr]) {
      expect(a[attr]).to.equal(b[attr]);
    }
  }
}
