var utils = require('./init');
var expect = require('chai').expect;
var SocketHandler = require('../../lib/api/socket-handler');
var streamer = require('../../lib/api/streamer');
var io = require('socket.io-client');
var Source = require('../../models/source');
var Report = require('../../models/report');
var Incident = require('../../models/incident');
var settingsController = require('../../lib/api/v1/settings-controller');
var request = require('supertest');
var authentication = require('../../lib/api/authentication');
var express = require('express');
var https = require('https');
var path = require('path');
var fs = require('fs');

function createServer(app) {
  // Get full path for certificate files
  var keyFile = path.resolve(__dirname, '../../config/key.pem');
  var certFile = path.resolve(__dirname, '../../config/cert.pem');
  return https.createServer({
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile)
  }, app);
}

var app = express();
var socketHandler = new SocketHandler(app, createServer(app), authentication(app));
var client;

describe('Socket handler', function() {
  before(function(done) {
    streamer.addListeners('report', Report.schema);
    streamer.addListeners('incident', Incident.schema);
    socketHandler.addListeners('source', Source.schema);
    socketHandler.server.listen(3000);

    https.globalAgent.options.rejectUnauthorized = false;
    client = io.connect('https://localhost:3000', {
      transports: ['websocket'],
      'force new connection': true,
      agent: https.globalAgent
    });
    done();
  });

  it('should establish a socket connection', function(done) {
    client.on('sourceErrorCountUpdated', function(data) {
      expect(data).to.have.property('unreadErrorCount');
      expect(data.unreadErrorCount).to.equal(0);
      done();
    });
    client.on('connect');
  });

  it('should establish connections with a query', function(done) {
    client.emit('query', { keywords: 'test' });
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
      expect(reports).to.be.an.instanceof(Array);
      expect(reports).to.have.length(3);
      expect(reports[0].content.toLowerCase()).to.contain('test');
      expect(reports[1].content.toLowerCase()).to.contain('test');
      expect(reports[2].content.toLowerCase()).to.contain('test');
      done();
    });
    Report.create({ content: 'This is a test' });
    Report.create({ content: 'This is another TEST' });
    Report.create({ content: 'Testing this' });
    Report.create({ content: 'one two three' });
  });

  it('should establish connections with an incident query', function(done) {
    client.emit('incidentQuery', { title: 'quick brown' });
    setTimeout(function() {
      expect(streamer.queries).to.be.an.instanceof(Array);
      expect(streamer.queries).to.not.be.empty;
      expect(streamer.queries[1]).to.have.property('title');
      expect(streamer.queries[1].title).to.equal('quick brown');
      done();
    }, 100);
  });

  it('should receive new incidents that match the query', function(done) {
    client.once('incidents', function(incidents) {
      expect(incidents).to.be.an.instanceof(Array);
      expect(incidents).to.have.length(1);
      expect(incidents[0]).to.have.property('title');
      expect(incidents[0].title).to.equal('The quick brown fox');
      done();
    });
    Incident.create({ title: 'The slow white fox' });
    Incident.create({ title: 'The quick brown fox' });
  });

  it('should stream a list of sources when a source changes', function(done) {
    client.once('sources', function(sources) {
      expect(sources).to.be.an.instanceof(Array);
      expect(sources).to.have.length(1);
      expect(sources[0]).to.contain.keys(['_id', 'nickname', 'unreadErrorCount', 'enabled', '__v']);
      done();
    });
    Source.create({ nickname: 'test', type: 'dummy' });
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
    socketHandler.server.close(done);
  });

  // Clean up the database
  after(utils.wipeModels([Report, Incident, Source]));
  after(utils.expectModelsEmpty);
});
