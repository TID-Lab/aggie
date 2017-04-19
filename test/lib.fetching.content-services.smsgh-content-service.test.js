require('./init');
var request = require('request');
var expect = require('chai').expect;
var EventEmitter = require('events').EventEmitter;
var SMSGhContentService = require('../lib/fetching/content-services/smsgh-content-service');

describe('SMSGhana content service', function() {
  describe('Testing start, send, and process', function(){


    beforeEach(function () {
      var service = new SMSGhContentService();
      service.start();
    });

    afterEach(function() {
      service.stop();
    });

    it('should start the server properly', function(done) {

      request({
        url: 'http://localhost:1111',
        qs: {From: '9845098450', Fulltext: 'lorem ipsum dolor', Date: '2016-09-01'},
        method: 'GET'
        }, function (error, response, body) {
          done(error);
      });

    });

    it('should receive messages via HTTP request properly', function(done) {

      request({
        url: 'http://localhost:1111',
        qs: {From: '9845098450', Fulltext: 'lorem ipsum dolor', Date: '2016-09-01'},
        method: 'GET'
        }, function (error, response, body) {
        if (error) {
          console.log(error);
        }
        else if (response.statusCode != '200'){
          console.log(response.statusCode, body);//Depends on how the content-service is coded.
        }
        else {
          //Pass the test
          done();
        }
      });
    });

    it('should handle messages received via HTTP requests properly', function(done) {
      // Setup handler.
      service.once('report', function(reportData) {

        // Ensure proper fields are returned from emitted raw data below.
        expect(reportData.Date).to.equal('2016-09-01');
        expect(reportData.Fulltext).to.equal('lorem ipsum dolor');
        expect(reportData.From).to.equal('9845098450');

        done();
      });

      request({
        url: 'http://localhost:1111',
        qs: {From: '9845098450', Fulltext: 'lorem ipsum dolor', Date: '2016-09-01'},
        method: 'GET'
        }, function (error, response, body) {
          if (error) {
            console.log(error);
          }
      });
    });
  });

  describe('testing stop', function() {

    before(function () {
      var service = new SMSGhContentService();
      service.start();
    });

    it('should stop server properly', function(done){

      service.stop();
      request({
        url: 'http://localhost:1111',
        qs: {From: '9845098450', Fulltext: 'lorem ipsum dolor', Date: '2016-09-01'},
        method: 'GET'
        }, function (error, response, body) {
        if (!error) {
          console.log(response, body);
        }
        else {
          //Pass the test
          done();
        }
      });
    });
  });
});
