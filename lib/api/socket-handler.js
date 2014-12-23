// Listens for socket connections. Passes queries to streamer for monitoring.
// Watches for updates to sourceErrorCount

var express = require('express');
var http = require('http');
var socketIo = require('socket.io');
var passportSocketIo = require('passport.socketio');
var authentication = require('./authentication');
var _ = require('underscore');
var streamer = require('./streamer');
var Source = require('../../models/source');
var Query = require('../../models/query');
var ReportQuery = require('../../models/query/report-query');
var IncidentQuery = require('../../models/query/incident-query');
var SocketQueryGroup = require('./socket-query-group');
var fetchingController = require('./v1/fetching-controller');
var Trend = require('../../models/trend');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var SocketHandler = function(app, server, auth) {
  this.app = app || express();
  this.server = server || http.createServer(app);
  this.auth = auth || authentication(app);

  this.queryGroups = {};

  this.io = socketIo.listen(this.server);
  this._configureSocketIO();

  var self = this;
  this.io.sockets.on('connection', function(socket) {
    var clientQuery;

    self.emitAllErrorsCount(socket);

    _streamerQueryListen('query', ReportQuery);
    _streamerQueryListen('incidentQuery', IncidentQuery);

    _streamerQueryCheck('reports', ReportQuery);
    _streamerQueryCheck('incidents', IncidentQuery);

    self.streamerSocketForward('sourceErrorCountUpdated', socket);
    self.streamerSocketForward('reportStatusChanged', socket);
    self.streamerSocketForward('reportIncidentChanged', socket);
    self.streamerSocketForward('trend', socket);

    // Send fetching status to the client
    socket.emit('fetchingStatusUpdate', {fetching: false});
    fetchingController.on('fetching:start', function() {
      socket.emit('fetchingStatusUpdate', {fetching: true});
    });
    fetchingController.on('fetching:stop', function() {
      socket.emit('fetchingStatusUpdate', {fetching: false});
    });

    // Send source updates back to client
    self.on('sourceErrorCountUpdated', function() {
      self.emitAllErrorsCount(socket);
    });

    // Send sources to client
    self.on('sources', function(sources) {
      socket.emit('sources', sources);
    });

    // Send trends to client
    self.on('trend', function(trend) {
      socket.emit('trend', trend);
    });

    // Remove client from query list
    socket.on('disconnect', function() {
      self.removeClient(clientQuery, socket.id);
    });

    // Listen for query events from client
    function _streamerQueryListen(event, QueryType) {
      socket.on(event, function(queryData) {
        // Remove client from prior query to avoid multiple streams
        self.removeClient(clientQuery, socket.id);
        // Instantiate and normalize client query
        var query = new QueryType(queryData);
        clientQuery = query.normalize();
        // Track query and add client as listener
        clientQuery.hash = self.addClient(query, socket.id);
      });
    }

    // Send data back to client for matching queries
    function _streamerQueryCheck(event, QueryType) {
      streamer.on(event, function(query, data) {
        // Determine if current client query matches the query
        if (QueryType.compare(query, new QueryType(clientQuery)) && self.queryGroups[clientQuery.hash] && self.queryGroups[clientQuery.hash].has(socket.id)) {
          socket.emit(event, data);
        }
      });
    }
  });
};

util.inherits(SocketHandler, EventEmitter);

SocketHandler.prototype.addListeners = function(type, emitter) {
  switch (type) {
    case 'sourceLocal':
      this._addSourceLocalListeners(emitter);
      break;
    case 'source':
      this._addSourceListeners(emitter);
      break;
    case 'trends':
      this._addTrendsListeners(emitter);
      break;
  }
};

// Forward streamer data directly to client
SocketHandler.prototype.streamerSocketForward = function(event, socket) {
  streamer.on(event, function(data) {
    socket.emit(event, data);
  });
};

// Add a client as a listener to a query
SocketHandler.prototype.addClient = function(query, id) {
  if (!query || query === {}) return;
  var hash = query.hash || Query.hash(query);
  // Store a list of clients listening to each query
  if (!_.has(this.queryGroups, hash)) {
    this.queryGroups[hash] = new SocketQueryGroup(query, id);
    // Track query in streamer
    streamer.addQuery(query);
  } else {
    this.queryGroups[hash].add(id);
  }
  return hash;
};

// Remove a client from listening to queries
SocketHandler.prototype.removeClient = function(query, id) {
  if (!query || !query.hash || !_.has(this.queryGroups, query.hash)) return;
  this.queryGroups[query.hash].remove(id);
  // Destroy query if no clients are listening
  if (this.queryGroups[query.hash].isEmpty()) {
    delete this.queryGroups[query.hash];
    streamer.removeQuery(query);
  }
};

SocketHandler.prototype.emitAllErrorsCount = function(emitter) {
  // Send total error counts on client connect
  Source.countAllErrors(function(err, count) {
    if (!err) emitter.emit('sourceErrorCountUpdated', {unreadErrorCount: count});
  });
};

SocketHandler.prototype._configureSocketIO = function() {
  var self = this;
  var io = this.io;
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
    key: self.auth.key,
    secret: self.auth.secret,
    store: self.auth.store,
    success: function(data, accept) {
      accept(null, true);
    },
    fail: function(data, message, error, accept) {
      if (self.auth.adminParty) accept(null, true);
      else accept(message, false);
    }
  }));
};

SocketHandler.prototype._addSourceLocalListeners = function(emitter) {
  var self = this;

  // Listens to changes in source metadata
  emitter.on('source:save', function() {
    emitAllSources(self);
  });
  emitter.on('source:remove', function() {
    process.nextTick(function() {
      emitAllSources(self);
    });
  });

  // Listens to updates to any source error count
  emitter.on('sourceErrorCountUpdated', function() {
    self.emit('sourceErrorCountUpdated');
  });
};

SocketHandler.prototype._addSourceListeners = function(emitter) {
  var self = this;

  // Listens to changes in source metadata
  emitter.on('source:save', function() {
    emitAllSources(self);
  });
  emitter.on('source:remove', function() {
    process.nextTick(function() {
      emitAllSources(self);
    });
  });

  // Listens to updates to any source error count
  emitter.on('sourceErrorCountUpdated', function() {
    self.emit('sourceErrorCountUpdated');
  });
};

function emitAllSources(emitter) {
  Source.find({}, '-events', {lean: true}, function(err, sources) {
    if (!err && sources) emitter.emit('sources', sources);
  });
}

SocketHandler.prototype._addTrendsListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('trend');

  // Listens to new trends being analyzed
  emitter.on('trend', function() {
    Trend.findPaginatedCounts(function(err, trends) {
      if (err) self.emit('error', err);
      else self.emit('trend', trends);
    });
  });
};

module.exports = function(app, server, auth) {
  return new SocketHandler(app, server, auth);
};
