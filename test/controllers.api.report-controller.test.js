require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var _ = require('underscore');
var reportController = require('../lib/api/v1/report-controller')();
var botMaster = require('../lib/fetching/bot-master');
var reportWriter = require('../lib/fetching/report-writer');
var Source = require('../models/source');

describe('Report controller', function() {
  // Create a source for streaming data
  before(function(done) {
    botMaster.addListeners('source', Source.schema);
    process.nextTick(function() {
      Source.create({type: 'dummy', keywords: 'Lorem ipsum'});
      process.nextTick(function() {
        botMaster.start();
        done();
      });
    });
  });

  before(function(done) {
    // Wait until all reports have been processed
    reportWriter.once('done', function() {
      done();
    });
    // Stream data for 100ms
    setTimeout(function() {
      botMaster.stop();
    }, 100);
  });

  describe('GET /api/v1/report', function() {
    it('should get a list of all reports', function(done) {
      request(reportController)
        .get('/api/v1/report')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an.instanceof(Array);
          done();
        });
    });

    it('should query for reports', function(done) {
      request(reportController)
        .get('/api/v1/report?keywords=lorem')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an.instanceof(Array);
          expect(res.body[0]).to.have.property('content');
          expect(res.body[0].content.toLowerCase()).to.contain('lorem');
          done();
        });
    });
  });

  describe('DELETE /api/v1/report/_all', function() {
    it('should delete all reports', function(done) {
      request(reportController)
        .del('/api/v1/report/_all')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          request(reportController)
            .get('/api/v1/report')
            .expect(200, [], done);
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
