'use strict';

require('./init');
var request = require('supertest');
var expect = require('chai').expect;
var SMSGhContentService = require('../lib/fetching/content-services/smsgh-content-service');

// This can be modified as more fields are added
var req_params = {
  'from': '9845098450',
  'fulltext': 'lorem ipsum dolor',
  'date': '2016-09-01'
};

describe('SMSGhana content service', function() {
  describe('Testing start and receive message', function() {

    var service;

    beforeEach(function() {
      service = new SMSGhContentService();
      service.start();
    });

    afterEach(function() {
      service.stop();
    });


    it('should start the server and send 200 code', function(done) {

      request('http://localhost:1111')
        .get('/smsghana')
        .query(req_params)
        .expect(200)
        .end(function (err,res) {
          if (err) {
            return done(err);
          }
          return done();
        });
    });
    

    it('should generate reports correctly', function(done) {
      service.once('report', function(reportData) {

        expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
        expect(reportData.content).to.equal('lorem ipsum dolor');
        expect(reportData.author).to.equal('9845098450');
        done();
      });

      request('http://localhost:1111')
        .get('/smsghana')
        .query(req_params)
        .expect(200)
        .end(function (err,res) {
          if (err) {
            return done(err);
          }
        });
        
    });
  });

  describe('testing stop', function() {

    var service;

    before(function() {
      service = new SMSGhContentService();
      service.start();
    });

    it('should stop server properly', function(done) {

      service.stop();

      request('http://localhost:1111')
        .get('/smsghana')
        .query(req_params)
        .end(function (err,res) {
          if (err) {
            expectToNotEmitReport(service, done);
            return done();
          }
          done(err);
        });
    });
  });
});
