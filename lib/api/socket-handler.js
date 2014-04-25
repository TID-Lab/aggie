var express = require('express');
var http = require('http');
var socket = require('socket.io');
var passportSocketIo = require('passport.socketio');
var authentication = require('./authentication');
var _ = require('underscore');
var streamer = require('./streamer');
var Query = require('../../models/query');
var SocketQueryGroup = require('./socket-query-group');

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
    },
    fail: function(data, message, error, accept) {
      accept(null, auth.adminParty);
    }
  }));

  var queries = {};
  io.sockets.on('connection', function(socket) {
    var clientQuery, queryHash;

    // Listen for query events from client
    socket.on('query', function(queryData) {
      // Remove client from prior query to avoid multiple streams
      removeClient(queryHash, socket.id);
      // Instantiate and normalize client query
      clientQuery = (new Query(queryData)).normalize();
      // Track query and add client as listener
      queryHash = addClient(clientQuery, socket.id);
    });

    // Remove client from query list
    socket.on('disconnect', function() {
      removeClient(queryHash, socket.id);
    });

    // Send reports back to client for matching queries
    streamer.on('reports', function(query, reports) {
      // Determine if current client query matches the reports
      if (Query.compare(query, clientQuery) && queries[queryHash].has(socket.id)) {
        socket.emit('reports', reports);
      }
    });
  });

  // Add a client as a listener to a query
  function addClient(query, id) {
    if (!query || query === {}) return;
    var hash = Query.hash(query);
    // Store a list of clients listening to each query
    if (!_.has(queries, hash)) {
      queries[hash] = new SocketQueryGroup(query, id);
      // Track query in streamer
      streamer.addQuery(query);
    } else {
      queries[hash].add(id);
    }
    return hash;
  }

  // Remove a client from listening to queries
  function removeClient(hash, id) {
    if (!hash || !_.has(queries, hash)) return;
    queries[hash].remove(socket.id);
    // Destroy query if no clients are listening
    if (queries[hash].isEmpty()) {
      delete queries[hash];
      streamer.removeQuery(queries[hash].query);
    }
  }

  return server;
};
