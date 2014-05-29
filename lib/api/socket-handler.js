var express = require('express');
var http = require('http');
var socket = require('socket.io');
var passportSocketIo = require('passport.socketio');
var authentication = require('./authentication');
var _ = require('underscore');
var streamer = require('./streamer');
var Source = require('../../models/source');
var Query = require('../../models/query');
var SocketQueryGroup = require('./socket-query-group');
var fetchingController = require('./v1/fetching-controller');
var Trend = require('../../models/trend');

var SocketHandler = function(app, server, auth) {
  app = app || express();
  server = server || http.createServer(app);
  auth = auth || authentication(app);

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
      if (auth.adminParty) accept(null, true);
      else accept(message, false);
    }
  }));

  var queryGroups = {};
  io.sockets.on('connection', function(socket) {
    var clientQuery;

    emitAllErrorsCount(socket);

    // Listen for query events from client
    socket.on('query', function(queryData) {
      // Remove client from prior query to avoid multiple streams
      removeClient(clientQuery, socket.id);
      // Instantiate and normalize client query
      clientQuery = (new Query(queryData)).normalize();
      // Track query and add client as listener
      clientQuery.hash = addClient(clientQuery, socket.id);
    });

    // Remove client from query list
    socket.on('disconnect', function() {
      removeClient(clientQuery, socket.id);
    });

    // Send reports back to client for matching queries
    streamer.on('reports', function(query, reports) {
      // Determine if current client query matches the reports
      if (Query.compare(query, clientQuery) && queryGroups[clientQuery.hash].has(socket.id)) {
        socket.emit('reports', reports);
      }
    });

    // Send source updates back to client
    streamer.on('sourceErrorCountUpdated', function(source) {
      socket.emit('sourceErrorCountUpdated', source);
    });

    // Send report status updates to client
    streamer.on('reportStatusChanged', function(report) {
      socket.emit('reportStatusChanged', report);
    });

    // Send trends to client
    streamer.on('trend', function(trend) {
      socket.emit('trend', trend);
    });

    // Send fetching status to the client
    fetchingController.on('fetching:start', function() {
      socket.emit('fetchingStatusUpdate', {fetching: true});
    });
    fetchingController.on('fetching:stop', function() {
      socket.emit('fetchingStatusUpdate', {fetching: false});
    });
  });

  // Add a client as a listener to a query
  function addClient(query, id) {
    if (!query || query === {}) return;
    var hash = query.hash || Query.hash(query);
    // Store a list of clients listening to each query
    if (!_.has(queryGroups, hash)) {
      queryGroups[hash] = new SocketQueryGroup(query, id);
      // Track query in streamer
      streamer.addQuery(query);
    } else {
      queryGroups[hash].add(id);
    }
    return hash;
  }

  // Remove a client from listening to queries
  function removeClient(query, id) {
    if (!query || !query.hash || !_.has(queryGroups, query.hash)) return;
    queryGroups[query.hash].remove(socket.id);
    // Destroy query if no clients are listening
    if (queryGroups[query.hash].isEmpty()) {
      delete queryGroups[query.hash];
      streamer.removeQuery(query);
    }
  }

  server.addListeners = function(type, emitter) {
    switch (type) {
      case 'source':
        _addSourceListeners(emitter, socket);
        break;
      case 'trends':
        _addTrendsListeners(emitter, socket);
        break;
    }
  };

  return server;
};

function _addSourceListeners(emitter, socket) {
  // Clean-up old listeners
  emitter.removeAllListeners('sourceErrorCountUpdated');

  // Listens to new reports being written to the database
  emitter.on('sourceErrorCountUpdated', function() {
    emitAllErrorsCount(socket);
  });
}

function _addTrendsListeners(emitter, socket) {
  // Clean-up old listeners
  emitter.removeAllListeners('trend');

  // Listens to new trends being analyzed
  emitter.on('trend', function(trend) {
    Trend.findPageById(trend._id, function(err, trend) {
      if (err) socket.emit('error', err);
      else socket.emit('trend', trend);
    });
  });
}

function emitAllErrorsCount(emitter) {
  // Send total error counts on client connect
  Source.countAllErrors(function(err, count) {
    if (!err) emitter.emit('sourceErrorCountUpdated', {unreadErrorCount: count});
  });
}

module.exports = SocketHandler;
