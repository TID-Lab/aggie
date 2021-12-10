// A report is a single post/comment/article or other chunk of data from a source.
// This class is responsible for executing ReportQuerys.
'use strict';

var database = require('../lib/database');
var mongoose = database.mongoose;
var Schema = mongoose.Schema;
var SchemaTypes = mongoose.SchemaTypes;
var logger = require('../lib/logger');
var Report = require('../models/report');
var _= require('lodash')

var schema = new Schema({
    storedAt: { type: Date, index: true },
    author: { type: String, index: true },
    reports: {"type": [{ type: Schema.ObjectId, ref: 'Report', index: true }], "default": []},
    simScores: [{"author": { type: Schema.ObjectId, ref: 'Author', index: true }, "score": Number}]
});

// Add fulltext index to the `content` and `author` field.
schema.index({  author: 'text' });

schema.pre('save', function(next) {
    if (this.isNew) {
        this._wasNew = true;
        // Set default storedAt.
        if (!this.storedAt) this.storedAt = new Date();

    }
    next();
});

// Emit information about updates after saving report
schema.post('save', function() {
    if (this._wasNew) schema.emit('reportAuthor:new', { _id: this._id.toString() });
    if (!this._wasNew) schema.emit('reportAuthor:updated', this);

});


var ReportAuthor = mongoose.model('ReportAuthor', schema);

module.exports = ReportAuthor;
