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

      request('http://localhost:1111', function(error, response, body) {
          done(error);
      });

    });

    it('should receive messages via HTTP request properly', function(done) {

      request({
        url: 'http://localhost:1111',
        qs: {phone_num: '9845098450', message: 'lorem ipsum dolor'},
        method: 'GET'
        }, function (error, response, body) {
        if (error) {
          console.log(error);
        }
        else if (response.statusCode != '200'){
          console.log(response.statusCode, body);//Change this, obviously.
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
        expect(reportData.authoredAt.getFullYear()).to.equal(2012);
        expect(reportData.fetchedAt.getFullYear()).to.equal((new Date()).getFullYear());
        expect(reportData.content).to.equal('foo bar baz');
        expect(reportData.author).to.equal('9845098450');

        done();
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
        qs: {phone_num: '9845098450', message: 'lorem ipsum dolor'},
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
