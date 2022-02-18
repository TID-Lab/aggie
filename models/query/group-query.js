// Subclass of Query. Represents a query of the group collection.

var Group = require('../group');
var Query = require('../query');
var util = require('util');
var _ = require('underscore');

var GroupQuery = function(options) {
  options = options || {};
  this.title = options.title;
  this.locationName = options.locationName;
  this.assignedTo = options.assignedTo;
  this.closed = options.status == 'closed';
  this.veracity = options.veracity == 'Confirmed true' ? 'Confirmed True' : (options.veracity == 'Confirmed false' ? 'Confirmed False' : 'Unconfirmed');
  this.event = 'groups';
  this.tags = options.tags;
  this.idnum = options.idnum;
  this.creator = options.creator;
};

_.extend(GroupQuery, Query);
util.inherits(GroupQuery, Query);

GroupQuery.prototype.run = function(callback) {
  Group.queryGroups(this, callback);
};

// Normalize query for comparison
GroupQuery.prototype.normalize = function() {
  var query = _.pick(this, _.without(Group.filterAttributes, 'updatedAt'));
  if (query.title) query.title = query.title.toLowerCase();
  return query;
};

module.exports = GroupQuery;
