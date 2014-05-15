require('./init');
var expect = require('chai').expect;
var server = require('../lib/api/socket-handler')();
var streamer = require('../lib/api/streamer');
var io = require('../node_modules/socket.io/node_modules/socket.io-client');
var Report = require('../models/report');
var fetchingController = require('../lib/api/v1/fetching-controller');
var request = require('supertest');

var client;

describe('Socket handler', function() {
  before(function(done) {
    streamer.addListeners('report', Report.schema);
    server.listen(3000);
    client = io.connect('http://localhost:3000', {
      transports: ['websocket'],
      'force new connection': true
    });
    client.on('connect', done);
  });

  it('should establish connections with a query', function(done) {
    client.emit('query', {keywords: 'test'});
    setTimeout(function() {
      expect(streamer.queries).to.be.an.instanceof(Array);
      expect(streamer.queries).to.not.be.empty;
      expect(streamer.queries[0]).to.have.property('keywords');
      expect(streamer.queries[0].keywords).to.equal('test');
      done();
    }, 100);
  });

  it('should receive new reports that match the query', function(done) {
    client.once('reports', function(reports) {
      expect(reports).to.contain.property('total');
      expect(reports.total).to.equal(3);
      expect(reports).to.contain.property('results');
      expect(reports.results).to.be.an.instanceof(Array);
      expect(reports.results).to.have.length(3);
      expect(reports.results[0].content.toLowerCase()).to.contain('test');
      expect(reports.results[1].content.toLowerCase()).to.contain('test');
      expect(reports.results[2].content.toLowerCase()).to.contain('test');
      done();
    });
    Report.create({content: 'This is a test'});
    Report.create({content: 'This is another TEST'});
    Report.create({content: 'Testing this'});
    Report.create({content: 'one two three'});
  });

  it('should receive updates from the global fetching status', function(done) {
    client.once('fetchingStatusUpdate', function(status) {
      expect(status).to.have.property('fetching');
      expect(status.fetching).to.be.true;
      done();
    });
    request(fetchingController)
      .put('/api/v1/fetching/on')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
      });
  });

  // Disconnect socket
  after(function(done) {
    if (client.socket.connected) {
      client.on('disconnect', function() {
        done();
      });
      client.disconnect();
    } else done();
  });

  // Close server connection
  after(function(done) {
    server.close(done);
  });
});
