'use strict';

var utils = require('./init');
var request = require('supertest');
var expect = require('chai').expect;
var async = require('async');
var SMSGhContentService = require('../lib/fetching/content-services/smsgh-content-service');

// This can be modified as more fields are added
// Req corresponding to source 1
var req_params = {
  'from': '9845098450',
  'fulltext': 'lorem ipsum dolor',
  'date': '2016-09-01',
  'keyword': 'dummy'
};

// Req corresponding to source 2
var req_params_2 = {
  'from': '1234567890',
  'fulltext': 'lorem ipsum dolor',
  'date': '2016-09-01',
  'keyword': 'dodo'
};

// Req corresponding to source 3
var req_params_3 = {
  'from': '9876543210',
  'fulltext': 'lorem ipsum dolor',
  'date': '2016-09-01',
  'keyword': 'bozo'
};

describe('SMSGhana content service', function() {
  describe('Testing start and receive message', function() {

    var service, dummyEventName, dodoEventName, bozoEventName;

    beforeEach(function() {
      service = new SMSGhContentService();
      dummyEventName = service.subscribe('dummy');
    });

    afterEach(function() {
      service.unsubscribe();
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
    
    it('should be able to add new source correctly', function(done) {
      dodoEventName = service.subscribe('dodo');
      bozoEventName = service.subscribe('bozo');

      request('http://localhost:1111')
        .get('/smsghana')
        .query(req_params_2)
        .expect(200)
        .end(function (err,res) {
          if (err) {
            return done(err);
          }
          return done();
        });

      service.unsubscribe();
      service.unsubscribe();
    });

    it('should generate reports for each new source correctly', function(done) {
      dodoEventName = service.subscribe('dodo');
      bozoEventName = service.subscribe('bozo');
      var service_counter = 0;
      
      async.parallel([
        function(callback) {
          service.once(dummyEventName, function(reportData) {
            expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
            expect(reportData.content).to.equal('lorem ipsum dolor');
            expect(reportData.author).to.equal('9845098450');

            callback();
          });
        },
        function(callback) {
          service.once(dodoEventName, function(reportData) {
            expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
            expect(reportData.content).to.equal('lorem ipsum dolor');
            expect(reportData.author).to.equal('1234567890');
            callback();
          });
        },
        function(callback) {
          service.once(bozoEventName, function(reportData) {
            expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
            expect(reportData.content).to.equal('lorem ipsum dolor');
            expect(reportData.author).to.equal('9876543210');
            callback();
          });
        }
      ], function(error, results) {
      
        if (error) {
          done(error);
        }
        done();
      });
    
    
    /*
      service.once(dummyEventName, function(reportData) {
      
        expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
        expect(reportData.content).to.equal('lorem ipsum dolor');
        expect(reportData.author).to.equal('9845098450');
      
        service_counter += 1;
        if (service_counter === 3) {
          done();
        }
      });

      service.once(dodoEventName, function(reportData) {
      
        expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
        expect(reportData.content).to.equal('lorem ipsum dolor');
        expect(reportData.author).to.equal('1234567890');
        service_counter += 1;
        if (service_counter === 3) {
          done();
        }
      });
      service.once(bozoEventName, function(reportData) {
      
        expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
        expect(reportData.content).to.equal('lorem ipsum dolor');
        expect(reportData.author).to.equal('9876543210');
        service_counter += 1;
        if (service_counter === 3) {
          done();
        }

      });
    */
    
      request('http://localhost:1111')
        .get('/smsghana')
        .query(req_params)
        .expect(200)
        .end(function (err,res) {
          if (err) {
            return done(err);
          }
        });
    

      request('http://localhost:1111')
        .get('/smsghana')
        .query(req_params_2)
        .expect(200)
        .end(function (err,res) {
          if (err) {
            return done(err);
          }
        });

      request('http://localhost:1111')
        .get('/smsghana')
        .query(req_params_3)
        .expect(200)
        .end(function (err,res) {
          if (err) {
            return done(err);
          }
        });
        service.unsubscribe();
        service.unsubscribe();
    });

    it('should remove one source but still listen to other sources', function(done) {
      dodoEventName = service.subscribe('dodo');
      bozoEventName = service.subscribe('bozo');

      service.unsubscribe();


      async.parallel([
        function (callback) {
          service.once(dummyEventName, function(reportData) {
            expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
            expect(reportData.content).to.equal('lorem ipsum dolor');
            expect(reportData.author).to.equal('9845098450');

          callback();
        });
        },
        function(callback) {
          service.once(bozoEventName, function(reportData) {
            expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
            expect(reportData.content).to.equal('lorem ipsum dolor');
            expect(reportData.author).to.equal('9876543210');
          callback();
        });
        }
      ], function(error, results) {
      
        if (error) {
          done(error);
        }
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

      request('http://localhost:1111')
        .get('/smsghana')
        .query(req_params_3)
        .expect(200)
        .end(function (err,res) {
          if (err) {
            return done(err);
          }
        });

      service.unsubscribe();
    });


  });

  describe('testing stop', function() {

    var service, dummyEventName, dodoEventName, bozoEventName;

    before(function() {
      service = new SMSGhContentService();
      dummyEventName = service.subscribe('dummy');
    });

    it('should stop listening on server after all unsubscribe', function(done) {
      dodoEventName = service.subscribe('dodo');
      bozoEventName = service.subscribe('bozo');

      service.unsubscribe();
      service.unsubscribe();
      service.unsubscribe();

      request('http://localhost:1111')
        .get('/smsghana')
        .query(req_params)
        .end(function (err,res) {
          if (err) {
            utils.expectToNotEmitReport(service, done);
            return done();
          }
          done(err);
        });
    });
  });
});
