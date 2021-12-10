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
    // The two reports compared
    reports: {"type": [{ type: Schema.ObjectId, ref: 'Report', index: true }], "default": []},
    score: {"type": Number, "default": 0}
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

var ReportSimScore = mongoose.model('ReportSimScore', schema);

module.exports = ReportSimScore;
