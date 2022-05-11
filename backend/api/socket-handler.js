// Listens for socket connections. Passes queries to streamer for monitoring.
// Watches for updates to sourceErrorCount
'use strict'
const cookieParser = require('cookie-parser');
const { Server: SocketIOServer, Socket } = require('socket.io');
const passportSocketIo = require('passport.socketio');
const _ = require('underscore');
const streamer = require('./streamer');
const Source = require('../models/source');
const Query = require('../models/query');
const ReportQuery = require('../models/query/report-query');
const GroupQuery = require('../models/query/group-query');
const SocketQueryGroup = require('./socket-query-group');
require('dotenv').config()
const util = require('util');
const EventEmitter = require('events').EventEmitter;

// override the emit function to add logging
var emit = Socket.prototype.emit;
Socket.prototype.emit = function(event, data) {
  console.debug(event, data);
  emit.apply(this, arguments);
};

var SocketHandler = function(app, server, auth) {
  this.app = app;
  this.server = server;
  this.auth = auth;
  this.queryGroups = {};
  this.io = new SocketIOServer(this.server);
  this._configureSocketIO();
  this.io.on('connect', this._connect.bind(this));

  // available listener bindings
  this.bindings = {
    report: this._addReportLocalListeners,
    sourceLocal: this._addSourceLocalListeners,
    source: this._addSourceListeners,
    trends: this._addTrendsListeners,
    stats: this._addStatsListeners,
    tag: this._addTagLocalListeners
  };

  // make socket instance accessible by child-process
  SocketHandler.instance = this;
};

util.inherits(SocketHandler, EventEmitter);

SocketHandler.prototype.addListeners = function(type, emitter) {
  if (!this.bindings[type]) return;
  this.bindings[type].call(this, emitter);
};

// Forward streamer data directly to client
SocketHandler.prototype.streamerSocketForward = function(event, socket) {
  streamer.removeAllListeners(event)
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
    if (!err) emitter.emit('sourceErrorCountUpdated', { unreadErrorCount: count });
  });
};

SocketHandler.prototype._configureSocketIO = function() {
  var self = this;
  var io = this.io;
  // Authorize sockets
  io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: self.auth.key,
    secret: self.auth.secret,
    store: self.auth.store,
    success: function(data, accept) {
      accept(null, true);
    },
    fail: function(data, message, error, accept) {
      if (process.env.ADMIN_PARTY.toLowerCase() === "true") accept(null, true);
      else accept(message, false);
    }
  }));
};

SocketHandler.prototype._connect = function(socket) {
  var self = this;

  this.clientQuery = null;
  this.emitAllErrorsCount(socket);

  this._streamerQueryListen('query', ReportQuery, socket);
  this._streamerQueryListen('groupQuery', GroupQuery, socket);
  this._streamerQueryCheck('reports', ReportQuery, socket);
  this._streamerQueryCheck('groups', GroupQuery, socket);

  this.streamerSocketForward('sourceErrorCountUpdated', socket);
  this.streamerSocketForward('trend', socket);

  // Send source updates back to client
  self.removeAllListeners('sourceErrorCountUpdated');
  self.on('sourceErrorCountUpdated', function() {
    self.emitAllErrorsCount(socket);
  });

  // Allow client to join a specific room
  socket.on('join', function(room) {
    socket.join(room);
    self.emit('join:' + room);
  });

  // Allow client to leave a specifc room
  socket.on('leave', function(room) {
    socket.leave(room);
    self.emit('leave:' + room);
  });

  // Remove client from query list
  socket.on('disconnect', function() {
    self.removeClient(self.clientQuery, socket.id);
  });
};

// Listen for query events from client
SocketHandler.prototype._streamerQueryListen = function(event, QueryType, socket) {
  var self = this;

  socket.on(event, function(queryData) {
    // Remove client from prior query to avoid multiple streams
    self.removeClient(self.clientQuery, socket.id);
    // Instantiate and normalize client query
    var query = new QueryType(queryData);
    self.clientQuery = query.normalize();
    // Track query and add client as listener

    self.clientQuery.hash = self.addClient(query, socket.id);
  });
};

// Send data back to client for matching queries
SocketHandler.prototype._streamerQueryCheck = function(event, QueryType, socket) {
  var self = this;
  streamer.removeAllListeners(event);
  streamer.on(event, function(query, data) {
    var clientQuery = self.clientQuery;
    // Determine if current client query matches the query
    if (QueryType.compare(query, new QueryType(clientQuery)) &&
      self.queryGroups[clientQuery.hash] &&
      self.queryGroups[clientQuery.hash].has(socket.id)) {
      socket.emit(event, data);
    }
  });
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

  // Send sources to client
  this.removeAllListeners('sources');
  this.on('sources', function(sources) {
    self.io.sockets.emit('sources', sources);
  });

  // Listens to updates to any source error count
  emitter.on('sourceErrorCountUpdated', function() {
    self.emit('sourceErrorCountUpdated');
  });
};

SocketHandler.prototype._addReportLocalListeners = function(emitter) {
  var self = this;
  emitter.on('report:updated', function(report) {
    self.io.sockets.in('reports').emit('report:updated', report);
  });
};

SocketHandler.prototype._addTagLocalListeners = function(emitter) {
  var self = this;
  emitter.on('tag:new', function(tag) {
    self.io.sockets.in('tags').emit('tag:new', tag);
  });
  emitter.on('tag:removed', function(id) {
    self.io.sockets.in('tags').emit('tag:removed', id);
  });
}

SocketHandler.prototype._addStatsListeners = function(emitter) {
  var self = this;
  emitter.on('stats', function(stats) {
    // emit data to stats rooom
    self.io.sockets.in('stats').emit('stats', stats);
  });
};

SocketHandler.prototype._addTrendsListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('trend');

  // Send trends to client
  this.removeAllListeners('trend');
  this.on('trend', function(trend) {
    self.io.sockets.emit('trend', trend);
  });

  // Listens to new trends being analyzed
  emitter.on('trend', function() {
    Trend.findPaginatedCounts(function(err, trends) {
      if (err) self.emit('error', err);
      else self.emit('trend', trends);
    });
  });
};

function emitAllSources(emitter) {
  Source.find({}, '-events', { lean: true }, function(err, sources) {
    if (!err && sources) emitter.emit('sources', sources);
  });
}


module.exports = SocketHandler;
