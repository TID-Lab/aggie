require('./init');
var expect = require('chai').expect;
var server = require('../controllers/api/socket-handler')();
var streamer = require('../controllers/api/streamer');
var io = require('../node_modules/socket.io/node_modules/socket.io-client');
var Report = require('../models/report');

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
      expect(reports).to.be.an.instanceof(Array);
      expect(reports).to.have.length(3);
      expect(reports[0].content.toLowerCase()).to.contain('test');
      expect(reports[1].content.toLowerCase()).to.contain('test');
      expect(reports[2].content.toLowerCase()).to.contain('test');
      done();
    });
    Report.create({content: 'This is a test'});
    Report.create({content: 'This is another TEST'});
    Report.create({content: 'Testing this'});
    Report.create({content: 'one two three'});
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
