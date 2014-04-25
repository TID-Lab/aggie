var express = require('express');
var http = require('http');
var socket = require('socket.io');
var passportSocketIo = require('passport.socketio');
var authentication = require('./authentication');
var _ = require('underscore');
var streamer = require('./streamer');
var Query = require('../../models/query');

module.exports = function(app, server, auth) {
  app = app || express();
  server = server || http.createServer(app);
  auth = auth || authentication;

  var io = socket.listen(server);

  io.configure(function() {
    io.enable('browser client minification');
    io.enable('browser client etag');
    io.enable('browser client gzip');
    io.set('log level', 1);
    // enable all transports (optional if you want flashsocket support, please note that some hosting
    // providers do not allow you to create servers that listen on a port different than 80 or their
    // default port)
    io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
  });

  // Authorize sockets
  io.set('authorization', passportSocketIo.authorize({
    cookieParser: express.cookieParser,
    key: auth.key,
    secret: auth.secret,
    store: auth.store,
    success: function(data, accept) {
      accept(null, true);
    }
  }));

  var queries = [];
  io.sockets.on('connection', function(socket) {
    var clientQuery;

    // Listen for query events from client
    socket.on('query', function(queryData) {
      // Remove client from all other queries to avoid multiple streams
      removeClient(socket.id);
      if (!queryData.keywords) return;
      clientQuery = new Query(queryData);
      // Keep a list of clients listening to each query
      var found = _.findWhere(queries, clientQuery.hash());
      if (found) {
        found.clients = _.union(found.clients, [socket.id]);
      } else {
        queries.push(_.extend(clientQuery.hash(), {clients: [socket.id]}));
        // Track query in streamer
        streamer.addQuery(clientQuery);
      }
    });

    // Remove client from query list
    socket.on('disconnect', function() {
      removeClient(socket.id);
    });

    // Send reports back to client for matching queries
    streamer.on('reports', function(query, reports) {
      // Determine if current client query matches the reports
      if (query === clientQuery.hash() && _.contains(clientQuery.clients, socket.id)) socket.emit('reports', reports);
    });
  });

  // Remove a client from listening to queries
  function removeClient(id) {
    queries.forEach(function(query) {
      query.clients = _.without(query.clients, id);
      // No more clients, destroy query
      if (!query.clients.length) {
        delete query.clients;
        streamer.removeQuery(query);
        queries = _.without(queries, query);
      }
    });
  }

  return app;
}
