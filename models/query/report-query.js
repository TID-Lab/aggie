// Subclass of Query. Represents a query of the report collection.
'use strict';

var Report = require('../report');
var Query = require('../query');
var util = require('util');
var _ = require('lodash');
const Expression = require("./query_helper/expression");

function ReportQuery(options) {
  options = options || {};
  this.keywords = options.keywords;

  if (options.status) {
    this._parseStatus(options.status);
  }

  this._parseIncidentId(options.incidentId);

  this.after = options.after;
  this.before = options.before;
  this.sourceId = options.sourceId;
  this.media = options.media;
  this.author = options.author;
  this.event = 'reports';
  this.tags = options.tags;
  this.list = options.list;
  this.commentTo = options.commentTo;
  this.escalated = options.escalated;
  this.notes = options.notes;
}

_.extend(ReportQuery, Query);
util.inherits(ReportQuery, Query);

ReportQuery.prototype.run = function(callback) {
  Report.queryReports(this, function(err, results) {
    callback(err, results);
  });
};

// Normalize query for comparison
ReportQuery.prototype.normalize = function() {
  return _.pick(this, ['keywords', 'status', 'after', 'before', 'sourceId', 'media', 'incidentId', 'author', 'list', 'tags', 'escalated', 'notes']);
};

ReportQuery.prototype.toMongooseFilter = function() {
  var filter = {
    _sources: this.sourceId,
    _media: this.media,
    _incident: this.incidentId,
    read: this.read,
    commentTo: this.commentTo,
    escalated: this.escalated,
    notes: this.notes
  }
  if (this.escalated === 'unescalated') filter.escalated= false;
  if (this.escalated === 'escalated') filter.escalated = true;

  filter = _.omitBy(filter, _.isNil);
  if (this.before)    filter.authoredAt = { $lte: this.before }
  if (this.after)     filter.authoredAt = Object.assign({}, filter.authoredAt, { $gte: this.after });
  //Two step search for content/author. First search for any terms in content or author using the indexed $text search.
  //Second step is to match exact phrase using regex in the returned superset of the documents from first step.
  // if (this.author || this.keywords) filter.author = [{$text: { $search: `${this.author || ""}` }}];
  if (this.author)    filter.author = {$regex: this.author, $options: 'si'};
  // if (this.keywords)  filter.$and.push({"content": {$regex: this.keywords, $options: 'si'}});

  if (this.keywords) {
    // Replace non-operator spacing with @ to support perfect match
    this.keywords = this.keywords.replace(/\s+/gi, "@")
    // Replace ! with NOT
    this.keywords = this.keywords.replace(/@!@/g, " NOT ");
    // Replace 1 or more & with just AND
    this.keywords = this.keywords.replace(/@&+@/g, " AND ")
    // Replace 1 or more | with just OR
    this.keywords = this.keywords.replace(/@\|+@/g, " OR ")

    // Re-add space around operators
    this.keywords = this.keywords.replace(/@*NOT@*/g, " NOT ");
    this.keywords = this.keywords.replace(/@*AND@*/g, " AND ")
    this.keywords = this.keywords.replace(/@*OR@*/g, " OR ")
    this.keywords = this.keywords.replace(/\s+/gi, " ")
    // Replace " with whitespace, for perfect match
    this.keywords = this.keywords.replace(/\"/g, "@")
    this.keywords =this. keywords.replace(/'/g, "\'")

    console.log(this.keywords.toString())
      // Convert raw query into nested logical array, e.g (Amhara OR Oromo) AND Ethiopia => [ 'AND', [ 'OR', 'Amhara', 'Oromo' ], 'Ethiopia' ]
      let exp = new Expression(this.keywords.toString());
    console.log(exp)

      // Convert the nested logical array into the approriate mongo query with $and, $or and $not
      let res = exp.generate_seach_query();
      console.log(JSON.stringify(res))
      filter.$and = [res]
    }

  if (this.tags)      filter.smtcTags = { $all: this.tags }
  if (this.list)      filter["metadata.ct_tag"] = {$in: [this.list] }
  console.log(filter)
  return filter;
};

ReportQuery.prototype._parseStatus = function(status) {
  switch (status) {
  case 'Read':
    this.read = true;
    break;
  case 'Unread':
    this.read = false;
    break;
  }
};

ReportQuery.prototype._parseIncidentId = function(incidentId) {
  if (incidentId === 'any') {
    this.incidentId = { $nin: [null, ''] };
  } else if (incidentId === 'none') {
    this.incidentId = { $in: [null, ''] };
  } else {
    this.incidentId = incidentId;
  }
};

module.exports = ReportQuery;
