'use strict';

var utils = require('./init');
var request = require('supertest');
var expect = require('chai').expect;
var async = require('async');
var WhatsappContentService = require('../../lib/fetching/content-services/whatsapp-content-service');

// This can be modified as more fields are added
// Req corresponding to source 1
var reqParams = {
  from: '9845098450',
  text: 'lorem ipsum dolor',
  date: '2016-09-01',
  receiver: 'dummy'
};

// Req corresponding to source 2
var reqParams2 = {
  from: '1234567890',
  text: 'lorem ipsum dolor',
  date: '2016-09-01',
  receiver: 'dodo'
};

// Req corresponding to source 3
var reqParams3 = {
  from: '9876543210',
  text: 'lorem ipsum dolor',
  date: '2016-09-01',
  receiver: 'bozo'
};

var serialize = function(obj) {
  var str = [];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
};

describe('WhatsApp content service', function() {
  describe('Testing start and receive message', function() {

    var service, dummyEventName;

    beforeEach(function() {
      service = WhatsappContentService;
      dummyEventName = service.subscribe('foo123', { keywords: 'DuMmY' });
    });

    afterEach(function() {
      service.unsubscribe('foo123');
    });

    it('should start the server and send 200 code', function(done) {
      request('http://localhost:2222')
        .post('/whatsapp')
        .send(serialize(reqParams))
        .expect(200)
        .end(function(err, res) {
          return done(err);
        });
    });

    it('should be able to add new source correctly', function(done) {
      service.subscribe('id_dodo123', { keywords: 'dodo' });
      service.subscribe('id_bozo123', { keywords: 'bozo' });

      request('http://localhost:2222')
        .post('/whatsapp')
        .send(serialize(reqParams2))
        .expect(200)
        .end(function(err, res) {
          return done(err);
        });

      service.unsubscribe('id_dodo123');
      service.unsubscribe('id_bozo123');
    });

    it('should generate reports for each new source correctly', function(done) {
      var dodoEventName = service.subscribe('id_dodo123', { keywords: 'dodo' });
      var bozoEventName = service.subscribe('id_bozo123', { keywords: 'bozo' });
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

      request('http://localhost:2222')
        .post('/whatsapp')
        .send(serialize(reqParams))
        .expect(200)
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });

      request('http://localhost:2222')
        .post('/whatsapp')
        .send(serialize(reqParams2))
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });

      request('http://localhost:2222')
        .post('/whatsapp')
        .send(serialize(reqParams3))
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });
      service.unsubscribe('id_dodo123');
      service.unsubscribe('id_bozo123');
    });

    it('should remove one source but still listen to other sources', function(done) {
      service.subscribe('id_dodo123', { keywords: 'dodo' });
      var bozoEventName = service.subscribe('id_bozo123', { keywords: 'bozo' });

      service.unsubscribe('id_bozo123');

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

      request('http://localhost:2222')
        .post('/whatsapp')
        .send(serialize(reqParams))
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });

      request('http://localhost:2222')
        .post('/whatsapp')
        .send(serialize(reqParams3))
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });

      service.unsubscribe('id_dodo123');
    });

    it('should be case-insensitive', function(done) {
      var expectReport = function(callback, reportData) {
        expect(reportData.authoredAt).to.eql(new Date('2016-09-01'));
        expect(reportData.content).to.equal('lorem ipsum dolor');
        expect(reportData.author).to.equal('9845098450');
        expect(reportData.keyword).to.equal('dummy');
        callback();
      };
      async.parallel([
        function(callback) {
          service.once(dummyEventName, expectReport.bind({}, callback));
        },
        function(callback) {
          service.once(dummyEventName, expectReport.bind({}, callback));
        }
      ], done);

      reqParams.receiver = 'Dummy';
      request('http://localhost:2222')
        .post('/whatsapp')
        .send(serialize(reqParams))
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
        });

      reqParams.receiver = 'DUMMY';
      request('http://localhost:2222')
        .post('/whatsapp')
        .send(serialize(reqParams))
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
      service = WhatsappContentService;
      service.subscribe('id_dummy123', { keywords: 'dummy' });
    });

    it('should stop listening on server after all unsubscribe', function(done) {
      service.subscribe('id_dodo123', { keywords: 'dodo' });
      service.subscribe('id_bozo123', { keywords: 'bozo' });

      service.unsubscribe('id_dummy123');
      service.unsubscribe('id_dodo123');
      service.unsubscribe('id_bozo123');

      request('http://localhost:2222')
        .get('/whatsapp')
        .send(serialize(reqParams))
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
