'use strict';

require('./init');
var request = require('request');
var expect = require('chai').expect;
var SMSGhContentService = require('../lib/fetching/content-services/smsgh-content-service');

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

      request({
        url: 'http://localhost:1111/smsghana',
        qs: { From: '9845098450', Fulltext: 'lorem ipsum dolor', Date: '2016-09-01' },
        method: 'GET'
        }, function(error, response) {
        if (error) {
          return done(error);
        }
        expect(response.statusCode).to.equal(200);
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

      request({
        url: 'http://localhost:1111/smsghana',
        qs: { From: '9845098450', Fulltext: 'lorem ipsum dolor', Date: '2016-09-01' },
        method: 'GET'
        }, function(error, response) {
          expect(response.statusCode).to.equal(200);
          if (error) {
            return done(error);
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

      request({
        url: 'http://localhost:1111/smsghana',
        qs: { From: '9845098450', Fulltext: 'lorem ipsum dolor', Date: '2016-09-01' },
        method: 'GET'
        }, function(error) {
        if (error) {
          expectToNotEmitReport(service, done);
          return done();
        }
        done(error);
        });
    });
  });
});
