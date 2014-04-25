var _ = require('underscore');

var SocketQueryGroup = function(query, client) {
  this.query = query;
  this.clients = [];
  if (client) this.add(client);
};

SocketQueryGroup.prototype.add = function(client) {
  this.clients = _.union(this.clients, [client]);
};

SocketQueryGroup.prototype.remove = function(client) {
  this.clients = _.without(this.clients, client);
  return this.isEmpty();
};

SocketQueryGroup.prototype.has = function(client) {
  return _.contains(this.clients, client);
};

SocketQueryGroup.prototype.isEmpty = function() {
  return this.clients.length === 0;
};

module.exports = SocketQueryGroup;
