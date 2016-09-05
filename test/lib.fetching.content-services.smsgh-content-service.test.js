'use strict';

require('./init');
var request = require('request');
var expect = require('chai').expect;
// var EventEmitter = require('events').EventEmitter;
var SMSGhContentService = require('../lib/fetching/content-services/smsgh-content-service');

describe('SMSGhana content service', function() {
  describe('Testing start, send, and process', function() {

    var service;

    beforeEach(function() {
      service = new SMSGhContentService();
      service.start();
    });

    afterEach(function() {
      service.stop();
    });

    it('should start the server properly', function(done) {

      request({
        url: 'http://localhost:1111/smsghana',
        qs: { From: '9845098450', Fulltext: 'lorem ipsum dolor', Date: '2016-09-01' },
        method: 'GET'
        }, function(error, response) {
          if (response.statusCode === 200) {
            done();
          }
          done(error);
        });

    });

    it('should receive messages via HTTP request properly', function(done) {

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

    it('should handle messages received via HTTP requests properly', function(done) {
      // Setup handler.
      service.once('report', function(reportData) {

        // Ensure proper fields are returned from emitted raw data below.
        expect(reportData.AuthoredAt).to.equal('2016-09-01');
        expect(reportData.Fulltext).to.equal('lorem ipsum dolor');
        expect(reportData.From).to.equal('9845098450');

        done();
      });

      request({
        url: 'http://localhost:1111/smsghana',
        qs: { From: '9845098450', Fulltext: 'lorem ipsum dolor', Date: '2016-09-01' },
        method: 'GET'
        }, function(error, response) {
          if (error || response.statusCode !== 200) {
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
