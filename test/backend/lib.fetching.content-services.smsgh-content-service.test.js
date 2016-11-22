'use strict';

var utils = require('./init');
var request = require('supertest');
var expect = require('chai').expect;
var async = require('async');
var SMSGhContentService = require('../../lib/fetching/content-services/smsgh-content-service');

// This can be modified as more fields are added
// Req corresponding to source 1
var reqParams = {
  from: '9845098450',
  fulltext: 'lorem ipsum dolor',
  date: '2016-09-01',
  keyword: 'dummy'
};

// Req corresponding to source 2
var reqParams2 = {
  from: '1234567890',
  fulltext: 'lorem ipsum dolor',
  date: '2016-09-01',
  keyword: 'dodo'
};

// Req corresponding to source 3
var reqParams3 = {
  from: '9876543210',
  fulltext: 'lorem ipsum dolor',
  date: '2016-09-01',
  keyword: 'bozo'
};

describe('SMSGhana content service', function() {
  describe('Testing start and receive message', function() {

    var service, dummyEventName;

    beforeEach(function() {
      service = SMSGhContentService;
      dummyEventName = service.subscribe('DuMmY');
    });

    afterEach(function() {
      service.unsubscribe('DuMmY');
    });

    it('should start the server and send 200 code', function(done) {
      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams)
        .expect(200)
        .end(function(err, res) {
          return done(err);
        });
    });

    it('should be able to add new source correctly', function(done) {
      service.subscribe('dodo');
      service.subscribe('bozo');

      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams2)
        .expect(200)
        .end(function(err, res) {
          return done(err);
        });

      service.unsubscribe('dodo');
      service.unsubscribe('bozo');
    });

    it('should generate reports for each new source correctly', function(done) {
      var dodoEventName = service.subscribe('dodo');
      var bozoEventName = service.subscribe('bozo');
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
      ], done);

      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });

      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams2)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });

      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams3)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });
      service.unsubscribe('dodo');
      service.unsubscribe('bozo');
    });

    it('should remove one source but still listen to other sources', function(done) {
      service.subscribe('dodo');
      var bozoEventName = service.subscribe('bozo');

      service.unsubscribe('bozo');

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
          service.once(bozoEventName, function(reportData) {
            expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
            expect(reportData.content).to.equal('lorem ipsum dolor');
            expect(reportData.author).to.equal('9876543210');
            callback();
          });
        }
      ], done);

      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });

      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams3)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });

      service.unsubscribe('dodo');
    });

    it('should be case-insensitive', function(done) {
      async.parallel([
        function(callback) {
          service.once(dummyEventName, function(reportData) {
            expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
            expect(reportData.content).to.equal('lorem ipsum dolor');
            expect(reportData.author).to.equal('9845098450');
            expect(reportData.keyword).to.equal('dummy');
            callback();
          });
        },
        function(callback) {
          service.once(dummyEventName, function(reportData) {
            expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
            expect(reportData.content).to.equal('lorem ipsum dolor');
            expect(reportData.author).to.equal('9845098450');
            expect(reportData.keyword).to.equal('dummy');
            callback();
          });
        }
      ], done);

      reqParams.keyword = 'Dummy';
      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });

      reqParams.keyword = 'DUMMY';
      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });

    });

  });

  describe('testing stop', function() {
    var service;

    before(function() {
      service = SMSGhContentService;
      service.subscribe('dummy');
    });

    it('should stop listening on server after all unsubscribe', function(done) {
      service.subscribe('dodo');
      service.subscribe('bozo');

      service.unsubscribe('dummy');
      service.unsubscribe('dodo');
      service.unsubscribe('bozo');

      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams)
        .end(function(err, res) {
          if (err) {
            utils.expectToNotEmitReport(service, done);
            return done();
          }
          done(new Error('Expected server to be off'));
        });
    });
  });
});
