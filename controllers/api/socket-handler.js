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
      // Remove client from all other queries to avoid multiple streams
      removeClient(socket.id);
      clientQuery = (new Query(queryData)).normalize();
      if (clientQuery !== {}) {
        queryHash = Query.hash(clientQuery);
        // Keep a list of clients listening to each query
        if (_.has(queries, queryHash)) {
          queries[queryHash] = _.union(queries[queryHash], [socket.id]);
        } else {
          queries[queryHash] = [socket.id];
          // Track query in streamer
          streamer.addQuery(clientQuery);
        }
      }
    });

    // Remove client from query list
    socket.on('disconnect', function() {
      removeClient(socket.id);
    });

    // Send reports back to client for matching queries
    streamer.on('reports', function(query, reports) {
      // Determine if current client query matches the reports
      if (Query.compare(query, clientQuery) && _.contains(queries[queryHash], socket.id)) socket.emit('reports', reports);
    });
  });

  // Remove a client from listening to queries
  function removeClient(id) {
    _.each(queries, function(clients, hash) {
      queries[hash] = _.without(clients, id);
      // No more clients, destroy query
      if (!queries[hash].length) {
        delete queries[hash];
        streamer.removeQuery(Query.unhash(hash));
      }
    });
  }

  return app;
}
