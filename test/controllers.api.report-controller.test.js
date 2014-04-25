require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var _ = require('underscore');
var reportController = require('../controllers/api/report-controller')();
var botMaster = require('../controllers/fetching/bot-master');
var reportWriter = require('../controllers/fetching/report-writer');
var Source = require('../models/source');

describe('Report controller', function() {
  // Create a source for streaming data
  before(function(done) {
    botMaster.addListeners('source', Source.schema);
    // Wait until all reports have been processed
    reportWriter.once('done', done);
    process.nextTick(function() {
      Source.create({type: 'dummy', keywords: 'e'});
      process.nextTick(function() {
        botMaster.start();
        // Stream data for 500ms
        setTimeout(function() {
          botMaster.stop();
        }, 500);
      });
    });
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

    it('should query for reports', function(done) {
      request(reportController)
        .get('/api/report?keywords=lorem')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an.instanceof(Array);
          expect(res.body[0]).to.have.property('content');
          expect(res.body[0].content.toLowerCase()).to.contain('lorem');
          done();
        });
    });

    it('should query and filter reports', function(done) {
      request(reportController)
        .get('/api/report?keywords=one&status=unassigned&before=' + Date.now())
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an.instanceof(Array);
          expect(res.body).to.not.be.empty;
          expect(res.body[0]).to.have.property('content');
          expect(res.body[0].content.toLowerCase()).to.contain('one');
          done();
        });
    });

    it('should query and filter reports with no results', function(done) {
      request(reportController)
        .get('/api/report?keywords=one&status=assigned&after=' + Date.now())
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an.instanceof(Array);
          expect(res.body).to.be.empty;
          done();
        });
    });

    it('should query and filter by date range', function(done) {
      request(reportController)
        .get('/api/report?keywords=one&after=' + (Date.now() - 864e5) + '&before=' + Date.now())
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an.instanceof(Array);
          expect(res.body).to.not.be.empty;
          expect(res.body[0]).to.have.property('content');
          expect(res.body[0].content.toLowerCase()).to.contain('one');
          done();
        });
    });
  });

  describe('DELETE /api/report/_all', function() {
    it('should delete all reports', function(done) {
      request(reportController)
        .del('/api/report/_all')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          request(reportController)
            .get('/api/report')
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
