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

    /*
    it('should fail', function(done) {
      expect(true).to.equal(false);

      done();
    });

    it('should fail', function(done) {
      var e = new (require('events').EventEmitter)();
      e.on('foo', function() {
        expect(true).to.equal(false);

        done(); 
      });
      e.emit('foo');
    });
    */

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
    /*
    it('should fail', function(done) {
      service.once('report', function() {
        expect(true).to.equal(false);
      });
      service.foo();
    });

    it('should fail supertest', function(done) {
      service.once('report', function() {
        expect(true).to.equal(false);
      });
      var request = require('supertest');
      request(service._app).get('/foo').end(function() {});
    });

    it('should fail', function(done) {
      service.once('report', function() {
        console.log('asdf2');
        done();
        expect(true).to.equal(false);
      });
      request({ url: 'http://localhost:1111/foo' });
    });
    */

    it('should handle messages received via HTTP requests properly', function(done) {
      // Setup handler.
      service.once('report', function(reportData) {
        // console.log(reportData);
        // console.log(typeof reportData.authoredAt);
        expect(true).to.equal(true);
        // console.log("passed true === true");
        //done();
        var test_date = new Date('2016-09-01');
        // console.log("authoredAt: "+test_date);
        // console.log(typeof test_date);
        // Ensure proper fields are returned from emitted raw data below.
        expect(reportData.authoredAt).to.eql(test_date);
        // console.log("passed date check");
        expect(reportData.content).to.equal('lorem ipsum dolor');
        // console.log("passed content check");
        expect(reportData.author).to.equal('9845098450');
        // console.log("passed author checks");
        done();
      });
//      service.emit('report');

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
