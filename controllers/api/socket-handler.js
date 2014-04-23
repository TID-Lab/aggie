var express = require('express');
var http = require('http');
var socket = require('socket.io');
var streamer = require('./streamer');
var Query = require('../../models/query');

module.exports = function(app) {
  app = app || express();

  var server = http.createServer(app);
  var io = socket.listen(server);

  io.sockets.on('connection', function(socket) {
    var queries = [];

    // Listen for query events from client
    socket.on('query', function(queryData) {
      Query.getQuery(queryData, function(err, query) {
        streamer.addQuery(query);
        queries.push(query);
      });
    });

    // Send reports back to client for matching queries
    streamer.on('reports', function(query, reports) {
      var found = _.findWhere(queries, query);
      if (found) socket.emit('reports', reports);
    });
  });
}
